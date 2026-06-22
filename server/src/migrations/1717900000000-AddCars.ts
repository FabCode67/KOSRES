import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCars1717900000000 implements MigrationInterface {
  name = 'AddCars1717900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "cars_service_type_enum" AS ENUM('rent','sale','taxi')
    `);
    await queryRunner.query(`
      CREATE TYPE "cars_status_enum" AS ENUM('available','rented','sold','inactive')
    `);
    await queryRunner.query(`
      CREATE TYPE "cars_fuel_type_enum" AS ENUM('petrol','diesel','hybrid','electric')
    `);
    await queryRunner.query(`
      CREATE TABLE "cars" (
        "id"              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
        "title"           VARCHAR(300)  NOT NULL,
        "description"     TEXT          NOT NULL,
        "brand"           VARCHAR(100)  NOT NULL,
        "model"           VARCHAR(100)  NOT NULL,
        "year"            INTEGER,
        "fuel_type"       "cars_fuel_type_enum"    NOT NULL DEFAULT 'petrol',
        "transmission"    VARCHAR(50),
        "seats"           INTEGER,
        "mileage"         INTEGER,
        "color"           VARCHAR(50),
        "plate_number"    VARCHAR(30),
        "service_type"    "cars_service_type_enum" NOT NULL,
        "price"           NUMERIC(15,2) NOT NULL,
        "price_unit"      VARCHAR(10)   NOT NULL DEFAULT 'RWF',
        "price_frequency" VARCHAR(50),
        "district"        VARCHAR(100),
        "location"        VARCHAR(200),
        "images"          TEXT[]        NOT NULL DEFAULT '{}',
        "featured"        BOOLEAN       NOT NULL DEFAULT false,
        "status"          "cars_status_enum"       NOT NULL DEFAULT 'available',
        "created_at"      TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMPTZ   NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_cars_service_type" ON "cars"("service_type")`);
    await queryRunner.query(`CREATE INDEX "idx_cars_status"       ON "cars"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_cars_featured"     ON "cars"("featured")`);
    await queryRunner.query(`CREATE INDEX "idx_cars_brand"        ON "cars"("brand")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "cars"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "cars_service_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "cars_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "cars_fuel_type_enum"`);
  }
}
