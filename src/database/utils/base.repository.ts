/**
 * ! This BaseReposiotry didn't turn out as expected -- reasons below:
 *
 * The idea of this utility class is to create a generic CRUD methods
 * that can extend Data Repositories, however, everything works fine up
 * to the point of SelectedColumns type inference with TypeScript -- in
 * simple english, the return type for the methods in this Utility class,
 * includes all the table/schema columns, irrespective of the defined
 * column keys (i.e. `returning` options) passed down to drizzle query.
 *
 * However that's not an invitation NOT to try it out, feel free.
 */

import {
  count,
  desc,
  eq,
  InferInsertModel,
  InferSelectModel,
  SQL,
} from 'drizzle-orm';
import {
  PgColumn,
  PgTable,
  PgTableWithColumns,
  PgTransaction,
} from 'drizzle-orm/pg-core';
import { ColumnKeys, Database, InjectDatabase, withColumns } from '.';
import { env } from 'env.config';

//? ------------ Interfaces and types
interface RepositoryOptions<T extends PgTable<any>> {
  tx: PgTransaction<any, any, any>;
  data: InferInsertModel<T>;
  returning: ColumnKeys<T>[];
  where: SQL<unknown>;
  orderBy: (PgColumn | SQL<unknown>)[];
  currentPage?: number;
  perPage?: number;
}
interface CreateOptions<T extends PgTable<any>> {
  data: RepositoryOptions<T>['data'];
  returning?: RepositoryOptions<T>['returning'];
  tx?: RepositoryOptions<T>['tx'];
}
interface QueryOptions<T extends PgTable<any>> {
  where?: RepositoryOptions<T>['where'];
  returning?: RepositoryOptions<T>['returning'];
  orderBy?: RepositoryOptions<T>['orderBy'];
  currentPage?: RepositoryOptions<T>['currentPage'];
  perPage?: RepositoryOptions<T>['perPage'];
  tx?: RepositoryOptions<T>['tx'];
}
interface UpdateOptions<T extends PgTable<any>> {
  id: string;
  data: Partial<CreateOptions<T>['data']>;
  tx?: RepositoryOptions<T>['tx'];
}
export interface PaginatedData<T extends PgTable<any>> {
  items: InferSelectModel<T>[];
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}
//? ---------------------------------------

export class BaseRepository<
  T extends PgTableWithColumns<any> & {
    id: PgColumn;
    createdAt: PgColumn;
    updatedAt: PgColumn;
  } & PgTable,
  SelectType = InferSelectModel<T>,
> {
  constructor(
    @InjectDatabase protected readonly db: Database,
    protected readonly table: T,
  ) {}

  async create(options: CreateOptions<T>): Promise<SelectType> {
    const db = options?.tx ?? this.db;
    const query = db.insert(this.table).values(options.data);
    if (options?.returning) {
      const args = withColumns(this.table, options.returning);
      query.returning(args as unknown as Record<string, SQL<unknown>>);
    } else {
      query.returning();
    }
    const [result] = (await query) as SelectType[];
    return result;
  }

  async findAll(options?: QueryOptions<T>): Promise<SelectType[]> {
    const db = options?.tx ?? this.db;
    const args = options?.returning
      ? withColumns(this.table, options.returning)
      : undefined;
    const query = args
      ? db.select(args as unknown as Record<string, SQL<unknown>>)
      : db.select();
    const perPage = options?.perPage ?? env.DEFAULT_PAGE_SIZE;
    const currentPage = options?.currentPage ?? 1;
    const offset = perPage * (currentPage - 1);
    return (await query
      .from(this.table as PgTable)
      .where(options?.where)
      .limit(perPage)
      .offset(offset)
      .orderBy(
        ...(options?.orderBy ?? [desc(this.table.createdAt)]),
      )) as SelectType[];
  }

  async findAllPaginated(options?: QueryOptions<T>): Promise<PaginatedData<T>> {
    const db = options?.tx ?? this.db;
    const args = options?.returning
      ? withColumns(this.table, options.returning)
      : undefined;
    const query = args
      ? db.select(args as unknown as Record<string, SQL<unknown>>)
      : db.select();

    const perPage = options?.perPage ?? env.DEFAULT_PAGE_SIZE;
    const currentPage = options?.currentPage ?? 1;
    const offset = perPage * (currentPage - 1);
    const results = (await query
      .from(this.table as PgTable)
      .where(options?.where)
      .limit(perPage)
      .offset(offset)
      .orderBy(
        ...(options?.orderBy ?? [desc(this.table.createdAt)]),
      )) as SelectType[];
    const [counts] = await db
      .select({ totalItems: count() })
      .from(this.table as PgTable)
      .where(options?.where);
    return {
      items: results,
      currentPage,
      perPage,
      totalItems: counts.totalItems,
      totalPages: Math.ceil(counts.totalItems / perPage),
    };
  }

  async findById(
    id: string,
    options?: Pick<QueryOptions<T>, 'tx'>,
  ): Promise<SelectType | null> {
    const db = options?.tx ?? this.db;
    const [result] = (await db
      .select()
      .from(this.table as PgTable)
      .where(eq(this.table.id, id))
      .limit(1)) as SelectType[];
    return result ?? null;
  }

  async update(options: UpdateOptions<T>): Promise<SelectType> {
    const db = options?.tx ?? this.db;
    const [result] = await db
      .update(this.table)
      .set(options.data)
      .where(eq(this.table.id, options.id))
      .returning();
    return result as SelectType;
  }

  async delete(id: string, options?: Pick<QueryOptions<T>, 'tx'>) {
    const db = options?.tx ?? this.db;
    await db.delete(this.table).where(eq(this.table.id, id));
    return null;
  }
}
