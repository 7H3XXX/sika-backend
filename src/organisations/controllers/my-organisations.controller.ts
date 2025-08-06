import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrganisationsService } from '../organisations.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  CreateOrganisationDto,
  OrganisationFilterDto,
  UpdateOrganisationDto,
} from '../dto/organisations.dto';
import {
  getLimitAndOffset,
  paginate,
  PaginatedDto,
} from 'src/common/utils/paginated.utils';
import { QuerySearch } from 'src/common/dto/search.dto';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { AuthUser } from 'src/auth/auth.interface';
import { ApiErrorCodes } from 'types/error.codes';

@Controller('me')
@ApiTags('my organisations')
@ApiBearerAuth()
@UseGuards(RolesGuard({ allow: ['employer'] }))
export class MyOrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Get('organisations')
  @ApiOperation({ summary: `Returns a list of user's organisations` })
  async getMyOrganisations(
    @Query() filters: OrganisationFilterDto,
    @Query() query: PaginatedDto,
    @Query() search: QuerySearch,
    @GetUser() authUser: AuthUser,
  ) {
    const [limit, offset] = getLimitAndOffset(query);
    const { items, totalItems } =
      await this.organisationsService.findAllOrganisations({
        limit,
        offset,
        ...search,
        ...filters,
        ...query,
        ownerId: authUser.id,
      });
    return {
      status: true,
      message: 'User organisations retrieved successfully',
      data: paginate({
        items,
        totalItems,
        ...query,
      }),
    };
  }

  @Post('organisations')
  @ApiOperation({
    summary: `Creates user's organisation from request body`,
  })
  async postMyOrganisation(
    @GetUser() authUser: AuthUser,
    @Body() data: CreateOrganisationDto,
  ) {
    const organisation = await this.organisationsService.create({
      ...data,
      ownerId: authUser.id,
    });
    return {
      status: true,
      message: 'Organisarion created successfully',
      data: organisation,
    };
  }

  @Put('organisations/:id')
  @ApiOperation({
    summary: `Updates user's organisation with a matching id from request body`,
  })
  async putMyOrganisationById(
    @Param('id') id: string,
    @Body() data: UpdateOrganisationDto,
    @GetUser() authUser: AuthUser,
  ) {
    let organisation = await this.organisationsService.findOrganisationById(
      id,
      { ownerId: authUser.id },
    );
    if (!organisation)
      throw new NotFoundException({
        message: `No user organisation found with a matching id: ${id}`,
        errorCode: ApiErrorCodes.ORGANISATION_NOT_FOUND,
      });
    organisation = await this.organisationsService.update(id, data);
    return {
      status: true,
      message: `User organisation updated successfully`,
      data: organisation,
    };
  }

  @Delete('organisations/:id')
  @ApiOperation({ summary: `Deletes user's organisation with a matching id` })
  async deleteMyOrganisationById(
    @Param('id') id: string,
    @GetUser() authUser: AuthUser,
  ) {
    const organisation = await this.organisationsService.findOrganisationById(
      id,
      { ownerId: authUser.id },
    );
    if (!organisation)
      throw new NotFoundException({
        message: `No user organisation found with a matching id: ${id}`,
        errorCode: ApiErrorCodes.ORGANISATION_NOT_FOUND,
      });
    await this.organisationsService.delete(id);
    return {
      status: true,
      message: `User organisation deleted successfully`,
      data: null,
    };
  }
}
