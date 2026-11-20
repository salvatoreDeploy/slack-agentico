import { Body, Controller, Delete, Get, HttpCode, Post, Req } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiProblemResponse } from '../common/errors/problem-response.decorator.js';
import { Public } from './public.decorator.js';
import type { AuthenticatedRequest } from './session.guard.js';
import { SESSION_COOKIE } from './session-rules.js';
import { LoginDto, LoginResponse, PersonResponse } from './sessions.dto.js';
import { SessionsService } from './sessions.service.js';

@ApiTags('Sessão')
@Controller('v1')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Public()
  @Post('sessions')
  // Explícito, porque o `tsx` do `pnpm openapi` não emite o tipo do `@Body()`.
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({ type: LoginResponse })
  @ApiProblemResponse(400, ['validation_failed'])
  @ApiProblemResponse(401, ['invalid_credentials'])
  async login(@Body() body: LoginDto): Promise<LoginResponse> {
    const { token, person } = await this.sessions.login(body.email, body.password);
    return { token, person: PersonResponse.of(person) };
  }

  @Get('me')
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOkResponse({ type: PersonResponse })
  @ApiProblemResponse(401, ['unauthenticated'])
  me(@Req() request: AuthenticatedRequest): PersonResponse {
    return PersonResponse.of(request.person);
  }

  /** Sair: apaga só a Sessão da requisição (LLD, "Sessão e login"). */
  @Delete('sessions/current')
  @HttpCode(204)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiNoContentResponse()
  @ApiProblemResponse(401, ['unauthenticated'])
  async logout(@Req() request: AuthenticatedRequest): Promise<void> {
    await this.sessions.logout(request.sessionId);
  }
}
