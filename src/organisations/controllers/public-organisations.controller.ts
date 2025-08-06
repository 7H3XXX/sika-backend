import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrganisationsService } from '../organisations.service';
import { ApiErrorCodes } from 'types/error.codes';

@Controller('public')
@ApiTags('public organisations')
export class PublicOrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Get('organisations/:id')
  @ApiOperation({ summary: 'Returns organisation with a matching id' })
  async getPublicOrganisation(@Param('id') id: string) {
    const organisation =
      await this.organisationsService.findOrganisationById(id);
    if (!organisation)
      throw new NotFoundException({
        message: `No organisation found with a matching id: ${id}`,
        errorCode: ApiErrorCodes.ORGANISATION_NOT_FOUND,
      });
    return {
      status: true,
      message: 'Organisation retrieved successfully',
      data: organisation,
    };
  }
}
