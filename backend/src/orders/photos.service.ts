import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';


@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  async uploadPhoto(
    file: Express.Multer.File,
    orderId: string,
    uploadedBy: string,
    title?: string
  ) {
    if (!file) throw new BadRequestException('No file provided');

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    const orderYear = order.readableOrderNumber.slice(0, 4);
    const uploadDir = path.join(process.cwd(), 'frontend/public/uploads', orderYear, order.readableOrderNumber);
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.originalname);
    const shortId = uuidv4().split('-')[0];
    const sanitizedTitle = (title || 'photo').replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${new Date().toISOString().split('T')[0].replace(/-/g, '')}_${shortId}_${sanitizedTitle}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Write file
    await fs.writeFile(filepath, file.buffer);

    // Relative path to store in DB
    const relativePath = `/uploads/${orderYear}/${order.readableOrderNumber}/${filename}`;

    // Create photo record
    const photo = await this.prisma.photo.create({
      data: {
        url: relativePath, // store relative path
        title: title || null,
        uploadedBy,
      },
    });

    // Link photo to order
    await this.prisma.orderPhoto.create({
      data: {
        orderId: order.id,
        photoId: photo.id,
      },
    });

    return {
      ...photo,
      url: this.getFullUrl(photo.url), // return full URL to frontend
    };
  }

  // Utility to prepend domain
  getFullUrl(relativePath: string) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${relativePath}`;
  }

  async updatePhoto(photoId: string, data: Partial<{ title: string; description: string; isPublic: boolean; isVisible: boolean; deletedAt: Date | null }>) {
    return this.prisma.photo.update({
      where: { id: photoId },
      data,
    });
  }

  async updateOrderPhoto(orderPhotoId: string, data: Partial<{ isFinalDelivery: boolean; toPostprocess: boolean; toPrint: boolean }>) {
    return this.prisma.orderPhoto.update({
      where: { id: orderPhotoId },
      data,
    });
  }

  async getPhotosByOrder(orderId: string) {
    const photos = await this.prisma.orderPhoto.findMany({
      where: { orderId },
      include: { photo: true },
      orderBy: { photo: { createdAt: 'desc' } },
    });

    return photos.map(p => ({
      ...p,
      photo: {
        ...p.photo,
        url: this.getFullUrl(p.photo.url), // return full URL
      }
    }));
  }
}
