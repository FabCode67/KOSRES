import { Module }       from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car }           from './car.entity';
import { CarsService }   from './cars.service';
import { CarsController } from './cars.controller';
import { UploadModule }  from '../upload/upload.module';

@Module({
  imports:     [TypeOrmModule.forFeature([Car]), UploadModule],
  providers:   [CarsService],
  controllers: [CarsController],
  exports:     [CarsService],
})
export class CarsModule {}
