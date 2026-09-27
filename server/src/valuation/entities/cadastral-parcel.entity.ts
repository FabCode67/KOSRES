import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * One row per surveyed land parcel, imported from official cadastral
 * exports (ArcGIS/QGIS "Converted" Excel files per district — see
 * server/src/database/import-cadastral.ts). This is exact survey data,
 * not an estimate: plot_area_sqm and the coordinates come straight from
 * the source file, only the DMS -> decimal-degree conversion is computed
 * by us, once, at import time.
 *
 * Lookup key is `upi` (Rwanda's Unique Parcel Identifier, e.g.
 * "1/02/01/01/4295") — kept UNIQUE so a UPI lookup is a single indexed
 * read, not a scan, however many districts get imported over time.
 */
@Entity('cadastral_parcels')
export class CadastralParcel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  upi: string;

  @Column({ nullable: true }) province: string;
  @Column({ nullable: true }) district: string;
  @Column({ nullable: true }) sector: string;
  @Column({ nullable: true }) cell: string;
  @Column({ nullable: true }) village: string;

  @Column({ name: 'plot_area_sqm', type: 'numeric', precision: 14, scale: 2, nullable: true })
  plotAreaSqm: number;

  @Column({ type: 'numeric', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'numeric', precision: 10, scale: 6, nullable: true })
  longitude: number;

  // Original projected coordinates (UTM meters) from the source file, kept
  // for traceability / cross-checking — not used in the distance calculation.
  @Column({ name: 'utm_x', type: 'numeric', precision: 14, scale: 4, nullable: true })
  utmX: number;

  @Column({ name: 'utm_y', type: 'numeric', precision: 14, scale: 4, nullable: true })
  utmY: number;

  @Column({ name: 'source_file', nullable: true })
  sourceFile: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
