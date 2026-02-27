import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { BucketModule } from '@/infrastructure/Bucket/bucket.module';
import { CryptographyModule } from '@/infrastructure/Criptography/criptography.module';
import { DatabaseModule } from '@/infrastructure/Database/database.module';
import { ExceptionModule } from '@/infrastructure/Exceptions/exceptions.module';
import { AuthModule } from '@/modules/Auth/auth.module';
import { FileModule } from '@/modules/File/file.module';
import { UserModule } from '@/modules/User/user.module';
import { envSchema } from '@/global/env.schema';
import { JwtAuthGuard } from '@/global/common/guards/jwt-auth.guard';
import { QueueModule } from '@/infrastructure/Queue/queue.module';
import { CronModule } from '@/infrastructure/Cron/cron.module';
import { LoggerModule } from '@/infrastructure/Logger/logger.module';
import { LoggerInterceptor } from '@/infrastructure/Logger/services/logger.interceptor';
import { AccountModule } from '@/modules/Account/account.module';
import { CookiesModule } from '@/infrastructure/Cookies/cookies.module';
import { BusinessModule } from '@/modules/Business/business.module';
import { ContactModule } from '@/modules/Contact/contact.module';
import { WorkspaceModule } from '@/modules/Workspace/workspace.module';
import { NegociationModule } from '@/modules/Negociation/negociation.module';
import { FileMovimentationModule } from '@/infrastructure/Triggers/FileMovimentation/fileMovimentation.module';
import { TaskModule } from '@/modules/Task/task.module';
import { EventModule } from '@/modules/Events/events.module';
import { SuggestionModule } from '@/modules/Suggestion/suggestion.module';
import { GoogleModule } from '@/infrastructure/Google/google.module';
import { BedrockModule } from '@/infrastructure/Bedrock/bedrock.module';
import { MessageModule } from '@/modules/Message/message.module';
import { ChatModule } from '@/modules/Chat/chat.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      maxListeners: 15,
      wildcard: true,
      delimiter: '.',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (env) => envSchema.parse(env),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 500,
      },
    ]),
    ExceptionModule,
    LoggerModule,
    CryptographyModule,
    CronModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    AccountModule,
    QueueModule,
    FileModule,
    WorkspaceModule,
    EventModule,
    BucketModule,
    CookiesModule,
    BusinessModule,
    ContactModule,
    NegociationModule,
    TaskModule,
    SuggestionModule,
    GoogleModule,
    FileMovimentationModule,
    BedrockModule,
    ChatModule,
    MessageModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule {}
