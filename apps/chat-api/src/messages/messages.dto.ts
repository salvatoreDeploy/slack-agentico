import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ConversationCreatorResponse } from '../conversations/conversations.dto.js';
import { Message } from './message.entity.js';

/**
 * Consulta de `GET /v1/conversations/:id/messages`. Todo `@ApiProperty` declara o tipo, porque o
 * `tsx` do `pnpm openapi` não emite os metadados de tipo.
 */
export class ListMessagesQuery {
  @ApiPropertyOptional({ type: String, format: 'uuid', description: 'O id da Mensagem mais antiga já recebida' })
  @IsOptional()
  @IsUUID()
  before?: string;
}

/** Entrada de `POST /v1/conversations/:id/messages`. */
export class SendMessageDto {
  @ApiProperty({ type: String, format: 'uuid', description: 'Gerado no cliente; a repetição devolve a mesma Mensagem' })
  @IsUUID()
  client_message_id: string;

  @ApiProperty({ type: String, description: 'Texto puro; as pontas são cortadas' })
  @IsString()
  body: string;
}

/** A Mensagem como a API a mostra, com o nome atual do autor. */
export class MessageResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ type: String, format: 'uuid' })
  conversation_id: string;

  @ApiProperty({ type: String, format: 'uuid' })
  client_message_id: string;

  @ApiProperty({ type: ConversationCreatorResponse })
  author: ConversationCreatorResponse;

  @ApiProperty({ type: String })
  body: string;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at: string;

  static of(message: Message): MessageResponse {
    return {
      id: message.id,
      conversation_id: message.conversationId,
      client_message_id: message.clientMessageId,
      author: ConversationCreatorResponse.of(message.author),
      body: message.body,
      created_at: message.createdAt.toISOString(),
    };
  }
}

/** Saída de `GET /v1/conversations/:id/messages`. */
export class MessagePageResponse {
  @ApiProperty({ type: [MessageResponse] })
  messages: MessageResponse[];

  @ApiProperty({ type: Boolean })
  has_more: boolean;
}
