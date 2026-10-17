import { MigrationInterface, QueryRunner } from 'typeorm';

/** Extra descriptive columns so comparables can be traced back to a parcel (UPI) and carry the grading attributes from the firm's sales databases. */
export class AddComparableSeedColumns1727000000000 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "comparable_properties" ADD COLUMN IF NOT EXISTS "upi" text`);
    await q.query(`ALTER TABLE "comparable_properties" ADD COLUMN IF NOT EXISTS "village" text`);
    await q.query(`ALTER TABLE "comparable_properties" ADD COLUMN IF NOT EXISTS "property_subtype" text`);
    await q.query(`ALTER TABLE "comparable_properties" ADD COLUMN IF NOT EXISTS "accommodation" text`);
    await q.query(`ALTER TABLE "comparable_properties" ADD COLUMN IF NOT EXISTS "attributes" jsonb`);
    await q.query(`CREATE INDEX IF NOT EXISTS "idx_comparable_properties_upi" ON "comparable_properties" ("upi")`);
  }
  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS "idx_comparable_properties_upi"`);
    for (const c of ['attributes', 'accommodation', 'property_subtype', 'village', 'upi'])
      await q.query(`ALTER TABLE "comparable_properties" DROP COLUMN IF EXISTS "${c}"`);
  }
}
