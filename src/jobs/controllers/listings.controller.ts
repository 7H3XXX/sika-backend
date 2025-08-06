import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JobsService } from '../jobs.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { AuthUser } from 'src/auth/auth.interface';
import { JobListingFilterDto } from '../dto/job-listings.dto';
import { getLimitAndOffset, paginate } from 'src/common/utils/paginated.utils';

@Controller('job-listings')
@ApiTags('job listings')
export class JobListingsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @UseGuards(RolesGuard({ allow: ['employer'] }))
  @ApiOperation({ summary: 'Returns a list of user created job listings' })
  @ApiBearerAuth()
  async getJobListings(
    @Query() query: JobListingFilterDto,
    @GetUser() authUser: AuthUser,
  ) {
    const [limit, offset] = getLimitAndOffset(query);
    const itemsAndTotal = await this.jobsService.findAllJobListings({
      createdById: authUser.id,
      limit,
      offset,
      ...query,
    });
    return {
      status: true,
      message: 'Job listings created successfully',
      data: paginate({ ...itemsAndTotal, ...query }),
    };
  }
}
