import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/Database/prisma.service';
import { ResetPasswordTokenRepository } from '@/modules/Auth/resetPassword/domain/reset-password-token.repository';
import { ResetPasswordToken } from '@/modules/Auth/resetPassword/domain/reset-password-token.entity';
import { ResetPasswordTokenMapper } from '@/modules/Auth/resetPassword/infra/persistence/reset-passaword-token.mapper';

@Injectable()
export class PrismaResetPasswordTokenRepository implements ResetPasswordTokenRepository {
  constructor(private readonly PrismaService: PrismaService) {}

  public async createResetPasswordToken(
    resetPasswordToken: ResetPasswordToken,
  ): Promise<ResetPasswordToken> {
    const prismaToken = ResetPasswordTokenMapper.toPersistence(resetPasswordToken);
    const createdToken = await this.PrismaService.resetPasswordToken.create({
      data: prismaToken,
    });
    return ResetPasswordTokenMapper.toDomain(createdToken);
  }

  public async findValidResetPasswordToken(id: string): Promise<ResetPasswordToken | null> {
    const prismaToken = await this.PrismaService.resetPasswordToken.findFirst({
      where: {
        id,
      },
    });

    if (!prismaToken) {
      return null;
    }

    return ResetPasswordTokenMapper.toDomain(prismaToken);
  }

  public async findValidResetPasswordTokenByUserId(
    userId: string,
  ): Promise<ResetPasswordToken | null> {
    // So existe no maximo 1 token nao revogado por usuario -- o request
    // revoga os anteriores antes de criar um novo -- mas pega o mais recente
    // por criacao para o fluxo de revogado/expirado continuar funcionando
    // igual ao lookup por id.
    const prismaToken = await this.PrismaService.resetPasswordToken.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!prismaToken) {
      return null;
    }

    return ResetPasswordTokenMapper.toDomain(prismaToken);
  }

  public async revokeResetPasswordTokenById(id: string): Promise<boolean> {
    const result = await this.PrismaService.resetPasswordToken.updateMany({
      where: {
        id,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });

    return result.count > 0;
  }

  public async incrementAttempts(
    id: string,
    maxAttempts: number,
  ): Promise<{ attempts: number; revoked: boolean } | null> {
    const rows = await this.PrismaService.$queryRaw<{ attempts: number; is_revoked: boolean }[]>`
      UPDATE "reset_password_tokens"
      SET "attempts" = "attempts" + 1,
          "is_revoked" = CASE WHEN "attempts" + 1 >= ${maxAttempts} THEN true ELSE "is_revoked" END
      WHERE "id" = ${id} AND "is_revoked" = false
      RETURNING "attempts", "is_revoked"
    `;

    if (rows.length === 0) {
      return null;
    }

    return { attempts: rows[0].attempts, revoked: rows[0].is_revoked };
  }

  public async revokeAllValidTokensByUserId(userId: string): Promise<void> {
    await this.PrismaService.resetPasswordToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }
}
