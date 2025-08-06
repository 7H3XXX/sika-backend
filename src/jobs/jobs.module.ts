import { Module } from '@nestjs/common';
import { PublicJobListingController } from './controllers/public-listings.controller';
import { JobsService } from './jobs.service';
import { DatabaseModule } from 'src/database/database.module';
import { JobListingMiscController } from './controllers/misc.controller';
import { JobListingsController } from './controllers/listings.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [
    PublicJobListingController,
    JobListingMiscController,
    JobListingsController,
  ],
  providers: [JobsService],
  imports: [DatabaseModule, UsersModule],
})
export class JobsModule {}
