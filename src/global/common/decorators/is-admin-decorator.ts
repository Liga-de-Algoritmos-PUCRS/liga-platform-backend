import { applyDecorators, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../guards/admin-guard';

/**
 * Restringe a rota a ADMIN.
 *
 * Nao reaplica o `JwtAuthGuard`: ele e `APP_GUARD` global e o Nest roda os
 * guards globais antes dos de rota, entao `request.user` ja chega preenchido
 * aqui. Reaplicar so repetia a verificacao do JWT e a consulta do usuario que
 * `JwtStrategy.validate()` faz -- duas idas ao banco por request admin.
 */
export function IsAdmin() {
  return applyDecorators(UseGuards(AdminGuard));
}
