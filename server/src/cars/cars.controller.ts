import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseUUIDPipe,
  HttpCode, HttpStatus, UseInterceptors,
  UploadedFiles, BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { CarsService, CreateCarDto, UpdateCarDto, CarQueryDto } from './cars.service';
import { UploadService } from '../upload/upload.service';

@ApiTags('cars')
@Controller('cars')
export class CarsController {
  constructor(
    private svc:    CarsService,
    private upload: UploadService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List cars' })
  findAll(@Query() query: CarQueryDto) {
    return this.svc.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Featured cars' })
  findFeatured() {
    return this.svc.findFeatured();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Car stats' })
  getStats() {
    return this.svc.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single car' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create car listing' })
  create(@Body() dto: CreateCarDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update car listing' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCarDto,
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete car listing' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }

  /** Upload images to Cloudinary */
  @Post(':id/images')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload car images' })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (/\.(jpg|jpeg|png|webp)$/i.test(file.originalname)) cb(null, true);
        else cb(new BadRequestException('Only image files are allowed'), false);
      },
    }),
  )
  async uploadImages(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) throw new BadRequestException('No files provided');
    const results = await this.upload.uploadFiles(files, 'kosres/cars');
    return this.svc.addImages(id, results.map(r => r.secureUrl));
  }

  /** Remove a single image */
  @Delete(':id/images')
  @ApiOperation({ summary: 'Remove car image' })
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    return this.svc.removeImage(id, imageUrl);
  }
}
