import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  async uploadPhoto(
    file: Express.Multer.File,
    title?: string,
    description?: string,
    categories?: string,
    tags?: string,
  ) {
    // temporary local file path (replace with S3 or Cloudinary)
    const url = `/uploads/${file.filename}`;

    const photo = await this.prisma.photo.create({
      data: {
        url,
        title,
        description,
        uploadedBy: 'ADMIN', // Replace with user.id from JWT
      },
    });

    // categories and tags are comma-separated strings
    const categoryNames = categories ? categories.split(',').map((c) => c.trim()) : [];
    const tagNames = tags ? tags.split(',').map((t) => t.trim()) : [];

    // connect or create categories
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

    // connect or create tags
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

  async getPhotosByCategory(categoryName: string) {
    const category = await this.prisma.photoCategory.findUnique({
      where: { name: categoryName },
      include: { photos: { include: { photo: true } } }, // include related photos
    });

    if (!category) throw new NotFoundException('Category not found');

    return category.photos.map((map) => map.photo)
      .filter((photo) => !photo.deletedAt && photo.isVisible);
  }

  async toggleVisibility(id: string, isVisible: boolean) {
    return this.prisma.photo.update({
      where: { id },
      data: { isVisible },
    });
  }

  async deletePhoto(id: string) {
    return this.prisma.photo.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
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

  async getPhotosByTag(tagName: string) {
    const tag = await this.prisma.photoTag.findUnique({
      where: { name: tagName },
      include: { photos: { include: { photo: true } } },
    });

    if (!tag) throw new NotFoundException('Tag not found');

    return tag.photos.map((map) => map.photo);
  }  

}
