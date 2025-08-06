import { Module } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { MyOrganisationsController } from './controllers/my-organisations.controller';
import { ManageOrganisationsController } from './controllers/manage-organisations.controller';
import { UsersModule } from 'src/users/users.module';
import { DatabaseModule } from 'src/database/database.module';
import { PublicOrganisationsController } from './controllers/public-organisations.controller';

@Module({
  providers: [OrganisationsService],
  controllers: [
    MyOrganisationsController,
    ManageOrganisationsController,
    PublicOrganisationsController,
  ],
  imports: [UsersModule, DatabaseModule],
})
export class OrganisationsModule {}
