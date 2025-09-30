import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const packages = await this.prisma.photoshootPackage.findMany({
      where: { deletedAt: null },
      select: {          
          id: true,
          internalName: true,
          displayName: true,
          basePrice: true,
          durationHrs: true,
          maxPhotos: true, },
    });
    return { packages };
  }
}



