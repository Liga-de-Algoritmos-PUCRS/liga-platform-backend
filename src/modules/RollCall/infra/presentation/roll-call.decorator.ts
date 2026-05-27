import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

export const CreateRollCallDecorator = applyDecorators(
  ApiOperation({
    summary: 'Criar chamada',
    description: 'Cria uma nova chamada com a data informada. Acesso restrito a administradores.',
  }),
  ApiCreatedResponse({ description: 'Chamada criada com sucesso.' }),
  ApiBadRequestResponse({ description: 'Data inválida.' }),
  ApiForbiddenResponse({ description: 'Acesso restrito a administradores.' }),
  ApiUnauthorizedResponse({ description: 'Não autenticado.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno.' }),
);

export const FindAllRollCallsDecorator = applyDecorators(
  ApiOperation({
    summary: 'Listar chamadas',
    description:
      'Retorna todas as chamadas com o total de presenças de cada uma. Acesso restrito a administradores.',
  }),
  ApiOkResponse({ description: 'Lista de chamadas retornada com sucesso.' }),
  ApiForbiddenResponse({ description: 'Acesso restrito a administradores.' }),
  ApiUnauthorizedResponse({ description: 'Não autenticado.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno.' }),
);

export const GetOverviewDecorator = applyDecorators(
  ApiOperation({
    summary: 'Visão geral de frequência',
    description:
      'Retorna estatísticas de presença de todos os usuários em todas as chamadas. Acesso restrito a administradores.',
  }),
  ApiOkResponse({ description: 'Visão geral retornada com sucesso.' }),
  ApiForbiddenResponse({ description: 'Acesso restrito a administradores.' }),
  ApiUnauthorizedResponse({ description: 'Não autenticado.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno.' }),
);

export const GetMyAttendancesDecorator = applyDecorators(
  ApiOperation({
    summary: 'Meu histórico de presenças',
    description: 'Retorna o histórico de presenças do usuário autenticado.',
  }),
  ApiOkResponse({ description: 'Histórico de presenças retornado com sucesso.' }),
  ApiUnauthorizedResponse({ description: 'Não autenticado.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno.' }),
);

export const FindOneRollCallDecorator = applyDecorators(
  ApiOperation({
    summary: 'Detalhes de uma chamada',
    description:
      'Retorna os detalhes de uma chamada específica com a lista de presença de todos os usuários. Acesso restrito a administradores.',
  }),
  ApiOkResponse({ description: 'Chamada retornada com sucesso.' }),
  ApiNotFoundResponse({ description: 'Chamada não encontrada.' }),
  ApiForbiddenResponse({ description: 'Acesso restrito a administradores.' }),
  ApiUnauthorizedResponse({ description: 'Não autenticado.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno.' }),
);

export const GenerateQrCodeDecorator = applyDecorators(
  ApiOperation({
    summary: 'Gerar QR Code',
    description:
      'Gera um QR Code com expiração de 15 segundos para a chamada informada. Acesso restrito a administradores.',
  }),
  ApiOkResponse({ description: 'QR Code gerado com sucesso.' }),
  ApiNotFoundResponse({ description: 'Chamada não encontrada.' }),
  ApiForbiddenResponse({ description: 'Acesso restrito a administradores.' }),
  ApiUnauthorizedResponse({ description: 'Não autenticado.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno.' }),
);

export const AttendRollCallDecorator = applyDecorators(
  ApiOperation({
    summary: 'Registrar presença',
    description: 'Registra a presença do usuário autenticado via QR Code.',
  }),
  ApiOkResponse({ description: 'Presença registrada com sucesso.' }),
  ApiBadRequestResponse({ description: 'QR Code inválido ou expirado.' }),
  ApiUnauthorizedResponse({ description: 'Não autenticado.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno.' }),
);

export const UpdateAttendanceDecorator = applyDecorators(
  ApiOperation({
    summary: 'Atualizar presença manualmente',
    description:
      'Permite que um administrador marque ou desmarque a presença de um usuário em uma chamada.',
  }),
  ApiOkResponse({ description: 'Presença atualizada com sucesso.' }),
  ApiNotFoundResponse({ description: 'Chamada ou usuário não encontrado.' }),
  ApiForbiddenResponse({ description: 'Acesso restrito a administradores.' }),
  ApiUnauthorizedResponse({ description: 'Não autenticado.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno.' }),
);

export const RemoveRollCallDecorator = applyDecorators(
  ApiOperation({
    summary: 'Remover chamada',
    description:
      'Remove uma chamada e todas as presenças associadas. Acesso restrito a administradores.',
  }),
  ApiOkResponse({ description: 'Chamada removida com sucesso.' }),
  ApiNoContentResponse({ description: 'Chamada removida.' }),
  ApiNotFoundResponse({ description: 'Chamada não encontrada.' }),
  ApiForbiddenResponse({ description: 'Acesso restrito a administradores.' }),
  ApiUnauthorizedResponse({ description: 'Não autenticado.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno.' }),
);
