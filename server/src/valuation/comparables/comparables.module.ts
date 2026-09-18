import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComparableProperty, ComparableTransaction } from '../entities/comparable-property.entity';
import { ComparableSelection } from '../entities/comparable-selection.entity';
import { ComparablesService } from './comparables.service';
import { ComparablesController } from './comparables.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ComparableProperty, ComparableTransaction, ComparableSelection])],
  providers: [ComparablesService],
  controllers: [ComparablesController],
  exports: [ComparablesService],
})
export class ComparablesModule {}
