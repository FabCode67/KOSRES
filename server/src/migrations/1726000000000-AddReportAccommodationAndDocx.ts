import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Supports the Word (.docx) valuation report:
 *  - per-building accommodation lists per floor, captured during valuation
 *    ([{ floor: "Ground floor", items: ["Living room", ...] }])
 *  - docx_url on valuation_reports (the pdf_url column is kept, now optional)
 */
export class AddReportAccommodationAndDocx1726000000000 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "valuation_property_buildings" ADD COLUMN IF NOT EXISTS "accommodation" jsonb NOT NULL DEFAULT '[]'`);
    await q.query(`ALTER TABLE "valuation_reports" ADD COLUMN IF NOT EXISTS "docx_url" character varying`);
  }
  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "valuation_reports" DROP COLUMN IF EXISTS "docx_url"`);
    await q.query(`ALTER TABLE "valuation_property_buildings" DROP COLUMN IF EXISTS "accommodation"`);
  }
}
