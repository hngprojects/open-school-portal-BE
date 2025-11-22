import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStreamTable1763577608000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure UUID extension exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create stream table
    await queryRunner.query(`
      CREATE TABLE "stream" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL,
        "class_id" uuid NOT NULL,
        "created_at" timestamp with time zone NOT NULL DEFAULT now(),
        "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_stream_class_name" UNIQUE ("class_id", "name")
      )
    `);

    // Create index on class_id for query performance (non-unique to allow multiple streams per class)
    await queryRunner.query(`
      CREATE INDEX "IDX_stream_class_id" ON "stream" ("class_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index if exists
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_stream_class_id"`);

    // Drop table if exists
    await queryRunner.query(`DROP TABLE IF EXISTS "stream"`);
  }
}
