import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  INestApplication,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsInt, IsString } from 'class-validator';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DomainError } from './domain.error.js';
import { ErrorsModule } from './errors.module.js';

class ThingNotFoundError extends DomainError {
  readonly code = 'not_found';

  constructor() {
    super('A coisa pedida não existe.');
  }
}

class CreateThingDto {
  @IsString()
  name: string;

  @IsInt()
  size: number;
}

@Controller('things')
class ThingsController {
  @Get('missing')
  missing(): never {
    throw new ThingNotFoundError();
  }

  @Get('broken')
  broken(): never {
    throw new Error('segredo interno');
  }

  @Post()
  create(@Body() body: CreateThingDto): CreateThingDto {
    return body;
  }

  @Get('forbidden')
  forbidden(): never {
    throw new ForbiddenException();
  }

  @Get('unauthorized')
  unauthorized(): never {
    throw new UnauthorizedException();
  }
}

describe('ProblemDetailsFilter', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ErrorsModule],
      controllers: [ThingsController],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde com o status e o código do erro de domínio', async () => {
    const response = await request(app.getHttpServer()).get('/things/missing');

    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toMatch(/^application\/problem\+json/);
    expect(response.body).toEqual({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      code: 'not_found',
      detail: 'A coisa pedida não existe.',
    });
  });

  it('responde 500 com internal_error sem expor a mensagem de um erro inesperado', async () => {
    const response = await request(app.getHttpServer()).get('/things/broken');

    expect(response.status).toBe(500);
    expect(response.body.code).toBe('internal_error');
    expect(JSON.stringify(response.body)).not.toContain('segredo interno');
  });

  it('responde 400 com validation_failed e os campos inválidos', async () => {
    const response = await request(app.getHttpServer())
      .post('/things')
      .send({ name: 'mesa', size: 'grande', extra: true });

    expect(response.status).toBe(400);
    expect(response.headers['content-type']).toMatch(/^application\/problem\+json/);
    expect(response.body.code).toBe('validation_failed');
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'size' }),
        expect.objectContaining({ field: 'extra' }),
      ]),
    );
  });

  it('mantém o status de um HttpException 4xx sem código próprio, com request_rejected', async () => {
    const response = await request(app.getHttpServer()).get('/things/forbidden');

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ status: 403, code: 'request_rejected' });
  });

  it('responde 401 com unauthenticated a um UnauthorizedException', async () => {
    const response = await request(app.getHttpServer()).get('/things/unauthorized');

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('unauthenticated');
  });

  it('responde 400 com malformed_body quando o corpo não é JSON válido', async () => {
    const response = await request(app.getHttpServer())
      .post('/things')
      .set('Content-Type', 'application/json')
      .send('{"name": ');

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('malformed_body');
  });
});
