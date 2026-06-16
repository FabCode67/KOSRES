import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublications1717700000000 implements MigrationInterface {
  name = 'AddPublications1717700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "publications_status_enum" AS ENUM('draft', 'published')
    `);
    await queryRunner.query(`
      CREATE TABLE "publications" (
        "id"            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
        "title"         VARCHAR(300)  NOT NULL,
        "excerpt"       TEXT          NOT NULL,
        "body"          TEXT          NOT NULL,
        "cover_image"   VARCHAR(500),
        "document_url"  VARCHAR(500),
        "document_name" VARCHAR(255),
        "category"      VARCHAR(100),
        "author"        VARCHAR(100)  DEFAULT 'KOSRES LTD',
        "featured"      BOOLEAN       NOT NULL DEFAULT false,
        "status"        "publications_status_enum" NOT NULL DEFAULT 'draft',
        "slug"          VARCHAR(300),
        "created_at"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMPTZ   NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_publications_status"   ON "publications"("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_publications_featured" ON "publications"("featured")`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_publications_slug" ON "publications"("slug") WHERE slug IS NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "publications"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "publications_status_enum"`);
  }
}
