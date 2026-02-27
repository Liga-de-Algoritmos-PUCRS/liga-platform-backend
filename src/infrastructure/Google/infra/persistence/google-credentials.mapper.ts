import { GoogleCredentials } from '@/infrastructure/Google/domain/google-credentials.entity';
import { GoogleCredentials as PrismaGoogleCredentials } from '@prisma/client';

export class GoogleCredentialsMapper {
  static toDomain(credentials: PrismaGoogleCredentials): GoogleCredentials {
    const model = new GoogleCredentials(
      {
        authorId: credentials.authorId,
        refresh_token: credentials.refresh_token,
        expiry_date: credentials.expiry_date ? Number(credentials.expiry_date) : null,
        access_token: credentials.access_token,
        token_type: credentials.token_type,
        id_token: credentials.id_token,
        scope: credentials.scope ?? undefined,
        resourceId: credentials.resourceId ?? undefined,
        folderId: credentials.folderId ?? undefined,
        email: credentials.email ?? undefined,
        historyId: credentials.historyId ?? undefined,
      },
      credentials.id,
    );
    return model;
  }

  static toPersistence(credentials: GoogleCredentials): PrismaGoogleCredentials {
    return {
      id: credentials.id,
      authorId: credentials.authorId,
      refresh_token: credentials.refresh_token ?? null,
      expiry_date: credentials.expiry_date ? BigInt(credentials.expiry_date) : null,
      access_token: credentials.access_token ?? null,
      token_type: credentials.token_type ?? null,
      id_token: credentials.id_token ?? null,
      folderId: credentials.folderId ?? null,
      resourceId: credentials.resourceId ?? null,
      scope: credentials.scope ?? null,
      email: credentials.email ?? null,
      historyId: credentials.historyId ?? null,
    };
  }
}
