import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CadastralParcel } from '../entities/cadastral-parcel.entity';
import { CadastralService } from './cadastral.service';
import { CadastralController } from './cadastral.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CadastralParcel])],
  providers: [CadastralService],
  controllers: [CadastralController],
  exports: [CadastralService],
})
export class CadastralModule {}
