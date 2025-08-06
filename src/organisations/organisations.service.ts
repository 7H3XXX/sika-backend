import { Injectable } from '@nestjs/common';
import {
  and,
  count,
  desc,
  eq,
  ilike,
  InferInsertModel,
  InferSelectModel,
  SQL,
} from 'drizzle-orm';
import { DBSchema } from 'src/database/schemas';
import {
  Database,
  InjectDatabase,
  PageOptions,
  TableColumns,
  withColumns,
  withQueryColumns,
} from 'src/database/utils';
import { OrganisationFilterDto } from './dto/organisations.dto';
import { QuerySearch } from 'src/common/dto/search.dto';
import { MinioService } from 'libs/minio/minio.service';

@Injectable()
export class OrganisationsService {
  public readonly dataFields: TableColumns<typeof DBSchema.organisation> = [
    'id',
    'createdAt',
    'about',
    'website',
    'name',
    'imageUrl',
    'country',
  ];
  constructor(
    @InjectDatabase private readonly db: Database,
    private readonly minionService: MinioService,
  ) {}

  async findAllOrganisations(
    options: OrganisationFilterDto & PageOptions & QuerySearch,
  ) {
    const conditions: SQL<unknown>[] = [];
    // query filters
    if (options.ownerId) {
      conditions.push(eq(DBSchema.organisation.ownerId, options.ownerId));
    }
    if (options.search) {
      conditions.push(ilike(DBSchema.organisation.name, `%${options.search}%`));
    }
    if (options.country) {
      conditions.push(eq(DBSchema.organisation.country, options.country));
    }
    const items = await this.db.query.organisation.findMany({
      where: and(...conditions),
      columns: withQueryColumns(DBSchema.organisation, [
        'name',
        'country',
        'id',
        'imageUrl',
        'website',
      ]),
      limit: options.limit,
      offset: options.offset,
      orderBy: desc(DBSchema.organisation.createdAt),
    });
    const [result] = await this.db
      .select({ totalItems: count() })
      .from(DBSchema.organisation)
      .where(and(...conditions));
    return { items, totalItems: result.totalItems };
  }
  async findOrganisationById(id: string, options?: OrganisationFilterDto) {
    const conditions = [eq(DBSchema.organisation.id, id)];
    if (options?.ownerId) {
      conditions.push(eq(DBSchema.organisation.ownerId, options.ownerId));
    }
    return await this.db.query.organisation.findFirst({
      where: and(...conditions),
      columns: withQueryColumns(DBSchema.organisation, this.dataFields),
    });
  }
  async create({
    image,
    ...data
  }: InferInsertModel<typeof DBSchema.organisation> & { image?: string }) {
    if (image) {
      const uploadResponse = await this.minionService.putDataUri(
        image,
        data.name,
      );
      data.imageUrl = uploadResponse.baseUrl;
    }
    const [organisation] = await this.db
      .insert(DBSchema.organisation)
      .values(data)
      .returning(withColumns(DBSchema.organisation, this.dataFields));
    return organisation;
  }
  async update(
    id: string,
    {
      image,
      ...data
    }: Partial<InferSelectModel<typeof DBSchema.organisation>> & {
      image?: string;
    },
  ) {
    if (image) {
      const uploadResponse = await this.minionService.putDataUri(
        image,
        data.name,
      );
      data.imageUrl = uploadResponse.baseUrl;
    }
    const [organisation] = await this.db
      .update(DBSchema.organisation)
      .set(data)
      .where(eq(DBSchema.organisation.id, id))
      .returning(withColumns(DBSchema.organisation, this.dataFields));
    return organisation;
  }
  async delete(id: string) {
    await this.db
      .delete(DBSchema.organisation)
      .where(eq(DBSchema.organisation.id, id));
  }
}
