import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStreamTable1763715169135 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "stream" (
          "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "name" VARCHAR(100) NOT NULL,
          "class_id" uuid NOT NULL,
          CONSTRAINT "FK_stream_class" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE
        );
        CREATE UNIQUE INDEX "IDX_stream_class_id_name" ON "stream" ("class_id", "name");
        CREATE INDEX "IDX_stream_class_id" ON "stream" ("class_id");
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "stream";`);
  }
}
