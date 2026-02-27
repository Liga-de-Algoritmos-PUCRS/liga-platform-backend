import { GoogleCredentials } from './google-credentials.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class GoogleCredentialsRepository {
  public abstract createCredentials(credentials: GoogleCredentials): Promise<GoogleCredentials>;
  public abstract findByAuthorId(authorId: string): Promise<GoogleCredentials[]>;
  public abstract findByEmail(emailAddress: string): Promise<GoogleCredentials | null>;
  public abstract findById(id: string): Promise<GoogleCredentials | null>;
  public abstract findByResourceId(resourceId: string): Promise<GoogleCredentials | null>;
  public abstract updateCredentials(credentials: GoogleCredentials): Promise<GoogleCredentials>;
  public abstract updateHistoryId(googleCredentials: GoogleCredentials): Promise<GoogleCredentials>;
  public abstract deleteCredentials(id: string): Promise<boolean>;
}
