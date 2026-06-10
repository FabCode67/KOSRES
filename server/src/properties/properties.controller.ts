import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  Query, UseGuards, Request, UseInterceptors,
  UploadedFiles, ParseUUIDPipe, HttpCode, HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto, PropertyQueryDto } from './property.dto';
import { JwtAuthGuard }  from '../auth/jwt-auth.guard';
import { Public }        from '../auth/public.decorator';
import { UploadService } from '../upload/upload.service';

@ApiTags('properties')
@UseGuards(JwtAuthGuard)
@Controller('properties')
export class PropertiesController {
  constructor(
    private propertiesService: PropertiesService,
    private uploadService:     UploadService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List properties' })
  findAll(@Query() query: PropertyQueryDto) {
    return this.propertiesService.findAll(query);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured properties' })
  findFeatured() {
    return this.propertiesService.findFeatured();
  }

  @Public()
  @Get('admin/stats')
  @ApiOperation({ summary: 'Dashboard stats' })
  getStats() {
    return this.propertiesService.getStats();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get single property' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.findOne(id);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create property' })
  create(@Body() dto: CreatePropertyDto) {
    return this.propertiesService.createWithoutUser(dto);
  }

  @Public()
  @Patch(':id')
  @ApiOperation({ summary: 'Update property' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, dto);
  }

  @Public()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete property' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.remove(id);
  }

  @Public()
  @Post(':id/images')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload images to Cloudinary' })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (/\.(jpg|jpeg|png|webp)$/i.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
      },
    }),
  )
  async uploadImages(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    const results    = await this.uploadService.uploadFiles(files, 'kosres/properties');
    const secureUrls = results.map((r) => r.secureUrl);
    return this.propertiesService.addImages(id, secureUrls);
  }

  @Public()
  @Delete(':id/images')
  @ApiOperation({ summary: 'Remove an image from a property' })
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    return this.propertiesService.removeImage(id, imageUrl);
  }
}
