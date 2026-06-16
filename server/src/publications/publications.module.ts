import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publication }          from './publication.entity';
import { PublicationsService }  from './publications.service';
import { PublicationsController } from './publications.controller';
import { UploadModule }         from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Publication]), UploadModule],
  providers:   [PublicationsService],
  controllers: [PublicationsController],
})
export class PublicationsModule {}
