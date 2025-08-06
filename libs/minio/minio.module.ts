import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Module,
} from '@nestjs/common';
import { MinioModuleOptions } from './minio.interface';
import { MinioService } from './minio.service';
import { MINIO_OPTIONS_TOKEN } from './minio.constants';

const { ConfigurableModuleClass } =
  new ConfigurableModuleBuilder<MinioModuleOptions>()
    .setExtras(
      {
        isGlobal: true,
      },
      (definition, extras) => ({
        ...definition,
        global: extras.isGlobal,
      }),
    )
    .build();

@Module({
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule extends ConfigurableModuleClass {
  static forRoot(options: MinioModuleOptions): DynamicModule {
    return {
      module: MinioModule,
      providers: [
        {
          provide: MINIO_OPTIONS_TOKEN,
          useValue: options,
        },
        MinioService,
      ],
      exports: [MinioService],
      global: true,
    };
  }
}
