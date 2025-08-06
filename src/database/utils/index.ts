import { Inject } from '@nestjs/common';
import { SQL } from 'drizzle-orm';
import {
  bigserial,
  PgColumn,
  PgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { DATABASE_CONNECTION_TOKEN } from './database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DBSchema } from '../schemas';
// ------------- Drizzle PG Table/Schema Utils
export const baseSchema = {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
};

export const useSerial = {
  index: bigserial({ mode: 'number' }),
  serialNumber: text(),
};

// -------------- Drizzle PG Column Utils
export const InjectDatabase = Inject(DATABASE_CONNECTION_TOKEN);
export type Database = NodePgDatabase<typeof DBSchema>;

export type ColumnKeys<T extends PgTable> = {
  [K in keyof T]: T[K] extends PgColumn ? K : never;
}[keyof T];

export type SelectedColumnsObject<
  T extends PgTable,
  C extends ColumnKeys<T>[],
> = {
  [K in C[number]]: T[K] extends PgColumn ? T[K] : never;
};

export type SelectedQueryColumnsObject<
  T extends PgTable,
  C extends ColumnKeys<T>[],
> = {
  [K in C[number]]: true;
};

export function withColumns<T extends PgTable, C extends ColumnKeys<T>[]>(
  table: T,
  columns: C,
): SelectedColumnsObject<T, C> {
  const result: Partial<Record<ColumnKeys<T>, PgColumn<any>>> = {};
  for (const column of columns) {
    if (Object.prototype.hasOwnProperty.call(table, column)) {
      result[column] = table[column] as PgColumn<any>;
    }
  }
  return result as SelectedColumnsObject<T, C>;
}

export function withQueryColumns<T extends PgTable, C extends ColumnKeys<T>[]>(
  table: T,
  columns: C,
): SelectedQueryColumnsObject<T, C> {
  const result: Partial<Record<ColumnKeys<T>, true>> = {};
  for (const column of columns) {
    if (Object.prototype.hasOwnProperty.call(table, column)) {
      result[column] = true;
    }
  }
  return result as SelectedQueryColumnsObject<T, C>;
}

// ------------------ Drizzle Query Utils

export interface PageOptions {
  offset: number;
  limit: number;
}

export type TableColumns<T extends PgTable> = ColumnKeys<T>[];

export interface QueryOptions<T extends PgTable> extends PageOptions {
  where?: SQL<unknown> | undefined;
  orderBy?: PgColumn | SQL<unknown>;
  select?: TableColumns<T>;
}

// ------------------- Enums

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replaceAll('-', ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function pgEnumToObject(enums: { enumValues: string[] }) {
  return enums.enumValues.map((val) => ({
    label: toTitleCase(val),
    value: val,
  }));
}
