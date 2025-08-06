import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../users.service';
import {
  getLimitAndOffset,
  paginate,
  PaginatedDto,
} from 'src/common/utils/paginated.utils';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('manage')
@ApiTags('manage users')
@ApiBearerAuth()
@UseGuards(RolesGuard({ allow: ['admin'] }))
export class ManageUsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('users')
  @ApiOperation({ summary: 'Returns all users in storage' })
  async getAll(@Query() query: PaginatedDto) {
    const [limit, offset] = getLimitAndOffset(query);
    const { items, totalItems } = await this.userService.findAllPaginated({
      limit,
      offset,
    });
    return {
      status: true,
      message: 'Users retrieved successfully',
      data: paginate({ ...query, items, totalItems }),
    };
  }
}
