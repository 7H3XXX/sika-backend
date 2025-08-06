import { relations } from 'drizzle-orm';
import * as pg from 'drizzle-orm/pg-core';
import { baseSchema } from 'src/database/utils';
import { user } from 'src/users/entities/schema';

export const organisation = pg.pgTable('organisation', {
  ...baseSchema,
  name: pg.text().notNull(),
  about: pg.text().notNull(),
  website: pg.text(),
  imageUrl: pg.text(),
  country: pg.text(),

  // relation columns
  ownerId: pg
    .uuid()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const organisationRelations = relations(organisation, ({ one }) => ({
  user: one(user),
}));
