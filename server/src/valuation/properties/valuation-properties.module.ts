import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValuationProperty } from '../entities/valuation-property.entity';
import { ValuationPropertyLocation, ValuationPropertyLand } from '../entities/valuation-property-details.entity';
import { ValuationPropertyBuilding } from '../entities/valuation-property-building.entity';
import { ValuationExternalWork } from '../entities/valuation-external-work.entity';
import { ValuationPropertyImage, ValuationPropertyDocument } from '../entities/valuation-property-media.entity';
import { ValuationPropertiesService } from './valuation-properties.service';
import { ValuationPropertiesController } from './valuation-properties.controller';
import { UploadModule } from '../../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ValuationProperty, ValuationPropertyLocation, ValuationPropertyLand,
      ValuationPropertyBuilding, ValuationExternalWork,
      ValuationPropertyImage, ValuationPropertyDocument,
    ]),
    UploadModule,
  ],
  providers: [ValuationPropertiesService],
  controllers: [ValuationPropertiesController],
  exports: [ValuationPropertiesService],
})
export class ValuationPropertiesModule {}
