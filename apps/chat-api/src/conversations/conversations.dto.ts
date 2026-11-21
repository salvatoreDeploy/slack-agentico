import { ApiProperty } from '@nestjs/swagger';
import { Person } from '../people/person.entity.js';
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

/** Saída de `GET /v1/channels`. */
export class ChannelListResponse {
  @ApiProperty({ type: [ChannelResponse] })
  channels: ChannelResponse[];
}

/** Quem criou o Canal. */
export class ConversationCreatorResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String, description: 'O @usuário, sem o @' })
  username: string;

  static of(person: Person): ConversationCreatorResponse {
    return { id: person.id, name: person.name, username: person.username };
  }
}

/** Saída de `GET /v1/conversations/:id`. */
export class ConversationResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ type: String, enum: CONVERSATION_TYPES })
  type: ConversationType;

  @ApiProperty({ type: String, example: 'geral' })
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
