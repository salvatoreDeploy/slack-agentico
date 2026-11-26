import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Person } from '../people/person.entity.js';
import { PersonResponse } from '../sessions/sessions.dto.js';
import { Conversation, CONVERSATION_TYPES, type ConversationType } from './conversation.entity.js';

/**
 * O Canal na lista da barra lateral. Todo `@ApiProperty` declara o tipo, porque o `tsx` do
 * `pnpm openapi` não emite os metadados de tipo.
 */
export class ChannelResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ type: String, example: 'geral' })
  name: string;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  static of(conversation: Conversation): ChannelResponse {
    return {
      id: conversation.id,
      name: conversation.name ?? '',
      description: conversation.description,
    };
  }
}

/** Entrada de `POST /v1/channels`. O nome e a descrição são tratados pela API. */
export class CreateChannelDto {
  @ApiProperty({ type: String, example: 'Café & Vendas', description: 'Normalizado pela API; de 1 a 80 caracteres depois disso' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Quebras de linha viram espaço e as pontas são cortadas; vazia, fica nula; até 250 caracteres',
  })
  @IsOptional()
  @IsString()
  description?: string | null;
}

/** Saída de `GET /v1/channels`. */
export class ChannelListResponse {
  @ApiProperty({ type: [ChannelResponse] })
  channels: ChannelResponse[];
}

/** Quem criou o Canal: a Pessoa como a API a mostra, sem o e-mail. */
export class ConversationCreatorResponse extends PickType(PersonResponse, ['id', 'name', 'username'] as const) {
  static of(person: Person): ConversationCreatorResponse {
    return { id: person.id, name: person.name, username: person.username };
  }
}

/** Saída de `GET /v1/conversations/:id`. */
export class ConversationResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ type: String, enum: [...CONVERSATION_TYPES] })
  type: ConversationType;

  @ApiProperty({ type: String, nullable: true, example: 'geral', description: 'Nulo na Conversa direta' })
  name: string | null;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at: string;

  @ApiProperty({ type: ConversationCreatorResponse, nullable: true })
  created_by: ConversationCreatorResponse | null;

  static of(conversation: Conversation): ConversationResponse {
    return {
      id: conversation.id,
      type: conversation.type,
      name: conversation.name,
      description: conversation.description,
      created_at: conversation.createdAt.toISOString(),
      created_by: conversation.creator ? ConversationCreatorResponse.of(conversation.creator) : null,
    };
  }
}
