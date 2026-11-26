import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiProblemResponse } from '../common/errors/problem-response.decorator.js';
import type { AuthenticatedRequest } from '../sessions/session.guard.js';
import { SESSION_COOKIE } from '../sessions/session-rules.js';
import { ChannelListResponse, ChannelResponse, ConversationResponse, CreateChannelDto } from './conversations.dto.js';
import { ConversationsService } from './conversations.service.js';

@ApiTags('Conversas')
@ApiCookieAuth(SESSION_COOKIE)
@Controller('v1')
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Get('channels')
  @ApiOkResponse({ type: ChannelListResponse })
  @ApiProblemResponse(401, ['unauthenticated'])
  async listChannels(@Req() request: AuthenticatedRequest): Promise<ChannelListResponse> {
    const channels = await this.conversations.listChannels(request.person.id);
    return { channels: channels.map((channel) => ChannelResponse.of(channel)) };
  }

  @Post('channels')
  // Explícito, porque o `tsx` do `pnpm openapi` não emite o tipo do `@Body()`.
  @ApiBody({ type: CreateChannelDto })
  @ApiCreatedResponse({ type: ChannelResponse })
  @ApiProblemResponse(400, ['validation_failed', 'malformed_body'])
  @ApiProblemResponse(401, ['unauthenticated'])
  @ApiProblemResponse(409, ['channel_name_taken'])
  @ApiProblemResponse(413, ['payload_too_large'])
  async createChannel(@Req() request: AuthenticatedRequest, @Body() body: CreateChannelDto): Promise<ChannelResponse> {
    const channel = await this.conversations.createChannel(request.person.id, body.name, body.description);
    return ChannelResponse.of(channel);
  }

  /** Um id que não é UUID recebe o mesmo 404 da Conversa inexistente (LLD, "Segurança"). */
  @Get('conversations/:id')
  // Explícito, porque o `tsx` do `pnpm openapi` não emite o tipo do `@Param()`.
  @ApiParam({ name: 'id', type: String, description: 'O id da Conversa; um valor que não é UUID recebe 404' })
  @ApiOkResponse({ type: ConversationResponse })
  @ApiProblemResponse(401, ['unauthenticated'])
  @ApiProblemResponse(404, ['not_found'])
  async getConversation(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ConversationResponse> {
    return ConversationResponse.of(await this.conversations.getConversation(id, request.person.id));
  }
}
