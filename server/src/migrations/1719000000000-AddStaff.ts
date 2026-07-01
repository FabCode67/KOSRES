import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStaff1719000000000 implements MigrationInterface {
  name = 'AddStaff1719000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "staff" (
        "id"          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
        "name"        VARCHAR(200) NOT NULL,
        "position"    VARCHAR(150) NOT NULL,
        "department"  VARCHAR(100),
        "photo"       VARCHAR(500),
        "bio"         TEXT,
        "email"       VARCHAR(255),
        "phone"       VARCHAR(50),
        "active"      BOOLEAN      NOT NULL DEFAULT true,
        "order"       INTEGER      NOT NULL DEFAULT 0,
        "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMPTZ  NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "staff"`);
  }
}
