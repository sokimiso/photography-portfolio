import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../common/types/auth-request.type';

@Controller('api/photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        // Destination: always upload to a temporary fallback folder
        destination: join(process.cwd(), 'public', 'tmp'),
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('categories') categories: string,
    @Body('tags') tags: string,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new Error('User not found in request');

    // Pass file to service — the service will move it to the correct category folder
    return this.photosService.uploadPhoto(
      file,
      userId,
      title,
      description,
      categories,
      tags,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('hard/:id')
  async hardDelete(@Param('id') id: string) {
    return this.photosService.hardDeletePhoto(id);
  }

  @Get('categories')
  async getAllCategories() {
    return this.photosService.getAllCategories();
  }

  @Get('category/:categoryName')
  async getPhotosByCategory(
    @Param('categoryName') categoryName: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = '30',
  ) {
    return this.photosService.getPhotosByCategory(categoryName, cursor, +limit);
  }

  @Get('tags')
  async getAllTags() {
    return this.photosService.getAllTags();
  }

  @Get('tag/:tagName')
  async getPhotosByTag(@Param('tagName') tagName: string) {
    return this.photosService.getPhotosByTag(tagName);
  }

  @Get('publicCategories')
  async getAllPublicCategories() {
    return this.photosService.getAllPublicCategoriesWithPhotos();
  }

  @Get('publicCategory/:categoryName/tags')
  async getTagsForCategory(@Param('categoryName') categoryName: string) {
    return this.photosService.getPublicTagsForCategory(categoryName);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/visibility')
  async toggleVisibility(
    @Param('id') id: string,
    @Body('isVisible') isVisible: boolean,
  ) {
    return this.photosService.toggleVisibility(id, isVisible);
  }

  @Put(':id/tags')
  async updateTags(@Param('id') id: string, @Body('tags') tags: string[]) {
    return this.photosService.updatePhotoTags(id, tags);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePhoto(@Param('id') id: string) {
    return this.photosService.deletePhoto(id);
  }
}
