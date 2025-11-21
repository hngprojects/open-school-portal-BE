import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClassTeachersTable1763715171092
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                        CREATE TABLE "class_teachers" (
                            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                            "session_id" VARCHAR NOT NULL,
                            "is_active" BOOLEAN DEFAULT true,
                            "class_id" uuid NOT NULL,
                            "teacher_id" uuid NOT NULL,
                            CONSTRAINT "FK_class_teachers_class" FOREIGN KEY ("class_id") REFERENCES "classes"("id"),
                            CONSTRAINT "FK_class_teachers_teacher" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id")
                        );
                `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "class_teachers";`);
  }
}
