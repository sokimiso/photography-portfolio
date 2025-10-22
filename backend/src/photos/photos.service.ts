import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { promises as fs } from 'fs';
import { join } from 'path';
import slugify from 'slugify';
import { generateResponsiveImages } from '../utils/photos.utils';

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  async uploadPhoto(
    file: Express.Multer.File,
    uploadedBy: string,
    title?: string,
    description?: string,
    categories?: string,
    tags?: string,
  ) {
    if (!file) throw new InternalServerErrorException('No file uploaded');

    const categoryName = categories?.trim() || 'uncategorized';
    const safeCategory = slugify(categoryName, { lower: true, strict: true });

    // Directories
    const categoryDir = join(process.cwd(), 'public', safeCategory);
    const tmpDir = join(process.cwd(), 'public', 'tmp');

    try {
      await fs.mkdir(categoryDir, { recursive: true });
      await fs.mkdir(tmpDir, { recursive: true });

      // Move original file from Multer tmp to category folder
      const targetPath = join(categoryDir, file.filename);
      await fs.rename(file.path, targetPath);

      // Generate responsive images in temp folder
      const tempSizes = await generateResponsiveImages(
        targetPath,
        tmpDir,
        file.filename,
      );

      // Move generated images to final category folders
      const thumbsDir = join(categoryDir, 'thumbs');
      const mediumDir = join(categoryDir, 'medium');
      const largeDir = join(categoryDir, 'large');

      await fs.mkdir(thumbsDir, { recursive: true });
      await fs.mkdir(mediumDir, { recursive: true });
      await fs.mkdir(largeDir, { recursive: true });

      const finalThumbnailPath = join(thumbsDir, file.filename);
      const finalMediumPath = join(mediumDir, file.filename);
      const finalLargePath = join(largeDir, file.filename);

      await fs.rename(tempSizes.thumbnail, finalThumbnailPath);
      await fs.rename(tempSizes.medium, finalMediumPath);
      await fs.rename(tempSizes.large, finalLargePath);

      // Store photo with URLs in DB
      const photo = await this.prisma.photo.create({
        data: {
          url: `/public/${safeCategory}/${file.filename}`,
          thumbnailUrl: `/public/${safeCategory}/thumbs/${file.filename}`,
          mediumUrl: `/public/${safeCategory}/medium/${file.filename}`,
          largeUrl: `/public/${safeCategory}/large/${file.filename}`,
          title,
          description,
          uploadedBy,
        },
      });

      // Handle category mappings
      const categoryNames = categoryName.split(',').map((c) => c.trim());
      for (const name of categoryNames) {
        const category = await this.prisma.photoCategory.upsert({
          where: { name },
          update: {},
          create: { name },
        });
        await this.prisma.photoCategoryMap.create({
          data: { photoId: photo.id, categoryId: category.id },
        });
      }

      // Handle tag mappings
      const tagNames = tags
        ? tags
            .split(/[,\s]+/)
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      for (const name of tagNames) {
        const tag = await this.prisma.photoTag.upsert({
          where: { name },
          update: {},
          create: { name },
        });
        await this.prisma.photoTagMap.create({
          data: { photoId: photo.id, tagId: tag.id },
        });
      }

      return photo;
    } catch (err) {
      // Cleanup any partially created files
      console.error('Upload failed:', err);
      try {
        await fs.unlink(file.path).catch(() => {});
      } catch {}
      try {
        await fs.unlink(join(categoryDir, file.filename)).catch(() => {});
      } catch {}
      throw new InternalServerErrorException('Failed to upload photo');
    }
  }

  async getAllCategories() {
    const category = await this.prisma.photoCategory.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return category;
  }

  async getAllTags() {
    const category = await this.prisma.photoTag.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return category;
  }

  async getPhotosByCategory(
    categoryName: string,
    cursor?: string,
    limit = 30,
    showAll = false, // <-- new flag
  ) {
    // 1. Find the category
    const category = await this.prisma.photoCategory.findFirst({
      where: {
        name: categoryName,
        deletedAt: null,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // 2. Fetch photos via PhotoCategoryMap
    const photoMappings = await this.prisma.photoCategoryMap.findMany({
      where: {
        categoryId: category.id,
        photo: {
          deletedAt: null,
          ...(showAll ? {} : { isVisible: true }), // only filter if not showing all
        },
      },
      include: {
        photo: {
          include: {
            tags: { include: { tag: true } },
          },
        },
      },
      take: limit + 1,
      ...(cursor
        ? {
            skip: 1,
            cursor: {
              photoId_categoryId: { photoId: cursor, categoryId: category.id },
            },
          }
        : {}),
    });

    const photos = photoMappings.map((map) => ({
      ...map.photo,
      tags: map.photo.tags.map((t) => t.tag),
    }));

    const hasMore = photos.length > limit;
    const nextCursor = hasMore ? photos[limit - 1].id : null;

    return {
      photos: photos.slice(0, limit),
      nextCursor,
      hasMore,
    };
  }

  async getPhotosByTag(tagName: string) {
    const tag = await this.prisma.photoTag.findUnique({
      where: { name: tagName },
      include: {
        photos: {
          include: {
            photo: {
              include: {
                tags: {
                  include: {
                    tag: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tag) throw new NotFoundException('Tag not found');

    return tag.photos.map((map) => ({
      ...map.photo,
      tags: map.photo.tags.map((t) => t.tag),
    }));
  }

  async toggleVisibility(id: string, isVisible: boolean) {
    return this.prisma.photo.update({
      where: { id },
      data: { isVisible },
    });
  }

  async updatePhotoTags(photoId: string, tags: string[]) {
    // Remove old mappings
    await this.prisma.photoTagMap.deleteMany({ where: { photoId } });

    // Upsert new tags
    for (const name of tags) {
      const tag = await this.prisma.photoTag.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      await this.prisma.photoTagMap.create({
        data: { photoId, tagId: tag.id },
      });
    }
    return { success: true };
  }

  async deletePhoto(id: string) {
    return this.prisma.photo.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hardDeletePhoto(id: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException('Photo not found');

    // Delete mappings
    await this.prisma.photoTagMap.deleteMany({ where: { photoId: id } });
    await this.prisma.photoCategoryMap.deleteMany({ where: { photoId: id } });

    // Delete all image files from disk
    const urlsToDelete = [
      photo.url,
      photo.thumbnailUrl,
      photo.mediumUrl,
      photo.largeUrl,
    ].filter(Boolean) as string[];

    for (const url of urlsToDelete) {
      // Remove leading slash if present
      const relativePath = url.startsWith('/') ? url.slice(1) : url;
      const filePath = join(process.cwd(), relativePath);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('File not found on disk, skipping:', filePath);
      }
    }

    // Delete photo from DB
    return this.prisma.photo.delete({ where: { id } });
  }

  async findOrCreateCategory(name: string) {
    return this.prisma.photoCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  async findOrCreateTag(name: string) {
    return this.prisma.photoTag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  async getAllPublicCategoriesWithPhotos() {
    const categories = await this.prisma.photoCategory.findMany({
      where: {
        isPublic: true,
        deletedAt: null,
        photos: {
          some: {
            photo: {
              isVisible: true,
              deletedAt: null,
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  async getPublicTagsForCategory(categoryName: string) {
    const category = await this.prisma.photoCategory.findUnique({
      where: { name: categoryName },
      include: {
        photos: {
          where: {
            photo: { isVisible: true, deletedAt: null },
          },
          include: {
            photo: {
              include: {
                tags: {
                  where: {
                    tag: { isPublic: true, deletedAt: null },
                  },
                  include: { tag: true },
                },
              },
            },
          },
        },
      },
    });

    if (!category) return [];

    // Extract unique tags
    const tagsMap: Record<
      string,
      { id: string; name: string; friendlyName?: string }
    > = {};

    category.photos.forEach((map) => {
      map.photo.tags.forEach((t) => {
        tagsMap[t.tag.id] = {
          id: t.tag.id,
          name: t.tag.name,
          friendlyName: t.tag.friendlyName || undefined,
        };
      });
    });

    return Object.values(tagsMap);
  }

  // ------------------ Category Management ------------------
  async createCategory(data: {
    name: string;
    friendlyName?: string;
    isPublic?: boolean;
    description?: string;
  }) {
    return this.prisma.photoCategory.create({ data });
  }

  async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      friendlyName: string;
      isPublic: boolean;
      description: string;
    }>,
  ) {
    return this.prisma.photoCategory.update({ where: { id }, data });
  }

  async hardDeleteCategory(id: string) {
    // Remove all photo mappings
    await this.prisma.photoCategoryMap.deleteMany({
      where: { categoryId: id },
    });
    // Delete category itself
    await this.prisma.photoCategory.delete({ where: { id } });
    return { success: true };
  }

  // ------------------ Tag Management ------------------
  async createTag(data: {
    name: string;
    friendlyName?: string;
    isPublic?: boolean;
  }) {
    return this.prisma.photoTag.create({ data });
  }

  async updateTag(
    id: string,
    data: Partial<{ name: string; friendlyName: string; isPublic: boolean }>,
  ) {
    return this.prisma.photoTag.update({ where: { id }, data });
  }

  async updatePhotoTitle(id: string, data: Partial<{ title: string }>) {
    return this.prisma.photo.update({ where: { id }, data });
  }

  async hardDeleteTag(id: string) {
    // Remove all photo mappings
    await this.prisma.photoTagMap.deleteMany({ where: { tagId: id } });
    // Delete tag itself
    await this.prisma.photoTag.delete({ where: { id } });
    return { success: true };
  }
}
