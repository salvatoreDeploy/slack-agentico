import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Conversas e participação (spec da F02, "Conversas e participação"). O índice único parcial do
 * nome, o `CHECK` do nome por tipo e o `#geral` são escritos à mão: o TypeORM não gera os dois
 * primeiros, e o terceiro é dado.
 */
export class CreateConversationsAndParticipations1795280422958 implements MigrationInterface {
    name = 'CreateConversationsAndParticipations1795280422958'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."conversations_type_enum" AS ENUM('public_channel')`);
        await queryRunner.query(`CREATE TABLE "conversations" ("id" uuid NOT NULL, "type" "public"."conversations_type_enum" NOT NULL, "name" text, "description" text, "created_by" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "conversations_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "participations" ("conversation_id" uuid NOT NULL, "person_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "participations_pkey" PRIMARY KEY ("conversation_id", "person_id"))`);
        await queryRunner.query(`CREATE INDEX "participations_person_id_idx" ON "participations"  ("person_id") `);
        await queryRunner.query(`ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "participations" ADD CONSTRAINT "participations_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "participations" ADD CONSTRAINT "participations_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // À mão. O nome é único entre os Canais, públicos e privados. Como só Canal tem nome (o CHECK
        // abaixo), basta a condição do nome, que não muda quando o enum ganha tipos; a conversão do
        // enum para texto não é imutável e não cabe na condição de um índice.
        await queryRunner.query(`CREATE UNIQUE INDEX "conversations_channel_name_key" ON "conversations" ("name") WHERE "name" IS NOT NULL`);
        // À mão. Canal tem nome; Conversa direta não tem. O texto do tipo cobre o 'private_channel',
        // que o enum só ganha na F03.
        await queryRunner.query(`ALTER TABLE "conversations" ADD CONSTRAINT "conversations_name_by_type" CHECK (("type"::text IN ('public_channel', 'private_channel')) = ("name" IS NOT NULL))`);

        // À mão. O #geral nasce com o Workspace, sem criador, com a participação de quem já existe.
        await queryRunner.query(`INSERT INTO "conversations" ("id", "type", "name", "description") VALUES (uuidv7(), 'public_channel', 'geral', 'Canal de todo o Workspace')`);
        await queryRunner.query(`INSERT INTO "participations" ("conversation_id", "person_id") SELECT c."id", p."id" FROM "conversations" c CROSS JOIN "people" p WHERE c."name" = 'geral'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participations" DROP CONSTRAINT "participations_person_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "participations" DROP CONSTRAINT "participations_conversation_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT "conversations_created_by_fkey"`);
        await queryRunner.query(`DROP INDEX "public"."participations_person_id_idx"`);
        await queryRunner.query(`DROP TABLE "participations"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
        await queryRunner.query(`DROP TYPE "public"."conversations_type_enum"`);
    }

}
