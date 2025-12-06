import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1764365246272 implements MigrationInterface {
  name = 'InitialMigration1764365246272';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "waitlist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "first_name" character varying(120) NOT NULL, "last_name" character varying(120) NOT NULL, "email" character varying(180) NOT NULL, CONSTRAINT "UQ_2221cffeeb64bff14201bd5b3de" UNIQUE ("email"), CONSTRAINT "PK_973cfbedc6381485681d6a6916c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "expires_at" TIMESTAMP NOT NULL, "refresh_token" text NOT NULL, "provider" character varying NOT NULL DEFAULT 'jwt', "is_active" boolean NOT NULL DEFAULT true, "revoked_at" TIMESTAMP, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."terms_name_enum" AS ENUM('First term', 'Second term', 'Third term')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."terms_status_enum" AS ENUM('Active', 'Archived')`,
    );
    await queryRunner.query(
      `CREATE TABLE "terms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "session_id" uuid NOT NULL, "name" "public"."terms_name_enum" NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "status" "public"."terms_status_enum" NOT NULL DEFAULT 'Active', "is_current" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_33b6fe77d6ace7ff43cc8a65958" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."academic_sessions_status_enum" AS ENUM('Active', 'Archived')`,
    );
    await queryRunner.query(
      `CREATE TABLE "academic_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "academic_year" character varying(50), "name" character varying(100) NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "description" text, "status" "public"."academic_sessions_status_enum" NOT NULL DEFAULT 'Active', "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_b4b2fcff2d0dc08528c6eaa427d" UNIQUE ("academic_year"), CONSTRAINT "PK_8dba9ed9bef819af7a31769c04b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "rooms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "type" character varying(255) NOT NULL, "capacity" integer NOT NULL, "location" character varying(255) NOT NULL, "current_class" uuid, CONSTRAINT "UQ_48b79438f8707f3d9ca83d85ea0" UNIQUE ("name"), CONSTRAINT "REL_d8aca627ab4c98373677c5fe65" UNIQUE ("current_class"), CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "class_subjects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "class_id" uuid NOT NULL, "subject_id" uuid NOT NULL, CONSTRAINT "PK_4e1ecabd8771166a29291dc09ed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "subjects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, CONSTRAINT "UQ_47a287fe64bd0e1027e603c335c" UNIQUE ("name"), CONSTRAINT "UQ_47a287fe64bd0e1027e603c335c" UNIQUE ("name"), CONSTRAINT "PK_1a023685ac2b051b4e557b0b280" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "class_teachers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "session_id" character varying NOT NULL, "assignment_date" TIMESTAMP NOT NULL DEFAULT now(), "is_active" boolean NOT NULL DEFAULT true, "class_id" uuid, "teacher_id" uuid, CONSTRAINT "PK_af6f6d3e46a2ac73959f65f3d9a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."teachers_title_enum" AS ENUM('Mr', 'Mrs', 'Miss', 'Dr', 'Prof')`,
    );
    await queryRunner.query(
      `CREATE TABLE "teachers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "employment_id" character varying NOT NULL, "title" "public"."teachers_title_enum" NOT NULL, "photo_url" character varying, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_4668d4752e6766682d1be0b346f" UNIQUE ("user_id"), CONSTRAINT "UQ_8e683bfa0a4320b135683e5e054" UNIQUE ("employment_id"), CONSTRAINT "REL_4668d4752e6766682d1be0b346" UNIQUE ("user_id"), CONSTRAINT "PK_a8d4f83be3abe4c687b0a0093c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."schedules_day_enum" AS ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."schedules_period_type_enum" AS ENUM('ACADEMICS', 'BREAK')`,
    );
    await queryRunner.query(
      `CREATE TABLE "schedules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "day" "public"."schedules_day_enum" NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "period_type" "public"."schedules_period_type_enum" NOT NULL DEFAULT 'ACADEMICS', "room" character varying, "timetable_id" uuid NOT NULL, "subject_id" uuid, "teacher_id" uuid, CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "timetables" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "class_id" uuid NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "REL_54d3ddcc757a7639a1ca4ea159" UNIQUE ("class_id"), CONSTRAINT "PK_9dd7e50645bff59e9ac5b4725c0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "class" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "stream" character varying, "arm" character varying, "academic_session_id" uuid NOT NULL, CONSTRAINT "UQ_8bd096a7175df0d7ad14e805b46" UNIQUE ("name", "arm", "academic_session_id"), CONSTRAINT "PK_0b9024d21bdfba8b1bd1c300eae" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "students" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "registration_number" character varying NOT NULL, "photo_url" character varying, "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "user_id" uuid, "stream_id" uuid, CONSTRAINT "UQ_82946fdb5652b83cacb81e9083e" UNIQUE ("registration_number"), CONSTRAINT "REL_fb3eff90b11bddf7285f9b4e28" UNIQUE ("user_id"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "stream" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(100) NOT NULL, "class_id" uuid NOT NULL, CONSTRAINT "UQ_88a6010af8d39ff0573a2e2d297" UNIQUE ("class_id", "name"), CONSTRAINT "PK_0dc9d7e04ff213c08a096f835f2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_670f7496ebbd8029b00e80841e" ON "stream" ("class_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "middle_name" character varying, "gender" character varying, "dob" date, "email" character varying NOT NULL, "phone" character varying, "home_address" character varying, "role" "public"."users_role_enum" array NOT NULL DEFAULT '{STUDENT}', "password" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "is_verified" boolean DEFAULT true, "last_login_at" TIMESTAMP, "reset_token" character varying, "reset_token_expiry" TIMESTAMP, "deleted_at" TIMESTAMP, "streamId" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "teacher_subjects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "teacher_id" uuid NOT NULL, "subject_id" uuid NOT NULL, "class_id" character varying, "is_active" boolean NOT NULL DEFAULT true, "notes" text, CONSTRAINT "UQ_9e05964fe6f2598b643470c2067" UNIQUE ("teacher_id", "subject_id"), CONSTRAINT "PK_9f5ee8b3beb5c7c1ea50a8d7908" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "teacher_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "teacher_uid" character varying NOT NULL, "user_id" integer NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, CONSTRAINT "UQ_663fbeaaa7b4db3242cbda8767c" UNIQUE ("teacher_uid"), CONSTRAINT "PK_fdd17d62015e40674217a407484" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "schools" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(150) NOT NULL, "address" character varying(255), "logo_url" character varying, "email" character varying, "phone" character varying(20), "primary_color" character varying, "secondary_color" character varying, "accent_color" character varying, "installation_completed" boolean NOT NULL DEFAULT false, "database_url" text, CONSTRAINT "UQ_74a5374cf6d1c970dd47f888bf6" UNIQUE ("email"), CONSTRAINT "PK_95b932e47ac129dd8e23a0db548" PRIMARY KEY ("id")); COMMENT ON COLUMN "schools"."database_url" IS 'Dedicated DB connection'`,
    );
    await queryRunner.query(
      `CREATE TABLE "parents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "photo_url" character varying, "is_active" boolean NOT NULL DEFAULT true, "deleted_at" TIMESTAMP, CONSTRAINT "UQ_c94c3cea9b43a18c81269ded41d" UNIQUE ("user_id"), CONSTRAINT "REL_c94c3cea9b43a18c81269ded41" UNIQUE ("user_id"), CONSTRAINT "PK_9a4dc67c7b8e6a9cb918938d353" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invites_status_enum" AS ENUM('pending', 'used', 'expired', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "invites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying NOT NULL, "accepted" boolean NOT NULL DEFAULT false, "invited_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP, "role" character varying NOT NULL, "full_name" character varying, "status" "public"."invites_status_enum" NOT NULL DEFAULT 'pending', "token_hash" character varying, "school_id" uuid, CONSTRAINT "UQ_08583b1882195ae2674f8391323" UNIQUE ("email"), CONSTRAINT "PK_aa52e96b44a714372f4dd31a0af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0843131f4ae91435709527a4f1" ON "invites" ("token_hash") `,
    );
    await queryRunner.query(
      `CREATE TABLE "databases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "school_email" character varying NOT NULL, "database_name" character varying NOT NULL, "database_host" character varying NOT NULL, "database_username" character varying NOT NULL, "database_port" integer NOT NULL, "database_password" character varying NOT NULL, "email" character varying, CONSTRAINT "UQ_7b3b2d04bd716b0ad45d627756f" UNIQUE ("school_email"), CONSTRAINT "REL_c79845ecc69427038b52d0d967" UNIQUE ("email"), CONSTRAINT "PK_238a190c9ace4bea3dc1896f988" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contacts_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contacts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "school_name" character varying(200), "message" text NOT NULL, "status" "public"."contacts_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_2fa" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "two_fa_secret" character varying NOT NULL, "two_fa_enabled" boolean NOT NULL DEFAULT false, "backup_codes" text array, CONSTRAINT "UQ_ed539980faac14226a05368c4d1" UNIQUE ("user_id"), CONSTRAINT "REL_ed539980faac14226a05368c4d" UNIQUE ("user_id"), CONSTRAINT "PK_63a194aa64b4e2039a535a9aa9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "terms" ADD CONSTRAINT "FK_2a45e5f1a157f965dad749ef1dd" FOREIGN KEY ("session_id") REFERENCES "academic_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rooms" ADD CONSTRAINT "FK_d8aca627ab4c98373677c5fe657" FOREIGN KEY ("current_class") REFERENCES "class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_subjects" ADD CONSTRAINT "FK_433f93dd22b685e59c285726a1f" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_subjects" ADD CONSTRAINT "FK_9d8971acdcc64a1703357a00759" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_teachers" ADD CONSTRAINT "FK_1192d6f4432d1de68d66e9a9cd7" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_teachers" ADD CONSTRAINT "FK_504b6c1a3616565a5a1cedcaa63" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "teachers" ADD CONSTRAINT "FK_4668d4752e6766682d1be0b346f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" ADD CONSTRAINT "FK_2177ec4fc6490209c0b9dcbf206" FOREIGN KEY ("timetable_id") REFERENCES "timetables"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" ADD CONSTRAINT "FK_ea337fc21e4c484e86392809d79" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" ADD CONSTRAINT "FK_2c027020a88187efddd0dbb8421" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetables" ADD CONSTRAINT "FK_54d3ddcc757a7639a1ca4ea159c" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "class" ADD CONSTRAINT "FK_c07874fd7fa46efbb14dad30005" FOREIGN KEY ("academic_session_id") REFERENCES "academic_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "students" ADD CONSTRAINT "FK_fb3eff90b11bddf7285f9b4e281" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "students" ADD CONSTRAINT "FK_277791be7d963aa0529c476f7d2" FOREIGN KEY ("stream_id") REFERENCES "stream"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stream" ADD CONSTRAINT "FK_670f7496ebbd8029b00e80841e7" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_969b3e450b298cc8c6be9028caf" FOREIGN KEY ("streamId") REFERENCES "stream"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "teacher_subjects" ADD CONSTRAINT "FK_6675136306b9111126bbdbbaba7" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "teacher_subjects" ADD CONSTRAINT "FK_f35ef96bfb3a84b712722d6db70" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "parents" ADD CONSTRAINT "FK_c94c3cea9b43a18c81269ded41d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" ADD CONSTRAINT "FK_7f2f179b9f5940e0f8f41847cfa" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "databases" ADD CONSTRAINT "FK_c79845ecc69427038b52d0d9672" FOREIGN KEY ("email") REFERENCES "schools"("email") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_2fa" ADD CONSTRAINT "FK_ed539980faac14226a05368c4d1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_2fa" DROP CONSTRAINT "FK_ed539980faac14226a05368c4d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "databases" DROP CONSTRAINT "FK_c79845ecc69427038b52d0d9672"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" DROP CONSTRAINT "FK_7f2f179b9f5940e0f8f41847cfa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "parents" DROP CONSTRAINT "FK_c94c3cea9b43a18c81269ded41d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "teacher_subjects" DROP CONSTRAINT "FK_f35ef96bfb3a84b712722d6db70"`,
    );
    await queryRunner.query(
      `ALTER TABLE "teacher_subjects" DROP CONSTRAINT "FK_6675136306b9111126bbdbbaba7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_969b3e450b298cc8c6be9028caf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stream" DROP CONSTRAINT "FK_670f7496ebbd8029b00e80841e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "students" DROP CONSTRAINT "FK_277791be7d963aa0529c476f7d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "students" DROP CONSTRAINT "FK_fb3eff90b11bddf7285f9b4e281"`,
    );
    await queryRunner.query(
      `ALTER TABLE "class" DROP CONSTRAINT "FK_c07874fd7fa46efbb14dad30005"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetables" DROP CONSTRAINT "FK_54d3ddcc757a7639a1ca4ea159c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" DROP CONSTRAINT "FK_2c027020a88187efddd0dbb8421"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" DROP CONSTRAINT "FK_ea337fc21e4c484e86392809d79"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" DROP CONSTRAINT "FK_2177ec4fc6490209c0b9dcbf206"`,
    );
    await queryRunner.query(
      `ALTER TABLE "teachers" DROP CONSTRAINT "FK_4668d4752e6766682d1be0b346f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_teachers" DROP CONSTRAINT "FK_504b6c1a3616565a5a1cedcaa63"`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_teachers" DROP CONSTRAINT "FK_1192d6f4432d1de68d66e9a9cd7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_subjects" DROP CONSTRAINT "FK_9d8971acdcc64a1703357a00759"`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_subjects" DROP CONSTRAINT "FK_433f93dd22b685e59c285726a1f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rooms" DROP CONSTRAINT "FK_d8aca627ab4c98373677c5fe657"`,
    );
    await queryRunner.query(
      `ALTER TABLE "terms" DROP CONSTRAINT "FK_2a45e5f1a157f965dad749ef1dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`,
    );
    await queryRunner.query(`DROP TABLE "user_2fa"`);
    await queryRunner.query(`DROP TABLE "contacts"`);
    await queryRunner.query(`DROP TYPE "public"."contacts_status_enum"`);
    await queryRunner.query(`DROP TABLE "databases"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0843131f4ae91435709527a4f1"`,
    );
    await queryRunner.query(`DROP TABLE "invites"`);
    await queryRunner.query(`DROP TYPE "public"."invites_status_enum"`);
    await queryRunner.query(`DROP TABLE "parents"`);
    await queryRunner.query(`DROP TABLE "schools"`);
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(`DROP TABLE "teacher_profiles"`);
    await queryRunner.query(`DROP TABLE "teacher_subjects"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_670f7496ebbd8029b00e80841e"`,
    );
    await queryRunner.query(`DROP TABLE "stream"`);
    await queryRunner.query(`DROP TABLE "students"`);
    await queryRunner.query(`DROP TABLE "class"`);
    await queryRunner.query(`DROP TABLE "timetables"`);
    await queryRunner.query(`DROP TABLE "schedules"`);
    await queryRunner.query(`DROP TYPE "public"."schedules_period_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."schedules_day_enum"`);
    await queryRunner.query(`DROP TABLE "teachers"`);
    await queryRunner.query(`DROP TYPE "public"."teachers_title_enum"`);
    await queryRunner.query(`DROP TABLE "class_teachers"`);
    await queryRunner.query(`DROP TABLE "subjects"`);
    await queryRunner.query(`DROP TABLE "class_subjects"`);
    await queryRunner.query(`DROP TABLE "rooms"`);
    await queryRunner.query(`DROP TABLE "academic_sessions"`);
    await queryRunner.query(
      `DROP TYPE "public"."academic_sessions_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "terms"`);
    await queryRunner.query(`DROP TYPE "public"."terms_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."terms_name_enum"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "waitlist"`);
  }
}
