import { applyDecorators, UseGuards } from '@nestjs/common';
import { N8NGuard } from '../guards/n8n.guard';

export function IsN8N() {
  return applyDecorators(UseGuards(N8NGuard));
}
