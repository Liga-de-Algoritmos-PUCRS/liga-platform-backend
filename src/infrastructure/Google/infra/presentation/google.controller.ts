import { ApiTags } from '@nestjs/swagger';
import { ApiOkResponse } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/global/common/guards/jwt-auth.guard';
import { Public } from '@/global/common/decorators/public.decorator';
import { Get, Post, Body, Query, Controller, Headers, Res, Param } from '@nestjs/common';
import type { Response } from 'express';
import { GetAuthGoogleTokensService } from '@/infrastructure/Google/application/services/auth/get-auth-tokens.service';
import { GetAuthGoogleUrlService } from '@/infrastructure/Google/application/services/auth/get-auth-url.service';
import { GetUser } from '@/global/common/decorators/get-user.decorator';
import { GetGoogleIntegrationStatus } from '@/infrastructure/Google/application/services/auth/get-integration-status.service';
import { CreateDriveFolderWatchService } from '@/infrastructure/Google/application/services/drive/create-drive-folder-watch.service';
import { ConfigService } from '@nestjs/config';
import { CreateDriveWatchDTO } from '@/infrastructure/Google/application/dtos/create-drive-watch.dto';
import { GetAuthGoogleUrlServiceResponseDTO } from '@/infrastructure/Google/application/dtos/google-response';
import { GetGoogleIntegrationStatusResponseDTO } from '@/infrastructure/Google/application/dtos/google-response';
import { HandleGoogleWebhookService } from '@/infrastructure/Google/application/services/drive/handle-drive-webhook.service';
import { LinkEmailToNegociationService } from '@/infrastructure/Google/application/services/gmail/link-email-to-negociation.service';
import { LinkEmailToNegociationDTO } from '@/infrastructure/Google/application/dtos/link-email-to-negociation.dto';
import {
  GoogleCallbackDecorator,
  GetAuthGoogleUrlDecorator,
  GetGoogleIntegrationStatusDecorator,
  CreateDriveFolderWatchDecorator,
  CreateCalendarEventDecorator,
  ListCalendarEventsDecorator,
  WatchGmailInboxDecorator,
  HandleGmailWebhookDecorator,
  ListGmailMessagesDecorator,
  GetGmailMessageDecorator,
  SendGmailMessageDecorator,
  LinkEmailToNegociationDecorator,
} from '@/infrastructure/Google/application/dtos/google.decorators';
import { ListCalendarEventsService } from '@/infrastructure/Google/application/services/calendar/list-calendar-events.service';
import { CreateCalendarEventService } from '@/infrastructure/Google/application/services/calendar/create-calendar-event.service';
import { CreateGoogleEventDTO } from '@/infrastructure/Google/application/dtos/create-google-event.dto';
import { CreateEventResponseDTO } from '@/infrastructure/Google/application/dtos/google-response';
import { ListGmailMessagesService } from '@/infrastructure/Google/application/services/gmail/list-gmail-messages.service';
import { GetGmailMessageService } from '@/infrastructure/Google/application/services/gmail/get-gmail-message.service';
import { WatchGmailInboxService } from '@/infrastructure/Google/application/services/gmail/watch-gmail-inbox.service';
import { HandleGmailWebhookService } from '@/infrastructure/Google/application/services/gmail/handle-gmail-webhook.service';
import { WatchGmailInboxResponseDTO } from '@/infrastructure/Google/application/dtos/watch-gmail-response.dto';
import { GmailMessageDetailsDTO } from '@/infrastructure/Google/application/dtos/gmail-message.dto';
import { GooglePubSubMessageDTO } from '../../application/dtos/google-pubsub-message.dto';
import { SendGmailMessageService } from '@/infrastructure/Google/application/services/gmail/send-gmail-message.service';
import {
  SendGmailMessageDTO,
  SendGmailMessageResponseDTO,
} from '@/infrastructure/Google/application/dtos/send-gmail-message.dto';

@Controller('google')
@ApiTags('Google')
export class GoogleController {
  constructor(
    private readonly GetAuthGoogleTokensService: GetAuthGoogleTokensService,
    private readonly GetAuthGoogleUrlService: GetAuthGoogleUrlService,
    private readonly GetGoogleIntegrationStatus: GetGoogleIntegrationStatus,
    private readonly CreateDriveFolderWatchService: CreateDriveFolderWatchService,
    private readonly SendGmailMessageService: SendGmailMessageService,
    private readonly HandleGoogleWebhookService: HandleGoogleWebhookService,
    private readonly ListCalendarEventsService: ListCalendarEventsService,
    private readonly CreateCalendarEventService: CreateCalendarEventService,
    private readonly LinkEmailToNegociationService: LinkEmailToNegociationService,
    private readonly ListGmailMessagesService: ListGmailMessagesService,
    private readonly GetGmailMessageService: GetGmailMessageService,
    private readonly WatchGmailInboxService: WatchGmailInboxService,
    private readonly HandleGmailWebhookService: HandleGmailWebhookService,
    private readonly ConfigService: ConfigService,
  ) {}

