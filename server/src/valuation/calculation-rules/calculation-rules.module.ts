import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationRule } from '../entities/calculation-rule.entity';
import { CalculationRulesService } from './calculation-rules.service';
import { CalculationRulesController } from './calculation-rules.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CalculationRule])],
  providers: [CalculationRulesService],
  controllers: [CalculationRulesController],
  exports: [CalculationRulesService],
})
export class CalculationRulesModule {}
