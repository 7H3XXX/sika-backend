import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { ManageUsersController } from './controllers/manage-users.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UserRolesService } from './users-roles.service';

@Module({
  providers: [UsersService, UserRolesService],
  controllers: [ManageUsersController],
  imports: [DatabaseModule],
  exports: [UsersService, UserRolesService],
})
export class UsersModule {}
