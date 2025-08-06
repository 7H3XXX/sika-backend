import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JobsService } from '../jobs.service';
import { getLimitAndOffset, paginate } from 'src/common/utils/paginated.utils';
import { PublicJobListingFilterDto } from '../dto/job-listings.dto';
import { ApiErrorCodes } from 'types/error.codes';

@Controller('public/job-listings')
@ApiTags('public job listings')
export class PublicJobListingController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Returns active public job listings' })
  async getPublicJobListing(@Query() query: PublicJobListingFilterDto) {
    const [limit, offset] = getLimitAndOffset(query);
    const { items, totalItems } = await this.jobsService.findAllJobListings({
      limit,
      offset,
      isActive: true,
      ...query,
    });
    return {
      status: true,
      message: 'Public job listings retrieved successfully',
      data: paginate({ items, totalItems, ...query }),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns a public job listing with a matching id' })
  async getPublicJobListingById(@Param('id', ParseUUIDPipe) id: string) {
    const foundJob = await this.jobsService.findJobListingById(id);
    if (!foundJob) {
      throw new NotFoundException({
        message: `No job found with a matching id: ${id}`,
        errorCode: ApiErrorCodes.JOB_LISTING_NOT_FOUND,
      });
    }
    return {
      status: true,
      message: 'Job listing retrieved successfully',
      data: foundJob,
    };
  }
}
