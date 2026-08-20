import { Injectable } from '@nestjs/common';
import { Token2Fa } from '@/modules/Auth/signup/domain/2fa-token.entity';
import { Token2FARepository } from '@/modules/Auth/signup/domain/2fa-token.repository';
import { PrismaService } from '@/infrastructure/Database/prisma.service';
import { Token2FAMapper } from '@/modules/Auth/signup/infra/persistence/2fa-token.mapper';
import { Transaction } from '@/infrastructure/Database/Transaction/transaction.adapter';

@Injectable()
export class PrismaToken2FaRepository implements Token2FARepository {
  constructor(private readonly prisma: PrismaService) {}

  public async createToken2FA(token2Fa: Token2Fa): Promise<Token2Fa> {
    const data = Token2FAMapper.toPersistence(token2Fa);
    const resultToken = await this.prisma.token2FA.create({
      data: data,
    });
    return Token2FAMapper.toDomain(resultToken);
  }

  public async findValidToken2FA(id: string): Promise<Token2Fa | null> {
    const token2Fa = await this.prisma.token2FA.findFirst({
      where: {
        id: id,
      },
    });
    return token2Fa ? Token2FAMapper.toDomain(token2Fa) : null;
  }

  public async findValidToken2FAByEmail(email: string): Promise<Token2Fa | null> {
    // No maximo 1 token nao revogado por e-mail -- o signup revoga os
    // anteriores antes de criar um novo -- mas pega o mais recente por
    // criacao para o fluxo de revogado/expirado continuar funcionando igual
    // ao lookup por id.
    const token2Fa = await this.prisma.token2FA.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: 'desc' },
    });
    return token2Fa ? Token2FAMapper.toDomain(token2Fa) : null;
  }

  public async revokeToken2FaById(id: string, tx?: Transaction): Promise<boolean> {
    const client = tx ?? this.prisma;
    await client.token2FA.update({
      where: { id: id },
      data: { isRevoked: true },
    });
    return true;
  }

  public async incrementAttempts(
    id: string,
    maxAttempts: number,
  ): Promise<{ attempts: number; revoked: boolean } | null> {
    const rows = await this.prisma.$queryRaw<{ attempts: number; is_revoked: boolean }[]>`
      UPDATE "token2fa"
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

  public async revokeAllValidTokensByEmail(email: string): Promise<void> {
    await this.prisma.token2FA.updateMany({
      where: { userEmail: email, isRevoked: false },
      data: { isRevoked: true },
    });
  }
}
