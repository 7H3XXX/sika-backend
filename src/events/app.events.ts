import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppContracts } from 'src/app.contracts';
import { EventsAppInternalErrorDto } from './dto/app-events.dto';
import { MailService } from 'libs/mail/mail.service';
import { env } from 'env.config';

@Injectable()
export class AppEventsService {
  constructor(private readonly mailService: MailService) {}

  @OnEvent(AppContracts.events.app.internalError)
  EventsAppInternalError(data: EventsAppInternalErrorDto) {
    const subject = `🚨 Internal Server Error:::${data.appName}`;
    this.mailService.sendMail({
      to: env.DEV_TEAM_EMAILS,
      subject,
      context: data,
      template: '500-server-error',
    });
  }
}
