import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePeopleAndSessions1794883882994 implements MigrationInterface {
    name = 'CreatePeopleAndSessions1794883882994'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "people" ("id" uuid NOT NULL, "name" text NOT NULL, "username" text NOT NULL, "email" text NOT NULL, "password_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "people_username_key" UNIQUE ("username"), CONSTRAINT "people_email_key" UNIQUE ("email"), CONSTRAINT "PK_aa866e71353ee94c6cc51059c5b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL, "person_id" uuid NOT NULL, "token_hash" bytea NOT NULL, "last_used_at" TIMESTAMP WITH TIME ZONE NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "sessions_token_hash_key" UNIQUE ("token_hash"), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "sessions_person_id_idx" ON "sessions"  ("person_id") `);
        await queryRunner.query(`CREATE INDEX "sessions_expires_at_idx" ON "sessions"  ("expires_at") `);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_c3942eab830cae599a763e11557" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_c3942eab830cae599a763e11557"`);
        await queryRunner.query(`DROP INDEX "public"."sessions_expires_at_idx"`);
        await queryRunner.query(`DROP INDEX "public"."sessions_person_id_idx"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP TABLE "people"`);
    }

}
