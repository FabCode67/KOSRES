import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddComparables1723000000000 implements MigrationInterface {
  name = 'AddComparables1723000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "comparable_properties" (
        "id"                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "province"             TEXT,
        "district"             TEXT,
        "sector"               TEXT,
        "cell"                 TEXT,
        "property_category"    "valuation_property_category_enum",
        "plot_area_sqm"        NUMERIC(10,2),
        "building_area_sqm"    NUMERIC(10,2),
        "bedrooms"             INTEGER,
        "age_years"            INTEGER,
        "condition"            TEXT,
        "accessibility"        TEXT,
        "cbd_distance_km"      NUMERIC(6,2),
        "source"               TEXT,
        "source_reliability"   TEXT,
        "verification_status"  TEXT NOT NULL DEFAULT 'unverified',
        "created_at"           TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"           TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "comparable_transactions" (
        "id"                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "comparable_property_id"   UUID NOT NULL REFERENCES "comparable_properties"("id") ON DELETE CASCADE,
        "transaction_date"         DATE NOT NULL,
        "price"                    NUMERIC(16,2) NOT NULL,
        "price_per_sqm"            NUMERIC(14,2),
        "evidence_url"             TEXT
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "comparable_selections" (
        "id"                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "request_id"               UUID NOT NULL REFERENCES "valuation_requests"("id") ON DELETE CASCADE,
        "comparable_property_id"   UUID NOT NULL REFERENCES "comparable_properties"("id"),
        "included"                 BOOLEAN NOT NULL DEFAULT true,
        "similarity_score"         NUMERIC(5,2),
        "adjustments"              JSONB,
        "valuer_comment"           TEXT,
        "created_at"               TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_comparable_properties_district" ON "comparable_properties" ("district")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "comparable_selections"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "comparable_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "comparable_properties"`);
  }
}
