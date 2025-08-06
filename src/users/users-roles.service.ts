import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DBSchema } from 'src/database/schemas';
import {
  Database,
  InjectDatabase,
  TableColumns,
  withColumns,
} from 'src/database/utils';

@Injectable()
export class UserRolesService {
  public readonly dataFields: TableColumns<typeof DBSchema.role> = [
    'id',
    'role',
    'isActive',
    'userId',
    'createdAt',
    'updatedAt',
  ];
  constructor(@InjectDatabase private readonly db: Database) {}
  async getRolesByUserId(userId: string) {
    return this.db
      .select(withColumns(DBSchema.role, this.dataFields))
      .from(DBSchema.role)
      .where(eq(DBSchema.role.userId, userId));
  }
}
