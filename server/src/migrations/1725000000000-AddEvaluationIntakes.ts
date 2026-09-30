import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Public "request a valuation" intake -- a client submits this straight
 * from the landing page, before any staff involvement. Reuses the
 * existing "valuation_purpose_enum" type (same TS enum, ValuationPurpose,
 * as valuation_requests.purpose -- TypeORM names Postgres enum types after
 * the TS enum itself, not the table, so this is the same type, not a
 * duplicate) and adds its own status enum for the intake's own lifecycle
 * (new -> in_review -> converted/rejected).
 */
export class AddEvaluationIntakes1725000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "evaluation_intake_status_enum" AS ENUM ('new', 'in_review', 'converted', 'rejected')
    `);

    await queryRunner.query(`
      CREATE TABLE "evaluation_intakes" (
        "id"                        uuid NOT NULL DEFAULT gen_random_uuid(),
        "reference"                 varchar NOT NULL,
        "upi"                       varchar NOT NULL,
        "client_names"              varchar NOT NULL,
        "client_phone"              varchar,
        "client_email"              varchar,
        "purpose"                   "valuation_purpose_enum" NOT NULL,
        "type_of_property"          varchar NOT NULL,
        "is_developed"              boolean NOT NULL DEFAULT false,
        "construction_material"     varchar,
        "bedrooms"                  integer,
        "bathrooms"                 integer,
        "land_title_document_urls"  jsonb NOT NULL DEFAULT '[]',
        "property_picture_urls"     jsonb NOT NULL DEFAULT '[]',
        "status"                    "evaluation_intake_status_enum" NOT NULL DEFAULT 'new',
        "reviewed_by_id"            uuid,
        "admin_notes"               text,
        "linked_request_id"         uuid,
        "created_at"                TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"                TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "pk_evaluation_intakes" PRIMARY KEY ("id"),
        CONSTRAINT "uq_evaluation_intakes_reference" UNIQUE ("reference"),
        CONSTRAINT "fk_evaluation_intakes_reviewed_by" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_evaluation_intakes_status" ON "evaluation_intakes" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "evaluation_intakes"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "evaluation_intake_status_enum"`);
  }
}
