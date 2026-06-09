import {
  IsString, IsNumber, IsEnum, IsOptional, IsBoolean,
  IsArray, Min, IsPositive,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  PropertyCategory, OfferType, PriceUnit, PropertyStatus,
} from './property.entity';

export class CreatePropertyDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({ enum: PriceUnit, default: 'RWF' })
  @IsEnum(PriceUnit)
  @IsOptional()
  priceUnit?: PriceUnit;

  @ApiPropertyOptional({ example: 'month' })
  @IsString()
  @IsOptional()
  priceFrequency?: string;

  @ApiProperty({ enum: OfferType })
  @IsEnum(OfferType)
  offerType: OfferType;

  @ApiProperty({ enum: PropertyCategory })
  @IsEnum(PropertyCategory)
  category: PropertyCategory;

  @ApiProperty()
  @IsString()
  propertyType: string;

  @ApiProperty()
  @IsString()
  district: string;

  @ApiProperty()
  @IsString()
  sector: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  bathrooms?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  area?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  upi?: string;
}

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
  @ApiPropertyOptional({ enum: PropertyStatus })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;
}

export class PropertyQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: OfferType }) @IsOptional() @IsEnum(OfferType) offerType?: OfferType;
  @ApiPropertyOptional({ enum: PropertyCategory }) @IsOptional() @IsEnum(PropertyCategory) category?: PropertyCategory;
  @ApiPropertyOptional() @IsOptional() @IsString() district?: string;
  @ApiPropertyOptional({ enum: PropertyStatus }) @IsOptional() @IsEnum(PropertyStatus) status?: PropertyStatus;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === 'true') featured?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() page?: number = 1;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() limit?: number = 12;
}
