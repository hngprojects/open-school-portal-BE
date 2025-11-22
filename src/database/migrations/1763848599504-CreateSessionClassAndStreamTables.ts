import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessionClassAndStreamTables1763848599504
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create session_classes junction table
    await queryRunner.query(`
      CREATE TABLE "session_classes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "session_id" uuid NOT NULL,
        "class_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP NULL DEFAULT NULL,
        CONSTRAINT "PK_session_classes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_session_class" UNIQUE ("session_id", "class_id"),
        CONSTRAINT "FK_session_classes_session" FOREIGN KEY ("session_id") 
          REFERENCES "academic_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_session_classes_class" FOREIGN KEY ("class_id") 
          REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // Create index for session_id
    await queryRunner.query(`
      CREATE INDEX "IDX_session_classes_session_id" ON "session_classes" ("session_id")
    `);

    // Create index for class_id
    await queryRunner.query(`
      CREATE INDEX "IDX_session_classes_class_id" ON "session_classes" ("class_id")
    `);

    // Create session_streams junction table
    await queryRunner.query(`
      CREATE TABLE "session_streams" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "session_id" uuid NOT NULL,
        "stream_name" character varying(100) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP NULL DEFAULT NULL,
        CONSTRAINT "PK_session_streams" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_session_stream" UNIQUE ("session_id", "stream_name"),
        CONSTRAINT "FK_session_streams_session" FOREIGN KEY ("session_id") 
          REFERENCES "academic_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // Create index for session_id
    await queryRunner.query(`
      CREATE INDEX "IDX_session_streams_session_id" ON "session_streams" ("session_id")
    `);

    // Create index for stream_name
    await queryRunner.query(`
      CREATE INDEX "IDX_session_streams_stream_name" ON "session_streams" ("stream_name")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop session_streams table
    await queryRunner.query(`DROP INDEX "IDX_session_streams_stream_name"`);
    await queryRunner.query(`DROP INDEX "IDX_session_streams_session_id"`);
    await queryRunner.query(`DROP TABLE "session_streams"`);

    // Drop session_classes table
    await queryRunner.query(`DROP INDEX "IDX_session_classes_class_id"`);
    await queryRunner.query(`DROP INDEX "IDX_session_classes_session_id"`);
    await queryRunner.query(`DROP TABLE "session_classes"`);
  }
}
