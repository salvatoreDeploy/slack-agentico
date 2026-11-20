import { Body, Controller, Delete, Get, HttpCode, Post, Put, Req } from '@nestjs/common';
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
import { ChangePasswordDto, LoginDto, LoginResponse, PersonResponse } from './sessions.dto.js';
import { SessionsService } from './sessions.service.js';

/** O cabeçalho do 429 do limite de tentativas, no contrato. */
const RETRY_AFTER_HEADER = {
  'Retry-After': {
    description: 'Segundos até o fim do bloqueio',
    schema: { type: 'integer', minimum: 1 },
  },
};

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
  @ApiProblemResponse(429, ['too_many_attempts'], RETRY_AFTER_HEADER)
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

  /** Trocar a senha: as outras Sessões da Pessoa acabam, e a atual continua. */
  @Put('me/password')
  @HttpCode(204)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiBody({ type: ChangePasswordDto })
  @ApiNoContentResponse()
  @ApiProblemResponse(400, ['validation_failed'])
  @ApiProblemResponse(401, ['unauthenticated'])
  @ApiProblemResponse(422, ['wrong_current_password', 'password_unchanged'])
  @ApiProblemResponse(429, ['too_many_attempts'], RETRY_AFTER_HEADER)
  async changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() body: ChangePasswordDto,
  ): Promise<void> {
    await this.sessions.changePassword(
      { sessionId: request.sessionId, person: request.person },
      body.current_password,
      body.new_password,
    );
  }
}
