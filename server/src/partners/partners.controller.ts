import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseUUIDPipe, Query,
  UseInterceptors, UploadedFiles, BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PartnersService, CreatePartnerDto, UpdatePartnerDto } from './partners.service';
import { UploadService } from '../upload/upload.service';

@Controller('partners')
export class PartnersController {
  constructor(
    private svc:    PartnersService,
    private upload: UploadService,
  ) {}

  @Get()
  findAll(@Query('all') all?: string) {
    return this.svc.findAll(all !== 'true');   // default: active only
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePartnerDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartnerDto,
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }

  /** POST /api/partners/:id/logo — upload partner logo to Cloudinary */
  @Post(':id/logo')
  @UseInterceptors(
    FilesInterceptor('file', 1, {
      storage: memoryStorage(),
      limits:  { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (/\.(jpg|jpeg|png|webp|svg)$/i.test(file.originalname)) cb(null, true);
        else cb(new BadRequestException('Only image files allowed'), false);
      },
    }),
  )
  async uploadLogo(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) throw new BadRequestException('No file provided');
    const [result] = await this.upload.uploadFiles(files, 'kosres/partners');
    return this.svc.update(id, { logo: result.secureUrl });
  }
}
