import db from '../utils/db';
import { DBSchema } from '../schemas';
import * as jobCategories from './data/job-categories.json';

export default async function seed(db: db) {
  await db.insert(DBSchema.jobCategory).values(jobCategories);
}
