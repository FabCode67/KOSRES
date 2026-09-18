import {
  Controller, Get, Post, Patch, Body, Param, UseGuards, Request,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ValuationPropertiesService } from './valuation-properties.service';
import { UploadService } from '../../upload/upload.service';
import { requireRoles } from '../require-roles.util';

@UseGuards(JwtAuthGuard)
@Controller('valuation/properties')
export class ValuationPropertiesController {
  constructor(private service: ValuationPropertiesService, private upload: UploadService) {}

  @Get('by-request/:requestId')
  findByRequest(@Request() req: any, @Param('requestId') requestId: string) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.findByRequest(requestId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.findOne(id);
  }

  @Post('by-request/:requestId')
  create(@Request() req: any, @Param('requestId') requestId: string, @Body() body: any) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.create(requestId, body);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.update(id, body);
  }

  @Patch(':id/location')
  upsertLocation(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.upsertLocation(id, body);
  }

  @Patch(':id/land')
  upsertLand(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.upsertLand(id, body);
  }

  @Post(':id/buildings')
  addBuilding(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.addBuilding(id, body);
  }

  @Post(':id/external-works')
  addExternalWork(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.addExternalWork(id, body);
  }

  @Post(':id/services')
  addService(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.addService(id, body);
  }

  @Post(':id/amenities')
  addAmenity(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    return this.service.addAmenity(id, body);
  }

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadImage(
    @Request() req: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category?: string,
    @Body('description') description?: string,
  ) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    const [result] = await this.upload.uploadFiles([file], 'kosres/valuation/properties');
    return this.service.addImage(id, result.secureUrl, category, description, req.user.id);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }))
  async uploadDocument(
    @Request() req: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
  ) {
    requireRoles(req, ['admin', 'valuer', 'technician']);
    const [result] = await this.upload.uploadFiles([file], 'kosres/valuation/documents');
    return this.service.addDocument(id, type, result.secureUrl, req.user.id);
  }
}
