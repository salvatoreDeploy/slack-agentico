import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { v7 as uuidv7 } from 'uuid';
import { logConfig } from '../../config/log.config.js';

/** Campos que nunca aparecem no log (LLD, "Logs"). */
const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  '*.password',
  '*.current_password',
  '*.new_password',
  '*.token',
  '*.authorization',
  '*.cookie',
];

/**
 * Log estruturado em JSON, com um `request_id` por requisição. O corpo da requisição nunca é
 * registrado: o serializador só leva o método, a URL e os cabeçalhos, já mascarados.
 */
@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [logConfig.KEY],
      useFactory: (log: ConfigType<typeof logConfig>) => ({
        pinoHttp: {
          level: log.level,
          genReqId: () => uuidv7(),
          customProps: (req) => ({ request_id: req.id }),
          serializers: {
            req: (req: { method: string; url: string; headers: unknown }) => ({
              method: req.method,
              url: req.url,
              headers: req.headers,
            }),
          },
          redact: { paths: REDACTED_PATHS, censor: '[mascarado]' },
        },
      }),
    }),
  ],
})
export class LoggingModule {}
