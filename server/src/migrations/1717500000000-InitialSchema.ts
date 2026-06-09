import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1717500000000 implements MigrationInterface {
  name = 'InitialSchema1717500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── ENUM types ──
    await queryRunner.query(`
      CREATE TYPE "public"."property_category_enum" AS ENUM (
        'residential', 'commercial', 'agricultural', 'industrial'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."property_offer_type_enum" AS ENUM (
        'sale', 'rent', 'short_stay'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."property_price_unit_enum" AS ENUM ('RWF', 'USD')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."property_status_enum" AS ENUM (
        'active', 'sold', 'rented', 'inactive'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."user_role_enum" AS ENUM ('admin', 'agent')
    `);

    // ── USERS table ──
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
        "name"       VARCHAR(255) NOT NULL,
        "email"      VARCHAR(255) NOT NULL UNIQUE,
        "password"   VARCHAR(255) NOT NULL,
        "role"       "public"."user_role_enum" NOT NULL DEFAULT 'agent',
        "is_active"  BOOLEAN     NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // ── PROPERTIES table ──
    await queryRunner.query(`
      CREATE TABLE "properties" (
        "id"              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
        "title"           VARCHAR(500) NOT NULL,
        "description"     TEXT        NOT NULL,
        "price"           NUMERIC(15,2) NOT NULL,
        "price_unit"      "public"."property_price_unit_enum" NOT NULL DEFAULT 'RWF',
        "price_frequency" VARCHAR(20),
        "offer_type"      "public"."property_offer_type_enum" NOT NULL,
        "category"        "public"."property_category_enum" NOT NULL,
        "property_type"   VARCHAR(100) NOT NULL,
        "district"        VARCHAR(100) NOT NULL,
        "sector"          VARCHAR(100) NOT NULL,
        "bedrooms"        INTEGER,
        "bathrooms"       INTEGER,
        "area"            NUMERIC(10,2),
        "images"          TEXT[]      NOT NULL DEFAULT '{}',
        "featured"        BOOLEAN     NOT NULL DEFAULT false,
        "status"          "public"."property_status_enum" NOT NULL DEFAULT 'active',
        "upi"             VARCHAR(100),
        "created_by_id"   UUID REFERENCES "users"("id") ON DELETE SET NULL,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // ── INQUIRIES table ──
    await queryRunner.query(`
      CREATE TABLE "inquiries" (
        "id"          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
        "property_id" UUID REFERENCES "properties"("id") ON DELETE CASCADE,
        "name"        VARCHAR(255) NOT NULL,
        "email"       VARCHAR(255),
        "phone"       VARCHAR(50),
        "message"     TEXT        NOT NULL,
        "channel"     VARCHAR(50) NOT NULL DEFAULT 'whatsapp',
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // ── INDEXES ──
    await queryRunner.query(`CREATE INDEX "idx_properties_offer_type"  ON "properties"("offer_type")`);
    await queryRunner.query(`CREATE INDEX "idx_properties_category"     ON "properties"("category")`);
    await queryRunner.query(`CREATE INDEX "idx_properties_district"     ON "properties"("district")`);
    await queryRunner.query(`CREATE INDEX "idx_properties_featured"     ON "properties"("featured")`);
    await queryRunner.query(`CREATE INDEX "idx_properties_status"       ON "properties"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_inquiries_property_id"   ON "inquiries"("property_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "inquiries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "properties"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_role_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."property_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."property_price_unit_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."property_offer_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."property_category_enum"`);
  }
}
