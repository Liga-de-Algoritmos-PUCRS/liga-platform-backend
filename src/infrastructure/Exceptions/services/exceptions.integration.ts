import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ExceptionParams, ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExceptionsIntegration implements ExceptionsAdapter {
  private readonly logger = new Logger('API Exceptions');

  private logParams(level: 'warn' | 'error', label: string, data: ExceptionParams): void {
    const parts = [
      `${label}: ${data.message}`,
      `Internal Key: ${data.internalKey || 'N/A'}`,
      `Internal: ${data.internal || 'N/A'}`,
    ].join(' - ');
    this.logger[level](parts);
  }

  badRequest(data: ExceptionParams): BadRequestException {
    this.logParams('warn', 'Bad Request', data);
    return new BadRequestException(data.message);
  }

  conflict(data: ExceptionParams): ConflictException {
    this.logParams('warn', 'Conflict', data);
    return new ConflictException(data.message);
  }

  unauthorized(data: ExceptionParams): UnauthorizedException {
    this.logParams('warn', 'Unauthorized', data);
    return new UnauthorizedException(data.message);
  }

  forbidden(data: ExceptionParams): ForbiddenException {
    this.logParams('warn', 'Forbidden', data);
    return new ForbiddenException(data.message);
  }

  notFound(data: ExceptionParams): NotFoundException {
    this.logParams('warn', 'Not Found', data);
    return new NotFoundException(data.message);
  }

  internalServerError(data: ExceptionParams): InternalServerErrorException {
    this.logParams('error', 'Internal Server Error', data);
    return new InternalServerErrorException(data.message);
  }
}
