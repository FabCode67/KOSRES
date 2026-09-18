import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddValuationApprovals1721000000000 implements MigrationInterface {
  name = 'AddValuationApprovals1721000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "valuation_approvals" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "request_id"      UUID NOT NULL REFERENCES "valuation_requests"("id") ON DELETE CASCADE,
        "approver_id"     UUID NOT NULL REFERENCES "users"("id"),
        "decision"        TEXT NOT NULL,
        "comment"         TEXT,
        "signed_name"     TEXT,
        "license_number"  TEXT,
        "at"              TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_approvals"`);
  }
}
