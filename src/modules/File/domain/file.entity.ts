import { createId } from '@paralleldrive/cuid2';

export interface FileInterface {
  name: string;
  size: number;
  type: string;
  fileUrl: string;
  authorId: string;
  negociationId?: string;
  deleted: boolean;
  deletedAt?: Date | null;
  messageId?: string | null;
}

export class File implements FileInterface {
  id: string;
  name: string;
  size: number;
  type: string;
  fileUrl: string;
  authorId: string;
  negociationId?: string;
  createdAt: Date;
  deleted: boolean;
  deletedAt?: Date | null;

  constructor(file: FileInterface, id?: string, createdAt?: Date) {
    this.id = id ?? createId();
    this.name = file.name;
    this.size = file.size;
    this.type = file.type;
    this.fileUrl = file.fileUrl;
    this.authorId = file.authorId;
    this.negociationId = file.negociationId;
    this.createdAt = createdAt ?? new Date();
    this.deleted = file.deleted || false;
    this.deletedAt = file.deletedAt || null;
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      size: this.size,
      type: this.type,
      fileUrl: this.fileUrl,
      authorId: this.authorId,
      negociationId: this.negociationId,
      createdAt: this.createdAt,
      deleted: this.deleted,
      deletedAt: this.deletedAt,
    };
  }
}
