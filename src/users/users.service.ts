import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  Database,
  InjectDatabase,
  QueryOptions,
  TableColumns,
  withColumns,
  withQueryColumns,
} from 'src/database/utils';
import { DBSchema } from 'src/database/schemas';
import {
  count,
  desc,
  eq,
  InferInsertModel,
  InferSelectModel,
} from 'drizzle-orm';
import { CreateUserDto } from './dto/user.dto';
import { MinioService } from 'libs/minio/minio.service';
import { getGravatarUrl } from 'libs/gravatar/main';
import { ApiErrorCodes } from 'types/error.codes';

@Injectable()
export class UsersService {
  logger = new Logger(UsersService.name);
  public readonly dataFields: TableColumns<typeof DBSchema.user> = [
    'id',
    'createdAt',
    'updatedAt',
    'firstname',
    'lastname',
    'email',
    'imageUrl',
  ];
  public readonly defaultRoleSelect: TableColumns<typeof DBSchema.role> = [
    'id',
    'role',
    'isActive',
    'userId',
    'createdAt',
    'updatedAt',
  ];
  constructor(
    @InjectDatabase private readonly db: Database,
    private readonly minioService: MinioService,
  ) {}
  async create(
    {
      email,
      userType,
      imageUrl,
      ...data
    }: InferInsertModel<typeof DBSchema.user> & Pick<CreateUserDto, 'userType'>,
    options?: Pick<QueryOptions<typeof DBSchema.user>, 'select'>,
  ) {
    try {
      const [user] = await this.db
        .insert(DBSchema.user)
        .values({
          email: email.toLowerCase(),
          imageUrl: imageUrl || getGravatarUrl(email),
          ...data,
        })
        .returning(
          withColumns(DBSchema.user, options?.select || this.dataFields),
        );
      await this.db.insert(DBSchema.role).values([
        {
          userId: user.id,
          role: 'user',
        },
        {
          userId: user.id,
          role: userType,
        },
      ]);

      return user;
    } catch ({ cause }) {
      const { detail, constraint } = cause as {
        detail: string;
        constraint: string;
      };
      const catalogOfThingsThatCouldGoWrong = {
        user_email_unique: {
          message: detail,
          errorCode: ApiErrorCodes.EMAIL_ALREADY_REGISTERED,
        },
      };
      throw new BadRequestException(
        catalogOfThingsThatCouldGoWrong[constraint] || {
          message: 'User registration failed!',
          errorCode: ApiErrorCodes.USER_REGISTRATION_FAILED,
        },
      );
    }
  }
  async findById(id: string) {
    const user = await this.db.query.user.findFirst({
      where: eq(DBSchema.user.id, id),
      columns: withQueryColumns(DBSchema.user, this.dataFields),
    });
    return user;
  }
  async findAll(
    options: Pick<
      QueryOptions<typeof DBSchema.user>,
      'select' | 'where' | 'orderBy'
    >,
  ) {
    return await this.db
      .select(withColumns(DBSchema.user, options.select || this.dataFields))
      .from(DBSchema.user)
      .where(options.where)
      .orderBy(options.orderBy || desc(DBSchema.user.createdAt));
  }
  async findAllPaginated({
    select = ['id', 'createdAt', 'firstname', 'lastname', 'email', 'imageUrl'],
    ...options
  }: QueryOptions<typeof DBSchema.user>) {
    const items = await this.db
      .select(withColumns(DBSchema.user, select))
      .from(DBSchema.user)
      .where(options.where)
      .limit(options.limit)
      .offset(options.offset)
      .orderBy(options.orderBy || desc(DBSchema.user.createdAt));

    const [result] = await this.db
      .select({ totalItems: count() })
      .from(DBSchema.user)
      .where(options.where);
    return { items, totalItems: result.totalItems };
  }
  async update(
    id: string,
    data: Partial<InferSelectModel<typeof DBSchema.user>>,
  ) {
    const [user] = await this.db
      .update(DBSchema.user)
      .set(data)
      .where(eq(DBSchema.user.id, id))
      .returning(withColumns(DBSchema.user, this.dataFields));
    return user;
  }
  async delete(id: string) {
    await this.db.delete(DBSchema.user).where(eq(DBSchema.user.id, id));
    return null;
  }
  async updateProfileImageByUserId(userId: string, dataUri: string) {
    const user = await this.findById(userId);
    if (!user)
      throw new ForbiddenException({
        message: `User with the matching id not found: ${userId}`,
        errorCode: ApiErrorCodes.RESOURCE_NOT_FOUND,
      });
    const blob = await this.minioService.putDataUri(dataUri);
    return await this.update(userId, { imageUrl: blob.baseUrl });
  }
}
