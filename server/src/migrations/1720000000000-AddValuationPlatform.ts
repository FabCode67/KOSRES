import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * KOSRES Property Valuation Platform — additive migration.
 * Every new table is prefixed "valuation_" and nothing here touches an
 * existing table except: (1) adding VALUER/TECHNICIAN to the users role
 * enum, and (2) adding a nullable license_number column to users.
 */
export class AddValuationPlatform1720000000000 implements MigrationInterface {
  name = 'AddValuationPlatform1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Extend the existing users table (additive only) ──
    await queryRunner.query(`ALTER TYPE "public"."user_role_enum" ADD VALUE IF NOT EXISTS 'valuer'`);
    await queryRunner.query(`ALTER TYPE "public"."user_role_enum" ADD VALUE IF NOT EXISTS 'technician'`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "license_number" TEXT`);

    // ── Enum types ──
    await queryRunner.query(`
      CREATE TYPE "valuation_purpose_enum" AS ENUM (
        'loan_application','sale_purchase','insurance','investment','taxation',
        'accounting','financial_reporting','forced_sale','market_value','other'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "valuation_request_status_enum" AS ENUM (
        'draft','submitted','assigned','data_collection','inspection_in_progress',
        'information_required','valuer_review','engine_selected','analysis_in_progress',
        'valuer_final_review','draft_report','approved','certified','completed',
        'rejected','cancelled','on_hold','reassessment_required'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "valuation_property_category_enum" AS ENUM (
        'residential','commercial','industrial','agricultural','land','special_purpose'
      )
    `);
    await queryRunner.query(`CREATE TYPE "valuation_work_unit_enum" AS ENUM ('sqm','linear_m','item','lump_sum')`);
    await queryRunner.query(`CREATE TYPE "valuation_rate_table_type_enum" AS ENUM ('land','building_component','external_work')`);
    await queryRunner.query(`
      CREATE TYPE "valuation_calculation_rule_type_enum" AS ENUM (
        'depreciation_flat_rate','developer_profit','forced_sale_percentage','insurance_value_rule'
      )
    `);
    await queryRunner.query(`CREATE TYPE "valuation_basis_enum" AS ENUM ('market','forced_sale','insurance','land','development')`);
    await queryRunner.query(`CREATE TYPE "valuation_result_method_enum" AS ENUM ('system_calculated','valuer_adopted')`);

    // ── Requests & workflow ──
    await queryRunner.query(`
      CREATE TABLE "valuation_requests" (
        "id"                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "reference"               TEXT NOT NULL UNIQUE,
        "purpose"                 "valuation_purpose_enum" NOT NULL,
        "beneficiary"             TEXT,
        "instructor"              TEXT,
        "status"                  "valuation_request_status_enum" NOT NULL DEFAULT 'draft',
        "created_by_id"           UUID NOT NULL REFERENCES "users"("id"),
        "customer_id"             UUID REFERENCES "users"("id"),
        "assigned_valuer_id"      UUID REFERENCES "users"("id"),
        "assigned_technician_id"  UUID REFERENCES "users"("id"),
        "engine_version_id"       UUID,
        "created_at"              TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"              TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "valuation_workflow_transitions" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "request_id"  UUID NOT NULL REFERENCES "valuation_requests"("id") ON DELETE CASCADE,
        "from_status" "valuation_request_status_enum",
        "to_status"   "valuation_request_status_enum" NOT NULL,
        "actor_id"    UUID NOT NULL,
        "reason"      TEXT,
        "at"          TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // ── Engine framework ──
    await queryRunner.query(`
      CREATE TABLE "valuation_engines" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "code"        TEXT NOT NULL UNIQUE,
        "name"        TEXT NOT NULL,
        "description" TEXT,
        "methodology" TEXT,
        "status"      TEXT NOT NULL DEFAULT 'active'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "valuation_engine_versions" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "engine_id"        UUID NOT NULL REFERENCES "valuation_engines"("id"),
        "version"          INTEGER NOT NULL,
        "required_fields"  JSONB,
        "required_docs"    JSONB,
        "report_sections"  JSONB,
        "effective_date"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        "status"           TEXT NOT NULL DEFAULT 'active',
        UNIQUE ("engine_id", "version")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "valuation_requests"
      ADD CONSTRAINT "fk_valuation_requests_engine_version"
      FOREIGN KEY ("engine_version_id") REFERENCES "valuation_engine_versions"("id")
    `);

    // ── Subject property ──
    await queryRunner.query(`
      CREATE TABLE "valuation_properties" (
        "id"                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "request_id"             UUID NOT NULL UNIQUE REFERENCES "valuation_requests"("id") ON DELETE CASCADE,
        "upi"                    TEXT,
        "plot_number"            TEXT,
        "title_ref"              TEXT,
        "registered_proprietors" JSONB,
        "property_category"      "valuation_property_category_enum" NOT NULL,
        "property_subtype"       TEXT NOT NULL,
        "tenure"                 TEXT,
        "lease_term_years"       INTEGER,
        "occupancy_status"       TEXT,
        "mortgage_status"        TEXT,
        "restrictions_status"    TEXT,
        "process_status"         TEXT,
        "created_at"             TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"             TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "valuation_property_locations" (
        "id"                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "property_id"            UUID NOT NULL UNIQUE REFERENCES "valuation_properties"("id") ON DELETE CASCADE,
        "province"                TEXT,
        "district"                TEXT,
        "sector"                  TEXT,
        "cell"                    TEXT,
        "village"                 TEXT,
        "address"                 TEXT,
        "latitude"                NUMERIC(10,6),
        "longitude"               NUMERIC(10,6),
        "distance_to_cbd_km"      NUMERIC(6,2),
        "neighborhood_quality"    TEXT,
        "accessibility"           TEXT
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "valuation_property_land" (
        "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "property_id"      UUID NOT NULL UNIQUE REFERENCES "valuation_properties"("id") ON DELETE CASCADE,
        "plot_size_sqm"    NUMERIC(12,2),
        "shape"            TEXT,
        "topography"       TEXT,
        "zoning"           TEXT,
        "current_use"      TEXT,
        "permitted_uses"   TEXT[] NOT NULL DEFAULT '{}',
        "prohibited_uses"  TEXT[] NOT NULL DEFAULT '{}'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "valuation_property_buildings" (
        "id"                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "property_id"            UUID NOT NULL REFERENCES "valuation_properties"("id") ON DELETE CASCADE,
        "name"                   TEXT NOT NULL,
        "area_sqm"               NUMERIC(10,2) NOT NULL,
        "floors"                 INTEGER,
        "bedrooms"               INTEGER,
        "bathrooms"              INTEGER,
        "living_rooms"           INTEGER,
        "kitchens"               INTEGER,
        "stores"                 INTEGER,
        "construction_year"      INTEGER,
        "condition"              TEXT,
        "walling"                TEXT,
        "roofing"                TEXT,
        "flooring"               TEXT,
        "ceiling"                TEXT,
        "doors"                  TEXT,
        "windows"                TEXT,
        "completion_percentage"  NUMERIC(5,2) NOT NULL DEFAULT 100
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "valuation_external_works" (
        "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "property_id"  UUID NOT NULL REFERENCES "valuation_properties"("id") ON DELETE CASCADE,
        "name"         TEXT NOT NULL,
        "unit"         "valuation_work_unit_enum" NOT NULL,
        "quantity"     NUMERIC(10,2) NOT NULL,
        "notes"        TEXT
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "valuation_property_services" (
        "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "property_id"  UUID NOT NULL REFERENCES "valuation_properties"("id") ON DELETE CASCADE,
        "type"         TEXT NOT NULL,
        "status"       TEXT NOT NULL,
        "provider"     TEXT
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "valuation_property_amenities" (
        "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "property_id"  UUID NOT NULL REFERENCES "valuation_properties"("id") ON DELETE CASCADE,
        "name"         TEXT NOT NULL,
        "distance_km"  NUMERIC(6,2)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "valuation_property_images" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "property_id"     UUID NOT NULL REFERENCES "valuation_properties"("id") ON DELETE CASCADE,
        "url"             TEXT NOT NULL,
        "category"        TEXT,
        "description"     TEXT,
        "uploaded_by_id"  UUID,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "valuation_property_documents" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "property_id"     UUID NOT NULL REFERENCES "valuation_properties"("id") ON DELETE CASCADE,
        "type"            TEXT NOT NULL,
        "url"             TEXT NOT NULL,
        "version"         INTEGER NOT NULL DEFAULT 1,
        "uploaded_by_id"  UUID,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // ── Inspection ──
    await queryRunner.query(`
      CREATE TABLE "valuation_inspections" (
        "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "request_id"       UUID NOT NULL REFERENCES "valuation_requests"("id") ON DELETE CASCADE,
        "technician_id"    UUID NOT NULL REFERENCES "users"("id"),
        "inspection_date"  TIMESTAMPTZ,
        "status"           TEXT NOT NULL DEFAULT 'assigned',
        "created_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "valuation_inspection_notes" (
        "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "inspection_id"  UUID NOT NULL REFERENCES "valuation_inspections"("id") ON DELETE CASCADE,
        "field"          TEXT NOT NULL,
        "observation"    TEXT NOT NULL,
        "author_id"      UUID NOT NULL,
        "created_at"     TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // ── Rate tables ──
    await queryRunner.query(`
      CREATE TABLE "valuation_rate_tables" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "type"            "valuation_rate_table_type_enum" NOT NULL,
        "name"            TEXT NOT NULL,
        "version"         INTEGER NOT NULL,
        "effective_date"  TIMESTAMPTZ NOT NULL DEFAULT now(),
        "status"          TEXT NOT NULL DEFAULT 'active',
        "source"          TEXT,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE ("type", "name", "version")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "valuation_rate_table_entries" (
        "id"                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "rate_table_id"      UUID NOT NULL REFERENCES "valuation_rate_tables"("id") ON DELETE CASCADE,
        "key"                TEXT NOT NULL,
        "unit"               "valuation_work_unit_enum" NOT NULL,
        "rate"               NUMERIC(14,2) NOT NULL,
        "province"           TEXT,
        "district"           TEXT,
        "sector"             TEXT,
        "property_category"  "valuation_property_category_enum",
        "notes"              TEXT
      )
    `);

    // ── Calculation rules ──
    await queryRunner.query(`
      CREATE TABLE "valuation_calculation_rules" (
        "id"                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "type"                        "valuation_calculation_rule_type_enum" NOT NULL,
        "code"                        TEXT NOT NULL,
        "name"                        TEXT NOT NULL,
        "params"                      JSONB NOT NULL,
        "applicable_property_type"    "valuation_property_category_enum",
        "applicable_component_type"   TEXT,
        "effective_date"              TIMESTAMPTZ NOT NULL DEFAULT now(),
        "version"                     INTEGER NOT NULL,
        "status"                      TEXT NOT NULL DEFAULT 'active',
        "created_at"                  TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"                  TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE ("code", "version")
      )
    `);

    // ── Calculations & results ──
    await queryRunner.query(`
      CREATE TABLE "valuation_calculations" (
        "id"                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "request_id"               UUID NOT NULL REFERENCES "valuation_requests"("id") ON DELETE CASCADE,
        "engine_version_id"        UUID NOT NULL REFERENCES "valuation_engine_versions"("id"),
        "rate_tables_used"         JSONB,
        "calculation_rules_used"   JSONB,
        "inputs_snapshot"          JSONB NOT NULL,
        "outputs_snapshot"         JSONB NOT NULL,
        "executed_by_id"           UUID NOT NULL,
        "executed_at"              TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "valuation_results" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "request_id"      UUID NOT NULL REFERENCES "valuation_requests"("id") ON DELETE CASCADE,
        "calculation_id"  UUID REFERENCES "valuation_calculations"("id"),
        "basis"           "valuation_basis_enum" NOT NULL,
        "amount"          NUMERIC(16,2) NOT NULL,
        "currency"        TEXT NOT NULL DEFAULT 'RWF',
        "valuation_date"  DATE NOT NULL,
        "method"          "valuation_result_method_enum" NOT NULL DEFAULT 'system_calculated',
        "source"          TEXT,
        "justification"   TEXT,
        "created_by_id"   UUID NOT NULL,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "valuation_adjustments" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "result_id"       UUID NOT NULL REFERENCES "valuation_results"("id") ON DELETE CASCADE,
        "field"           TEXT NOT NULL,
        "original_value"  TEXT,
        "new_value"       TEXT NOT NULL,
        "reason"          TEXT NOT NULL,
        "author_id"       UUID NOT NULL,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // ── Helpful indexes ──
    await queryRunner.query(`CREATE INDEX "idx_valuation_requests_status" ON "valuation_requests" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_valuation_inspections_technician" ON "valuation_inspections" ("technician_id")`);
    await queryRunner.query(`CREATE INDEX "idx_valuation_rate_table_entries_key" ON "valuation_rate_table_entries" ("key")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_adjustments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_results"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_calculations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_calculation_rules"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_rate_table_entries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_rate_tables"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_inspection_notes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_inspections"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_property_documents"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_property_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_property_amenities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_property_services"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_external_works"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_property_buildings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_property_land"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_property_locations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_properties"`);
    await queryRunner.query(`ALTER TABLE "valuation_requests" DROP CONSTRAINT IF EXISTS "fk_valuation_requests_engine_version"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_engine_versions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_engines"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_workflow_transitions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "valuation_requests"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "valuation_result_method_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "valuation_basis_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "valuation_calculation_rule_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "valuation_rate_table_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "valuation_work_unit_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "valuation_property_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "valuation_request_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "valuation_purpose_enum"`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "license_number"`);
    // Note: Postgres does not support removing enum values — VALUER/TECHNICIAN
    // stay in users_role_enum on rollback. Harmless if unused.
  }
}
