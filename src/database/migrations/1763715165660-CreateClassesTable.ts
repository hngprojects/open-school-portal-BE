import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClassesTable1763715165660 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'classes_level_enum') THEN
            CREATE TYPE "classes_level_enum" AS ENUM ('Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary');
          END IF;
        END$$;
        CREATE TABLE "classes" (
          "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "name" VARCHAR(100) NOT NULL UNIQUE,
          "level" "classes_level_enum" NOT NULL
        );
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "classes";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "classes_level_enum";`);
  }
}
