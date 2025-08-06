import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { OrganisationFilterDto } from '../dto/organisations.dto';
import {
  getLimitAndOffset,
  paginate,
  PaginatedDto,
} from 'src/common/utils/paginated.utils';
import { OrganisationsService } from '../organisations.service';
import { QuerySearch } from 'src/common/dto/search.dto';

@Controller('manage')
@ApiTags('manage organisations')
export class ManageOrganisationsController {
  constructor(private readonly organisationService: OrganisationsService) {}

  @Get('organisations')
  @ApiOperation({ summary: 'Returns a list of all organisations' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard({ allow: ['admin'] }))
  async getManageOrganisations(
    @Query() organisationFilters: OrganisationFilterDto,
    @Query() query: PaginatedDto,
    @Query() search: QuerySearch,
  ) {
    const [limit, offset] = getLimitAndOffset(query);
    const { items, totalItems } =
      await this.organisationService.findAllOrganisations({
        limit,
        offset,
        ...search,
        ...organisationFilters,
      });
    return {
      status: true,
      message: 'Organisations retrieved successfully',
      data: paginate({ items, totalItems, ...query }),
    };
  }
}
