import { Controller, Post, UseInterceptors, UploadedFile, Body, Put, Get, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';


@Controller('api/orders/photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body('orderId') orderId: string,
    @Body('uploadedBy') uploadedBy: string,
    @Body('title') title?: string,
  ) {
    return this.photosService.uploadPhoto(file, orderId, uploadedBy, title);
  }

  @Put(':photoId')
  async updatePhoto(@Param('photoId') photoId: string, @Body() data: any) {
    return this.photosService.updatePhoto(photoId, data);
  }

  @Put('order-photo/:orderPhotoId')
  async updateOrderPhoto(@Param('orderPhotoId') orderPhotoId: string, @Body() data: any) {
    return this.photosService.updateOrderPhoto(orderPhotoId, data);
  }

  @Get(':orderId')
  async getPhotos(@Param('orderId') orderId: string) {
    return this.photosService.getPhotosByOrder(orderId);
  }
}
