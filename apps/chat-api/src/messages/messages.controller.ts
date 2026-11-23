import { Body, Controller, Get, HttpStatus, Param, Post, Query, Req, Res } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
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
  @ApiCreatedResponse({ type: MessageResponse, description: 'A Mensagem foi gravada agora' })
  @ApiOkResponse({ type: MessageResponse, description: 'O `client_message_id` já tinha sido usado pelo autor: a Mensagem já gravada' })
  @ApiProblemResponse(400, ['validation_failed', 'malformed_body'])
  @ApiProblemResponse(401, ['unauthenticated'])
  @ApiProblemResponse(404, ['not_found'])
  @ApiProblemResponse(409, ['client_message_id_conflict'])
  @ApiProblemResponse(413, ['payload_too_large'])
  async sendMessage(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: SendMessageDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MessageResponse> {
    const sent = await this.messages.sendMessage(id, request.person, body.client_message_id, body.body);
    // A repetição responde 200, e a primeira gravação 201 (LLD, "Concorrência e idempotência").
    response.status(sent.created ? HttpStatus.CREATED : HttpStatus.OK);
    return MessageResponse.of(sent.message);
  }
}
