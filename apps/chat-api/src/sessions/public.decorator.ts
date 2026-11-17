import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';

/** Libera a rota do guard de Sessão; toda rota exige Sessão, salvo as marcadas (LLD, "Interfaces"). */
export const Public = () => SetMetadata(IS_PUBLIC, true);
