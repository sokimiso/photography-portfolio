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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('categories') categories: string,
    @Body('tags') tags: string,
  ) {
    return this.photosService.uploadPhoto(file, title, description, categories, tags);
  }

  @Get('category/:categoryName')
  async getPhotosByCategory(@Param('categoryName') categoryName: string) {
    return this.photosService.getPhotosByCategory(categoryName);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/visibility')
  async toggleVisibility(@Param('id') id: string, @Body('isVisible') isVisible: boolean) {
    return this.photosService.toggleVisibility(id, isVisible);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePhoto(@Param('id') id: string) {
    return this.photosService.deletePhoto(id);
  }
}
