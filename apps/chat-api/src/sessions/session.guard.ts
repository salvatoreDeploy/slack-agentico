import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { parseCookie } from 'cookie';
import type { Request } from 'express';
import { Person } from '../people/person.entity.js';
import { IS_PUBLIC } from './public.decorator.js';
import { SESSION_COOKIE } from './session-rules.js';
import { UnauthenticatedError } from './sessions.errors.js';
import { SessionsService } from './sessions.service.js';

/** A requisição depois do guard, com a Pessoa da Sessão. */
export interface AuthenticatedRequest extends Request {
  person: Person;
}

/**
 * Exige Sessão em toda rota, salvo as marcadas com `@Public()`. Lê o token do cookie de sessão,
 * o mesmo que o BFF repassa e que o WebSocket vai receber (LLD, "Interfaces").
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessions: SessionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = parseCookie(request.headers.cookie ?? '')[SESSION_COOKIE];
    if (!token) {
      throw new UnauthenticatedError();
    }
    request.person = await this.sessions.authenticate(token);
    return true;
  }
}
