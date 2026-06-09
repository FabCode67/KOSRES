import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInquiryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ example: 'whatsapp' })
  @IsString()
  @IsOptional()
  channel?: string;
}
