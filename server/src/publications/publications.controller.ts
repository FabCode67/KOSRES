import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseUUIDPipe, Query,
  UseInterceptors, UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { PublicationsService, CreatePublicationDto, UpdatePublicationDto } from './publications.service';
import { UploadService } from '../upload/upload.service';

@ApiTags('publications')
@Controller('publications')
export class PublicationsController {
  constructor(
    private svc:    PublicationsService,
    private upload: UploadService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all published publications' })
  findAll(@Query('all') all?: string) {
    return this.svc.findAll(all === 'true');
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured publications (max 3)' })
  findFeatured() {
    return this.svc.findFeatured();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single publication' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create publication' })
  create(@Body() dto: CreatePublicationDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update publication' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePublicationDto,
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete publication' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Toggle published / draft' })
  togglePublish(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.togglePublish(id);
  }

  /**
   * POST /api/publications/:id/cover
   * Upload a cover image to Cloudinary and attach to publication.
   */
  @Post(':id/cover')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload cover image' })
  @UseInterceptors(
    FilesInterceptor('file', 1, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (/\.(jpg|jpeg|png|webp)$/i.test(file.originalname)) cb(null, true);
        else cb(new BadRequestException('Only image files'), false);
      },
    }),
  )
  async uploadCover(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) throw new BadRequestException('No file provided');
    const [result] = await this.upload.uploadFiles(files, 'kosres/publications');
    return this.svc.update(id, { coverImage: result.secureUrl });
  }

  /**
   * POST /api/publications/:id/document
   * Upload a PDF document to Cloudinary.
   */
  @Post(':id/document')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload PDF document' })
  @UseInterceptors(
    FilesInterceptor('file', 1, {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (/\.pdf$/i.test(file.originalname)) cb(null, true);
        else cb(new BadRequestException('Only PDF files'), false);
      },
    }),
  )
  async uploadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) throw new BadRequestException('No file provided');
    const file = files[0];
    // Upload PDF as raw resource
    const result = await this.upload.uploadRaw(file.buffer, file.originalname, 'kosres/documents');
    return this.svc.update(id, {
      documentUrl:  result.secureUrl,
      documentName: file.originalname,
    });
  }
}
