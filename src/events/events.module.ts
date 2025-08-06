import { Module } from '@nestjs/common';
import { UserEventsService } from './user.events';
import { AppEventsService } from './app.events';

@Module({
  providers: [UserEventsService, AppEventsService],
})
export class EventsModule {}
