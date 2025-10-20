import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { promises as fs } from 'fs';
import { join } from 'path';
import slugify from 'slugify';

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
    if (!file) throw new Error('No file uploaded');

    // Normalize category
    const categoryName = categories?.trim() || 'uncategorized';
    const safeCategory = slugify(categoryName, { lower: true, strict: true });

    // Define source and target paths
    const tmpPath = file.path; // uploaded to tmp by Multer
    const targetDir = join(process.cwd(), 'public', safeCategory);
    const targetPath = join(targetDir, file.filename);

    // Ensure category folder exists
    try {
      await fs.mkdir(targetDir, { recursive: true });
    } catch (err) {
      console.error('Error creating category folder', err);
      throw err;
    }

    // Move file from tmp to category folder
    try {
      await fs.rename(tmpPath, targetPath);
    } catch (err) {
      console.error('Error moving file to category folder', err);
      throw err;
    }

    // Store the relative URL in DB
    const url = `/public/${safeCategory}/${file.filename}`;

    const photo = await this.prisma.photo.create({
      data: {
        url,
        title,
        description,
        uploadedBy,
      },
    });

    // Handle categories and tags mapping
    const categoryNames = categoryName.split(',').map((c) => c.trim());
    const tagNames = tags ? tags.split(',').map((t) => t.trim()) : [];

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

  async getPhotosByCategory(categoryName: string) {
    const category = await this.prisma.photoCategory.findUnique({
      where: {
        name: categoryName,
        deletedAt: null,
      },
      include: { photos: { include: { photo: true } } }, // include related photos
    });

    if (!category) throw new NotFoundException('Category not found');

    return category.photos
      .map((map) => map.photo)
      .filter((photo) => !photo.deletedAt);
  }

  async getPhotosByTag(tagName: string) {
    const tag = await this.prisma.photoTag.findUnique({
      where: { name: tagName },
      include: { photos: { include: { photo: true } } },
    });

    if (!tag) throw new NotFoundException('Tag not found');

    return tag.photos.map((map) => map.photo);
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

    // Delete the file from disk
    if (photo.url) {
      // Remove leading slash if present
      const relativePath = photo.url.startsWith('/')
        ? photo.url.slice(1)
        : photo.url;
      const filePath = join(process.cwd(), relativePath);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('File not found on disk:', filePath);
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
}
