import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateTable, RateTableEntry } from '../entities/rate-table.entity';
import { RateTablesService } from './rate-tables.service';
import { RateTablesController } from './rate-tables.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RateTable, RateTableEntry])],
  providers: [RateTablesService],
  controllers: [RateTablesController],
  exports: [RateTablesService],
})
export class RateTablesModule {}
