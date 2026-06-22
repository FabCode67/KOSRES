import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPartners1717800000000 implements MigrationInterface {
  name = 'AddPartners1717800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "partners" (
        "id"          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
        "name"        VARCHAR(200) NOT NULL,
        "logo"        VARCHAR(500),
        "website"     VARCHAR(500),
        "description" TEXT,
        "category"    VARCHAR(100) DEFAULT 'Partner',
        "active"      BOOLEAN      NOT NULL DEFAULT true,
        "order"       INTEGER      NOT NULL DEFAULT 0,
        "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMPTZ  NOT NULL DEFAULT now()
      )
    `);
    /* Seed Equity Bank so it appears immediately */
    await queryRunner.query(`
      INSERT INTO "partners" ("name","category","active","order")
      VALUES ('Equity Bank','Financial Partner',true,1)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "partners"`);
  }
}
