import db from '../utils/db';
import { DBSchema } from '../schemas';
import * as users from './data/users.json';

export default async function seed(db: db) {
  await Promise.all(
    users.map(async (userData) => {
      const { roles, ...data } = userData;
      const [user] = await db.insert(DBSchema.user).values(data).returning();
      if (Array.isArray(roles)) {
        await db.insert(DBSchema.role).values(
          roles.map((role: 'admin' | 'user' | 'seeker' | 'employer') => ({
            userId: user.id,
            role: role,
          })),
        );
      }
    }),
  );
}
