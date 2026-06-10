import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceRequests1717600000000 implements MigrationInterface {
  name = 'AddServiceRequests1717600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "service_requests" (
        "id"         UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
        "service"    VARCHAR(100)  NOT NULL,
        "name"       VARCHAR(255)  NOT NULL,
        "email"      VARCHAR(255),
        "contact"    VARCHAR(50),
        "data"       JSONB         NOT NULL DEFAULT '{}',
        "read"       BOOLEAN       NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ   NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_service_requests_service" ON "service_requests"("service")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_service_requests_created" ON "service_requests"("created_at" DESC)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "service_requests"`);
  }
}
