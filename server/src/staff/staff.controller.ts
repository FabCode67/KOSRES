import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseUUIDPipe, Query, Request,
  UseGuards, UseInterceptors, UploadedFiles,
  BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { StaffService, CreateStaffDto, UpdateStaffDto } from './staff.service';
import { UploadService } from '../upload/upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('staff')
@UseGuards(JwtAuthGuard)
@Controller('staff')
export class StaffController {
  constructor(
    private svc:    StaffService,
    private upload: UploadService,
  ) {}

  /** Only admins can add/edit/remove staff. Agents & the public can only view. */
  private requireAdmin(req: any) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Only admins can manage staff');
    }
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List staff members' })
  findAll(@Query('all') all?: string) {
    return this.svc.findAll(all !== 'true');   // default: active only
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get single staff member' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add staff member (admin only)' })
  create(@Request() req: any, @Body() dto: CreateStaffDto) {
    this.requireAdmin(req);
    return this.svc.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update staff member (admin only)' })
  update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStaffDto,
  ) {
    this.requireAdmin(req);
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove staff member (admin only)' })
  remove(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    this.requireAdmin(req);
    return this.svc.remove(id);
  }

  /** POST /api/staff/:id/photo — upload profile picture to Cloudinary (admin only) */
  @Post(':id/photo')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload staff profile picture (admin only)' })
  @UseInterceptors(
    FilesInterceptor('file', 1, {
      storage: memoryStorage(),
      limits:  { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (/\.(jpg|jpeg|png|webp)$/i.test(file.originalname)) cb(null, true);
        else cb(new BadRequestException('Only image files allowed'), false);
      },
    }),
  )
  async uploadPhoto(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    this.requireAdmin(req);
    if (!files?.length) throw new BadRequestException('No file provided');
    const [result] = await this.upload.uploadFiles(files, 'kosres/staff');
    return this.svc.update(id, { photo: result.secureUrl });
  }
}
