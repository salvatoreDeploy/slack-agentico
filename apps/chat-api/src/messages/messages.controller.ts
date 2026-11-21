import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiProblemResponse } from '../common/errors/problem-response.decorator.js';
import type { AuthenticatedRequest } from '../sessions/session.guard.js';
import { SESSION_COOKIE } from '../sessions/session-rules.js';
import { ListMessagesQuery, MessagePageResponse, MessageResponse, SendMessageDto } from './messages.dto.js';
import { MessagesService } from './messages.service.js';

/** Explícito, porque o `tsx` do `pnpm openapi` não emite o tipo do `@Param()`. */
const CONVERSATION_ID_PARAM = {
  name: 'id',
  type: String,
  description: 'O id da Conversa; um valor que não é UUID recebe 404',
};

@ApiTags('Mensagens')
@ApiCookieAuth(SESSION_COOKIE)
@Controller('v1/conversations/:id/messages')
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get()
  // Explícito pelo mesmo motivo do `@ApiParam`: o `tsx` não emite o tipo do `@Query()`. Vem antes
  // dele para o contrato listar o `id` primeiro, como sai com os metadados de tipo.
  @ApiQuery({
    name: 'before',
    required: false,
    schema: { type: 'string', format: 'uuid' },
    description: 'O id da Mensagem mais antiga já recebida',
  })
  @ApiParam(CONVERSATION_ID_PARAM)
  @ApiOkResponse({ type: MessagePageResponse })
  @ApiProblemResponse(400, ['validation_failed'])
  @ApiProblemResponse(401, ['unauthenticated'])
  @ApiProblemResponse(404, ['not_found'])
  async listMessages(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Query() query: ListMessagesQuery,
  ): Promise<MessagePageResponse> {
    const page = await this.messages.listMessages(id, request.person.id, query.before);
    return { messages: page.messages.map((message) => MessageResponse.of(message)), has_more: page.hasMore };
  }

  @Post()
  @ApiParam(CONVERSATION_ID_PARAM)
  @ApiBody({ type: SendMessageDto })
  @ApiCreatedResponse({ type: MessageResponse })
  @ApiProblemResponse(400, ['validation_failed', 'malformed_body'])
  @ApiProblemResponse(401, ['unauthenticated'])
  @ApiProblemResponse(404, ['not_found'])
  async sendMessage(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: SendMessageDto,
  ): Promise<MessageResponse> {
    return MessageResponse.of(
      await this.messages.sendMessage(id, request.person.id, body.client_message_id, body.body),
    );
  }
}
