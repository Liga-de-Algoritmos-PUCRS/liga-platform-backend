import { createId } from '@paralleldrive/cuid2';

export interface GoogleCredentialsInterface {
  authorId: string;
  refresh_token?: string | null;
  expiry_date?: number | null;
  access_token?: string | null;
  token_type?: string | null;
  id_token?: string | null;
  scope?: string;
  folderId?: string | null;
  resourceId?: string | null;
  email?: string | null;
  historyId?: string | null;
}

export class GoogleCredentials {
  id: string;
  authorId: string;
  refresh_token?: string | null;
  expiry_date?: number | null;
  access_token?: string | null;
  token_type?: string | null;
  id_token?: string | null;
  scope?: string | null;
  folderId?: string | null;
  resourceId?: string | null;
  email?: string | null;
  historyId?: string | null;

  constructor(credentials: GoogleCredentialsInterface, id?: string) {
    this.id = id ?? createId();
    this.authorId = credentials.authorId;
    this.resourceId = credentials.resourceId ?? null;
    this.folderId = credentials.folderId ?? null;
    this.refresh_token = credentials.refresh_token ?? null;
    this.expiry_date = credentials.expiry_date ?? null;
    this.access_token = credentials.access_token ?? null;
    this.token_type = credentials.token_type ?? null;
    this.id_token = credentials.id_token ?? null;
    this.scope = credentials.scope ?? null;
    this.email = credentials.email ?? null;
    this.historyId = credentials.historyId ?? null;
  }

  toJSON() {
    return {
      id: this.id,
      authorId: this.authorId,
      refresh_token: this.refresh_token,
      expiry_date: this.expiry_date,
      access_token: this.access_token,
      token_type: this.token_type,
      id_token: this.id_token,
      folderId: this.folderId,
      resourceId: this.resourceId,
      scope: this.scope,
      email: this.email,
      historyId: this.historyId,
    };
  }
}
