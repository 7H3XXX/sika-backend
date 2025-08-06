import { eq } from 'drizzle-orm';
import db from '../utils/db';
import { DBSchema } from '../schemas';
import * as jobListings from './data/job-listings.json';
import {
  jobListingExperienceLevel,
  jobListingStatus,
  jobListingType,
} from 'src/jobs/entities/schema';

export default async function seed(db: db) {
  await Promise.all(
    jobListings.map(async (listing) => {
      const {
        oragnisationName,
        categoryName,
        skills,
        status,
        type,
        createdAt,
        updatedAt,
        experienceLevel,
        ...data
      } = listing;
      const [foundOrganisation] = await db
        .select()
        .from(DBSchema.organisation)
        .where(eq(DBSchema.organisation.name, oragnisationName));
      const [foundCategory] = await db
        .select()
        .from(DBSchema.jobCategory)
        .where(eq(DBSchema.jobCategory.name, categoryName));
      const [createdListing] = await db
        .insert(DBSchema.jobListing)
        .values({
          createdById: foundOrganisation.ownerId,
          categoryId: foundCategory.id,
          organisationId: foundOrganisation.id,
          createdAt: new Date(createdAt),
          updatedAt: new Date(updatedAt),
          status: status as jobListingStatus,
          type: type as jobListingType,
          experienceLevel: experienceLevel as jobListingExperienceLevel,
          ...data,
        })
        .returning();
      await Promise.all(
        skills.map(async (skill) => {
          let [foundSkill] = await db
            .select()
            .from(DBSchema.jobSkill)
            .where(eq(DBSchema.jobSkill.name, skill));
          if (!foundSkill) {
            [foundSkill] = await db
              .insert(DBSchema.jobSkill)
              .values({ name: skill })
              .returning();
          }
          await db
            .insert(DBSchema.jobListingToJobSkill)
            .values({ skillId: foundSkill.id, jobId: createdListing.id });
        }),
      );
    }),
  );
}
