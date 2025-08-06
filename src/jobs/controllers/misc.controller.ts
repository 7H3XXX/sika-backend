import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JobsService } from '../jobs.service';

@Controller('public')
@ApiTags('public job miscellaneous')
export class JobListingMiscController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('job-categories')
  @ApiOperation({ summary: 'Returns a list of job categories' })
  async getJobCategories() {
    const categories = await this.jobsService.findAllCategories();
    return {
      status: true,
      message: 'Job categories retrieved successfully',
      data: categories,
    };
  }

  @Get('job-skills')
  @ApiOperation({ summary: 'Returns a list of job skills' })
  async getJobSkills() {
    const skills = await this.jobsService.findAllJobSkills();
    return {
      status: true,
      message: 'Job skills retrieved successfully',
      data: skills,
    };
  }

  @Get('job-types')
  @ApiOperation({ summary: 'Returns a list of job types' })
  getJobTypes() {
    const types = this.jobsService.findAllJobTypes();
    return {
      status: true,
      message: 'Job types retrieved succeesfully',
      data: types,
    };
  }
  @Get('job-status')
  @ApiOperation({ summary: 'Returns a list of job status' })
  getJobStatus() {
    const status = this.jobsService.findAllJobStatus();
    return {
      status: true,
      message: 'Job status retrieved succeesfully',
      data: status,
    };
  }
  @Get('job-experience-levels')
  @ApiOperation({ summary: 'Returns a list of job experience levels' })
  getJobExperienceLevels() {
    const levels = this.jobsService.findAllJobExperienceLevels();
    return {
      status: true,
      message: 'Job experience levels retrieved succeesfully',
      data: levels,
    };
  }
}
