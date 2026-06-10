import {
  Controller, Get, Post, Delete, Param, Body,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './inquiry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('inquiries')
@UseGuards(JwtAuthGuard)
@Controller('inquiries')
export class InquiriesController {
  constructor(private inquiriesService: InquiriesService) {}

  @Public()
  @Post('property/:propertyId')
  @ApiOperation({ summary: 'Submit inquiry for a property (public)' })
  create(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Body() dto: CreateInquiryDto,
  ) {
    return this.inquiriesService.create(propertyId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all inquiries' })
  findAll() {
    return this.inquiriesService.findAll();
  }

  @Public()
  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get inquiries for a specific property' })
  findByProperty(@Param('propertyId', ParseUUIDPipe) propertyId: string) {
    return this.inquiriesService.findByProperty(propertyId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.inquiriesService.remove(id);
  }
}
