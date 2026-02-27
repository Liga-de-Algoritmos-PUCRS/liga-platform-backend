import { Global, Module } from '@nestjs/common';
import { RefreshTokenRepository } from '@/modules/Auth/login/domain/refresh-token.repository';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { PrismaUserRepository } from '@/modules/User/infra/persistence/user.repository';
import { PrismaService } from '@/infrastructure/Database/prisma.service';
import { PrismaRefreshTokenRepository } from '@/modules/Auth/login/infra/persistence/refresh-token.repository';
import { FileRepository } from '@/modules/File/domain/file.repository';
import { PrismaFileRepository } from '@/modules/File/infra/persistence/file.repository';
import { Token2FARepository } from '@/modules/Auth/signup/domain/2fa-token.repository';
import { PrismaToken2FaRepository } from '@/modules/Auth/signup/infra/persistence/2fa-token.repository';
import { ResetPasswordTokenRepository } from '@/modules/Auth/resetPassword/domain/reset-password-token.repository';
import { PrismaResetPasswordTokenRepository } from '@/modules/Auth/resetPassword/infra/persistence/reset-passaword-token.repository';
import { TransactionAdapter } from './Transaction/transaction.adapter';
import { PrismaTransactionIntegration } from './Transaction/transaction.service';
import { AccountRepository } from '@/modules/Account/domain/account.repository';
import { PrismaAccountRepository } from '@/modules/Account/infra/persistence/account.repository';
import { VerifyPhoneRepository } from '@/modules/Auth/verifyPhone/domain/verify-phone-repository';
import { PrismaVerifyPhoneRepository } from '@/modules/Auth/verifyPhone/infra/persistence/verify-phone.repository';
import { BusinessRepository } from '@/modules/Business/domain/business.repository';
import { PrismaBusinessRepository } from '@/modules/Business/infra/persistence/business.repository';
import { ContactRepository } from '@/modules/Contact/domain/contact.repository';
import { PrismaContactRepository } from '@/modules/Contact/infra/persistence/contact.repository';
import { WorkspaceRepository } from '@/modules/Workspace/domain/workspace.repository';
import { PrismaWorkspaceRepository } from '@/modules/Workspace/infra/persistence/workspace.repository';
import { NegociationRepository } from '@/modules/Negociation/domain/negociation.repository';
import { PrismaNegociationRepository } from '@/modules/Negociation/infra/persistence/negociation.repository';
import { TaskRepository } from '@/modules/Task/domain/task.repository';
import { PrismaTaskRepository } from '@/modules/Task/infra/persistence/task.repository';
import { EventRepository } from '@/modules/Events/domain/event.repository';
import { PrismaEventRepository } from '@/modules/Events/infra/persistence/event.repository';
import { SuggestionRepository } from '@/modules/Suggestion/domain/suggestion.repository';
import { PrismaSuggestionRepository } from '@/modules/Suggestion/infra/persistence/suggestion.repository';
import { GoogleCredentialsRepository } from '@/infrastructure/Google/domain/google-credentials.repository';
import { PrismaGoogleCredentialsRepository } from '@/infrastructure/Google/infra/persistence/google-credentials.repository';
import { FileMovimentationRepository } from '@/infrastructure/Triggers/FileMovimentation/domain/file-movimentation.repository';
import { PrismaFileMovimentationRepository } from '@/infrastructure/Triggers/FileMovimentation/infra/persistence/file-movimentation.repository';
import { ChatRepository } from '@/modules/Chat/domain/chat.repository';
import { PrismaChatRepository } from '@/modules/Chat/infra/persistence/chat.repository';
import { MessageRepository } from '@/modules/Message/domain/message.repository';
import { PrismaMessageRepository } from '@/modules/Message/infra/persistence/message.repository';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: FileRepository,
      useClass: PrismaFileRepository,
    },
    {
      provide: RefreshTokenRepository,
      useClass: PrismaRefreshTokenRepository,
    },
    {
      provide: Token2FARepository,
      useClass: PrismaToken2FaRepository,
    },
    {
      provide: ResetPasswordTokenRepository,
      useClass: PrismaResetPasswordTokenRepository,
    },
    {
      provide: TransactionAdapter,
      useClass: PrismaTransactionIntegration,
    },
    {
      provide: AccountRepository,
      useClass: PrismaAccountRepository,
    },
    {
      provide: VerifyPhoneRepository,
      useClass: PrismaVerifyPhoneRepository,
    },
    {
      provide: BusinessRepository,
      useClass: PrismaBusinessRepository,
    },
    {
      provide: ContactRepository,
      useClass: PrismaContactRepository,
    },
    {
      provide: TaskRepository,
      useClass: PrismaTaskRepository,
    },
    {
      provide: EventRepository,
      useClass: PrismaEventRepository,
    },
    {
      provide: WorkspaceRepository,
      useClass: PrismaWorkspaceRepository,
    },
    {
      provide: NegociationRepository,
      useClass: PrismaNegociationRepository,
    },
    {
      provide: SuggestionRepository,
      useClass: PrismaSuggestionRepository,
    },
    {
      provide: GoogleCredentialsRepository,
      useClass: PrismaGoogleCredentialsRepository,
    },
    {
      provide: FileMovimentationRepository,
      useClass: PrismaFileMovimentationRepository,
    },
    {
      provide: ChatRepository,
      useClass: PrismaChatRepository,
    },
    {
      provide: MessageRepository,
      useClass: PrismaMessageRepository,
    },
  ],
  exports: [
    AccountRepository,
    WorkspaceRepository,
    NegociationRepository,
    EventRepository,
    TaskRepository,
    FileMovimentationRepository,
    UserRepository,
    SuggestionRepository,
    BusinessRepository,
    ContactRepository,
    RefreshTokenRepository,
    FileRepository,
    Token2FARepository,
    ResetPasswordTokenRepository,
    VerifyPhoneRepository,
    GoogleCredentialsRepository,
    ChatRepository,
    MessageRepository,
    TransactionAdapter,
    PrismaService,
  ],
})
export class DatabaseModule {}
