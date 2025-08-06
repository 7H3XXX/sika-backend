import * as user from 'src/users/entities/schema';
import * as organisation from 'src/organisations/entities/schema';
import * as job from 'src/jobs/entities/schema';

export const DBSchema = {
  ...user,
  ...organisation,
  ...job,
};
