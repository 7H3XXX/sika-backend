import { eq } from 'drizzle-orm';
import db from '../utils/db';
import { DBSchema } from '../schemas';
import * as organisations from './data/organisations.json';

export default async function seed(db: db) {
  await Promise.all(
    organisations.map(async (organisation) => {
      const { createdByEmail, ...data } = organisation;
      const [foundUser] = await db
        .select()
        .from(DBSchema.user)
        .where(eq(DBSchema.user.email, createdByEmail));
      if (foundUser) {
        await db.insert(DBSchema.organisation).values({
          ownerId: foundUser.id,
          ...data,
        });
      }
    }),
  );
}
