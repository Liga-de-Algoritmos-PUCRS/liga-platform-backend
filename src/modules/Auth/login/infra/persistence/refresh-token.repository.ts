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

  public async findNonExpiredRefreshTokensByAccountId(accountId: string): Promise<RefreshToken[]> {
    const refreshTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: accountId,
        expiresAt: { gt: new Date() },
      },
    });

    return refreshTokens.map((refreshToken) => RefreshTokenMapper.toDomain(refreshToken));
  }

  public async deleteExpiredRefreshTokens(): Promise<number> {
    const { count } = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lte: new Date() },
      },
    });

    return count;
  }

  public async revokeAllRefreshTokensByAccountId(accountId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId: accountId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });
  }

  public async revokeRefreshTokenById(id: string): Promise<boolean> {
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { id, isRevoked: false },
      data: { isRevoked: true },
    });

    return count > 0;
  }
}
