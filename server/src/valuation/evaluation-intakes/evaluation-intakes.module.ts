import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationIntake } from '../entities/evaluation-intake.entity';
import { EvaluationIntakesService } from './evaluation-intakes.service';
import { EvaluationIntakesController } from './evaluation-intakes.controller';
import { ValuationRequestsModule } from '../requests/valuation-requests.module';
import { ValuationPropertiesModule } from '../properties/valuation-properties.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluationIntake]),
    ValuationRequestsModule,
    ValuationPropertiesModule,
  ],
  providers: [EvaluationIntakesService],
  controllers: [EvaluationIntakesController],
  exports: [EvaluationIntakesService],
})
export class EvaluationIntakesModule {}
