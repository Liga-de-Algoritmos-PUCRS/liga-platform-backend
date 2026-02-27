import { Module } from '@nestjs/common';
import { GoogleController } from '@/infrastructure/Google/infra/presentation/google.controller';
import { GetAuthGoogleUrlService } from '@/infrastructure/Google/application/services/auth/get-auth-url.service';
import { GetAuthGoogleTokensService } from '@/infrastructure/Google/application/services/auth/get-auth-tokens.service';
import { GoogleHelperIntegrationService } from '@/infrastructure/Google/application/services/google-helper-integration';
import { CreateDriveFolderWatchService } from '@/infrastructure/Google/application/services/drive/create-drive-folder-watch.service';
import { GetGoogleIntegrationStatus } from '@/infrastructure/Google/application/services/auth/get-integration-status.service';
import { HandleGoogleWebhookService } from '@/infrastructure/Google/application/services/drive/handle-drive-webhook.service';
import { ListCalendarEventsService } from '@/infrastructure/Google/application/services/calendar/list-calendar-events.service';
import { CreateCalendarEventService } from '@/infrastructure/Google/application/services/calendar/create-calendar-event.service';
import { ListGmailMessagesService } from './application/services/gmail/list-gmail-messages.service';
import { GetGmailMessageService } from './application/services/gmail/get-gmail-message.service';
import { WatchGmailInboxService } from './application/services/gmail/watch-gmail-inbox.service';
import { HandleGmailWebhookService } from './application/services/gmail/handle-gmail-webhook.service';
import { SendGmailMessageService } from './application/services/gmail/send-gmail-message.service';
import { LinkEmailToNegociationService } from './application/services/gmail/link-email-to-negociation.service';
@Module({
  imports: [],
  controllers: [GoogleController],
  providers: [
    GetAuthGoogleUrlService,
    GetAuthGoogleTokensService,
    GoogleHelperIntegrationService,
    CreateDriveFolderWatchService,
    GetGoogleIntegrationStatus,
    HandleGoogleWebhookService,
    SendGmailMessageService,
    ListCalendarEventsService,
    CreateCalendarEventService,
    LinkEmailToNegociationService,
    ListGmailMessagesService,
    GetGmailMessageService,
    WatchGmailInboxService,
    HandleGmailWebhookService,
  ],
  exports: [],
})
export class GoogleModule {}
