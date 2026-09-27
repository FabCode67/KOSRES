import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCadastralParcels1724000000000 implements MigrationInterface {
  name = 'AddCadastralParcels1724000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "cadastral_parcels" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "upi"             TEXT NOT NULL,
        "province"        TEXT,
        "district"        TEXT,
        "sector"          TEXT,
        "cell"            TEXT,
        "village"         TEXT,
        "plot_area_sqm"   NUMERIC(14,2),
        "latitude"        NUMERIC(10,6),
        "longitude"       NUMERIC(10,6),
        "utm_x"           NUMERIC(14,4),
        "utm_y"           NUMERIC(14,4),
        "source_file"     TEXT,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_cadastral_parcels_upi" ON "cadastral_parcels" ("upi")`);
    await queryRunner.query(`CREATE INDEX "idx_cadastral_parcels_district" ON "cadastral_parcels" ("district")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "cadastral_parcels"`);
  }
}
