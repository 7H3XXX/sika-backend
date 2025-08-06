import { Injectable } from '@nestjs/common';
import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  SQL,
} from 'drizzle-orm';
import { DBSchema } from 'src/database/schemas';
import {
  Database,
  InjectDatabase,
  PageOptions,
  pgEnumToObject,
  TableColumns,
  withQueryColumns,
} from 'src/database/utils';
import {
  JobListingFilterDto,
  PublicJobListingFilterDto,
} from './dto/job-listings.dto';
import {
  experienceLevelEnum,
  listingStatusEnum,
  listingTypeEnum,
} from './entities/schema';

@Injectable()
export class JobsService {
  public readonly dataFields: TableColumns<typeof DBSchema.jobListing> = [
    'createdAt',
    'title',
    'type',
    'city',
    'country',
    'salaryFrom',
    'salaryTo',
    'experienceLevel',
  ];
  constructor(@InjectDatabase private readonly db: Database) {}
  async findJobListingById(id: string) {
    const foundJob = await this.db.query.jobListing.findFirst({
      with: {
        category: {
          columns: withQueryColumns(DBSchema.jobCategory, [
            'id',
            'name',
            'iconUrl',
          ]),
        },
        organisation: {
          columns: withQueryColumns(DBSchema.organisation, [
            'id',
            'name',
            'website',
            'about',
            'imageUrl',
          ]),
        },
        jobToSkills: {
          with: {
            jobSkill: {
              columns: withQueryColumns(DBSchema.jobSkill, ['id', 'name']),
            },
          },
        },
      },
      where: eq(DBSchema.jobListing.id, id),
    });
    if (!foundJob) return null;
    const { jobToSkills, ...jobData } = foundJob;
    return {
      skills: jobToSkills.map((value) => ({
        id: value.jobSkill?.id,
        name: value.jobSkill?.name,
      })),
      ...jobData,
    };
  }
  async findAllJobListings(
    options: PageOptions &
      Partial<PublicJobListingFilterDto> &
      Partial<JobListingFilterDto>,
  ) {
    const conditions: (SQL<unknown> | undefined)[] = [];
    // query filters
    if (options.isActive) {
      conditions.push(eq(DBSchema.jobListing.isActive, options.isActive));
    }
    if (options.categoryIds) {
      conditions.push(
        inArray(DBSchema.jobListing.categoryId, options.categoryIds),
      );
    }
    if (options.types) {
      conditions.push(inArray(DBSchema.jobListing.type, options.types));
    }
    if (options.experienceLevels) {
      conditions.push(
        inArray(DBSchema.jobListing.experienceLevel, options.experienceLevels),
      );
    }
    if (options.dateRanges) {
      conditions.push(
        or(
          ...options.dateRanges.map((item) =>
            gte(DBSchema.jobListing.createdAt, item),
          ),
        ),
      );
    }
    if (options.location) {
      conditions.push(
        or(
          ...options.location
            .split(' ')
            // TODO: Replace LIKE query with Postgres Full Text Search
            .map((value) => ilike(DBSchema.jobListing.country, `%${value}%`)),
          ...options.location
            .split(' ')
            // TODO: Replace LIKE query with Postgres Full Text Search
            .map((value) => ilike(DBSchema.jobListing.city, `%${value}%`)),
        ),
      );
    }
    if (options.search) {
      conditions.push(
        or(
          ...options.search
            .split(' ')
            // TODO: Replace LIKE query with Postgres Full Text Search
            .map((value) => ilike(DBSchema.jobListing.title, `%${value}%`)),
        ),
      );
    }
    if (options.salaryFrom) {
      conditions.push(gte(DBSchema.jobListing.salaryFrom, options.salaryFrom));
    }
    if (options.salaryTo) {
      conditions.push(lte(DBSchema.jobListing.salaryFrom, options.salaryTo));
    }
    if (options.organisationId) {
      conditions.push(
        eq(DBSchema.jobListing.organisationId, options.organisationId),
      );
    }
    if (options.createdById) {
      conditions.push(eq(DBSchema.jobListing.createdById, options.createdById));
    }
    const items = await this.db.query.jobListing.findMany({
      where: and(...conditions),
      columns: withQueryColumns(DBSchema.jobListing, [
        'id',
        'createdAt',
        'title',
        'city',
        'country',
        'salaryFrom',
        'salaryTo',
        'currency',
        'type',
      ]),
      with: {
        category: {
          columns: withQueryColumns(DBSchema.jobCategory, [
            'id',
            'name',
            'iconUrl',
          ]),
        },
        organisation: {
          columns: withQueryColumns(DBSchema.organisation, [
            'name',
            'imageUrl',
            'id',
          ]),
        },
      },
      limit: options.limit,
      offset: options.offset,
      orderBy: desc(DBSchema.jobListing.createdAt),
    });
    const [result] = await this.db
      .select({ totalItems: count() })
      .from(DBSchema.jobListing)
      .where(and(...conditions));
    return { items, totalItems: result.totalItems };
  }
  // Job Misc.
  async findAllCategories() {
    return await this.db.query.jobCategory.findMany({
      columns: withQueryColumns(DBSchema.jobCategory, [
        'id',
        'iconUrl',
        'name',
      ]),
      orderBy: DBSchema.jobCategory.name,
    });
  }
  async findAllJobSkills() {
    return await this.db.query.jobSkill.findMany({
      columns: withQueryColumns(DBSchema.jobSkill, ['id', 'name']),
      orderBy: DBSchema.jobSkill.name,
    });
  }
  findAllJobTypes() {
    return pgEnumToObject(listingTypeEnum);
  }
  findAllJobExperienceLevels() {
    return pgEnumToObject(experienceLevelEnum);
  }
  findAllJobStatus() {
    return pgEnumToObject(listingStatusEnum);
  }
}
