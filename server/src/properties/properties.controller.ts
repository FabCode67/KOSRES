import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  Query, UseGuards, Request, UseInterceptors,
  UploadedFiles, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto, PropertyQueryDto } from './property.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('properties')
@UseGuards(JwtAuthGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  // ── PUBLIC ──
  @Public()
  @Get()
  @ApiOperation({ summary: 'List all active properties with filters + pagination' })
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
  @Get(':id')
  @ApiOperation({ summary: 'Get single property' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.findOne(id);
  }

  // ── PROTECTED ──
  @Get('admin/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard stats (admin)' })
  getStats() {
    return this.propertiesService.getStats();
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create property' })
  create(@Body() dto: CreatePropertyDto, @Request() req) {
    return this.propertiesService.create(dto, req.user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update property' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePropertyDto) {
    return this.propertiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete property' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.remove(id);
  }

  @Post(':id/images')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: join(process.cwd(), '..', 'client', 'public', 'uploads'),
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          cb(null, `property-${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|webp)$/i;
        cb(null, allowed.test(file.originalname));
      },
    }),
  )
  @ApiOperation({ summary: 'Upload images for a property' })
  async uploadImages(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const urls = files.map((f) => `/uploads/${f.filename}`);
    return this.propertiesService.addImages(id, urls);
  }

  @Delete(':id/images')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove an image from a property' })
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    return this.propertiesService.removeImage(id, imageUrl);
  }
}
