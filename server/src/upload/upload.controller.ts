import {
  Controller, Post, Get, Delete, Body,
  UseGuards, UseInterceptors, UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('upload')
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Public()
  @Post('images')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload property images to Cloudinary' })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
      },
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    const results = await this.uploadService.uploadFiles(files);
    return { urls: results.map((r) => r.secureUrl), details: results };
  }

  @Public()
  @Get('sign')
  @ApiOperation({ summary: 'Get signed params for direct browser → Cloudinary upload' })
  getSignature() {
    return this.uploadService.generateSignedUploadParams();
  }

  @Public()
  @Delete()
  @ApiOperation({ summary: 'Delete an image from Cloudinary' })
  async deleteImage(@Body('publicId') publicId: string) {
    if (!publicId) throw new BadRequestException('publicId required');
    await this.uploadService.deleteFile(publicId);
    return { message: 'Image deleted' };
  }
}
