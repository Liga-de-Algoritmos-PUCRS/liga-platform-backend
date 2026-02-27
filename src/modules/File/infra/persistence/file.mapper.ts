import { File } from '@/modules/File/domain/file.entity';
import { File as PrismaFile } from '@prisma/client';

export class FileMapper {
  static toDomain(file: PrismaFile): File {
    const model = new File(
      {
        name: file.name,
        size: typeof file.size === 'number' ? file.size : Number(file.size),
        type: file.type,
        fileUrl: file.fileUrl,
        authorId: file.authorId,
        deleted: file.deleted,
        deletedAt: file.deletedAt ?? null,
        negociationId: file.negociationId ?? undefined,
      },
      file.id,
      file.createdAt,
    );
    return model;
  }

  static toPersistence(file: File): PrismaFile {
    return {
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
      negociationId: file.negociationId || null,
      fileUrl: file.fileUrl,
      authorId: file.authorId,
      createdAt: file.createdAt,
      deleted: file.deleted,
      deletedAt: file.deletedAt || null,
    };
  }
}
