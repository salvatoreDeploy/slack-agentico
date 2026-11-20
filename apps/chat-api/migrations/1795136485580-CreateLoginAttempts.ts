import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLoginAttempts1795136485580 implements MigrationInterface {
    name = 'CreateLoginAttempts1795136485580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "login_attempts" ("email" text NOT NULL, "failures" integer NOT NULL, "window_started_at" TIMESTAMP WITH TIME ZONE NOT NULL, "blocked_until" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("email"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "login_attempts"`);
    }

}
