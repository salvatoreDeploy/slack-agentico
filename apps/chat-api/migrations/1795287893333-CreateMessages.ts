import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Mensagens (spec da F02, "Mensagens"). Gerada pelo TypeORM, só com a tabela `messages`. A entidade
 * `Conversation` declara o índice parcial e o `CHECK` da migração anterior, para o gerador não
 * propor apagá-los nas próximas.
 */
export class CreateMessages1795287893333 implements MigrationInterface {
    name = 'CreateMessages1795287893333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL, "conversation_id" uuid NOT NULL, "author_person_id" uuid NOT NULL, "client_message_id" uuid NOT NULL, "body" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "messages_author_client_message_key" UNIQUE ("author_person_id", "client_message_id"), CONSTRAINT "messages_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "messages_conversation_id_id_idx" ON "messages"  ("conversation_id", "id") `);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "messages_author_person_id_fkey" FOREIGN KEY ("author_person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "messages_author_person_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "messages_conversation_id_fkey"`);
        await queryRunner.query(`DROP INDEX "public"."messages_conversation_id_id_idx"`);
        await queryRunner.query(`DROP TABLE "messages"`);
    }

}
