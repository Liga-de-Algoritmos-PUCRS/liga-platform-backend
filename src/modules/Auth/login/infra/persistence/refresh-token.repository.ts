import { Injectable } from '@nestjs/common';
import { RefreshToken } from '@/modules/Auth/login/domain/refresh-token.entity';
import { RefreshTokenRepository } from '@/modules/Auth/login/domain/refresh-token.repository';
import { PrismaService } from '@/infrastructure/Database/prisma.service';
import { RefreshTokenMapper } from '@/modules/Auth/login/infra/persistence/refresh-token.mapper';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async createRefreshToken(refreshToken: RefreshToken): Promise<void> {
    const data = RefreshTokenMapper.toPersistence(refreshToken);
    await this.prisma.refreshToken.create({
      data: data,
    });
  }

  public async findRefreshTokenById(id: string): Promise<RefreshToken | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { id },
    });

    return refreshToken ? RefreshTokenMapper.toDomain(refreshToken) : null;
  }

  public async revokeAllRefreshTokensByAccountId(accountId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId: accountId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });
  }

  public async revokeRefreshTokenById(id: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { id: id },
      data: { isRevoked: true, revokedAt: new Date() },
    });
  }

  public async deleteStaleRefreshTokens(now: Date, revokedBefore: Date): Promise<number> {
    const { count } = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: now } }, { isRevoked: true, revokedAt: { lt: revokedBefore } }],
      },
    });

    return count;
  }
}