  @Get('callback')
  @Public()
  @GoogleCallbackDecorator
  async googleCallback(
    @Query('code') code: string,
    @Query('state') userId: string,
    @Res() res: Response<void>,
  ): Promise<void> {
    await this.GetAuthGoogleTokensService.execute(code, userId);
    const frontendUrl = this.ConfigService.get('FRONTEND_URL') ?? 'http://localhost:5173';
    res.redirect(`${frontendUrl}/integration`);
  }

  @Get('auth-url')
  @GetAuthGoogleUrlDecorator
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: String })
  getAuthUrl(@GetUser('id') userId: string): GetAuthGoogleUrlServiceResponseDTO {
    return this.GetAuthGoogleUrlService.execute(userId);
  }

  @Get('status')
  @GetGoogleIntegrationStatusDecorator
  @UseGuards(JwtAuthGuard)
  async getIntegrationStatus(
    @GetUser('id') userId: string,
  ): Promise<GetGoogleIntegrationStatusResponseDTO> {
    return await this.GetGoogleIntegrationStatus.execute(userId);
  }

  @Post('drive/watch')
  @CreateDriveFolderWatchDecorator
  @UseGuards(JwtAuthGuard)
  async setupWatch(@GetUser('id') userId: string, @Body() body: CreateDriveWatchDTO) {
    await this.CreateDriveFolderWatchService.execute(userId, body.folderId);
  }

  @Post('drive/webhook')
  @Public()
  async handleWebhook(@Body() body: unknown, @Headers() headers): Promise<void> {
    const channelId = headers['x-goog-channel-id'] as string;
    const resourceState = headers['x-goog-resource-state'] as string;

    return await this.HandleGoogleWebhookService.execute(channelId, resourceState);
  }

  @Get('calendar/events')
  @UseGuards(JwtAuthGuard)
  @ListCalendarEventsDecorator
  async listEvents(@GetUser('id') userId: string) {
    return await this.ListCalendarEventsService.execute(userId);
  }

  @Post('calendar/events')
  @CreateCalendarEventDecorator
  @UseGuards(JwtAuthGuard)
  async createEvent(
    @GetUser('id') userId: string,
    @Body() data: CreateGoogleEventDTO,
  ): Promise<CreateEventResponseDTO> {
    return await this.CreateCalendarEventService.execute(userId, data);
  }

  @Post('gmail/watch')
  @UseGuards(JwtAuthGuard)
  @WatchGmailInboxDecorator
  async watchGmail(@GetUser('id') userId: string): Promise<WatchGmailInboxResponseDTO> {
    return await this.WatchGmailInboxService.execute(userId);
  }

  @Post('gmail/webhook')
  @HandleGmailWebhookDecorator
  @Public()
  async handleGmailWebhook(@Body() body: GooglePubSubMessageDTO): Promise<void> {
    return await this.HandleGmailWebhookService.execute(body);
  }

  @Get('gmail/messages')
  @ListGmailMessagesDecorator
  async listMessages(@GetUser('id') userId: string, @Query('maxResults') maxResults?: number) {
    return await this.ListGmailMessagesService.execute(
      userId,
      maxResults ? Number(maxResults) : 10,
    );
  }

  @Get('gmail/messages/:id')
  @GetGmailMessageDecorator
  async getMessage(
    @GetUser('id') userId: string,
    @Param('id') messageId: string,
  ): Promise<GmailMessageDetailsDTO> {
    return await this.GetGmailMessageService.execute(userId, messageId);
  }

  @Post('gmail/messages/send')
  @SendGmailMessageDecorator
  async sendMessage(
    @GetUser('id') userId: string,
    @Body() body: SendGmailMessageDTO,
  ): Promise<SendGmailMessageResponseDTO> {
    return await this.SendGmailMessageService.execute(userId, body);
  }

  @Post('link-email')
  @LinkEmailToNegociationDecorator
  async linkEmail(
    @Body() body: LinkEmailToNegociationDTO,
    @GetUser('id') userId: string,
  ): Promise<void> {
    return await this.LinkEmailToNegociationService.execute(body, userId);
  }
}
