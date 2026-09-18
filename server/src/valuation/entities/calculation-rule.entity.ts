import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique,
} from 'typeorm';
import { PropertyCategory } from './valuation-property.entity';

export enum CalculationRuleType {
  DEPRECIATION_FLAT_RATE   = 'depreciation_flat_rate',
  DEVELOPER_PROFIT         = 'developer_profit',
  FORCED_SALE_PERCENTAGE   = 'forced_sale_percentage',
  INSURANCE_VALUE_RULE     = 'insurance_value_rule', // optional — may have zero active rules
}

@Entity('valuation_calculation_rules')
@Unique(['code', 'version'])
export class CalculationRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CalculationRuleType })
  type: CalculationRuleType;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb' })
  params: Record<string, number>; // e.g. { rate: 0.07 } or { percentage: 0.6 }

  @Column({ name: 'applicable_property_type', type: 'enum', enum: PropertyCategory, nullable: true })
  applicablePropertyType: PropertyCategory;

  @Column({ name: 'applicable_component_type', nullable: true })
  applicableComponentType: string;

  @Column({ name: 'effective_date', type: 'timestamptz', default: () => 'now()' })
  effectiveDate: Date;

  @Column()
  version: number;

  @Column({ default: 'active' }) // draft | active | retired
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
