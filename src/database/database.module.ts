import { Module, OnModuleInit } from '@nestjs/common';
import { DATABASE_CONNECTION_TOKEN } from './utils/database-connection';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from 'env.config';
import { DBSchema } from './schemas';
import { SeedingService } from './seed.service';

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION_TOKEN,
      useFactory: () => {
        return drizzle({
          connection: {
            host: env.DATABASE_HOST,
            user: env.DATABASE_USER,
            database: env.DATABASE_NAME,
            password: env.DATABASE_PWD,
            port: env.DATABASE_PORT,
            ssl: env.DATABASE_SSL,
          },
          schema: DBSchema,
          casing: 'snake_case',
        });
      },
    },
    SeedingService,
  ],
  exports: [DATABASE_CONNECTION_TOKEN],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly seedingService: SeedingService) {}
  async onModuleInit() {
    if (env.DATABASE_SEEDING) {
      await this.seedingService.startSeeding();
    }
  }
}
