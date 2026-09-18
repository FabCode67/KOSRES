import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddValuationReports1722000000000 implements MigrationInterface {
  name = 'AddValuationReports1722000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "valuation_reports" (
        "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "request_id"       UUID NOT NULL REFERENCES "valuation_requests"("id") ON DELETE CASCADE,
        "reference"        TEXT NOT NULL UNIQUE,
        "pdf_url"          TEXT,
        "generated_by_id"  UUID NOT NULL,
        "generated_at"     TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_reports"`);
  }
}
