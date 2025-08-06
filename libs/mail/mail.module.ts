import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Module,
} from '@nestjs/common';
import { MailModuleOptions } from './mail.interface';
import { MailService } from './mail.service';
import { MAILER_OPTIONS_TOKEN } from './mail.constansts';

const { ConfigurableModuleClass } =
  new ConfigurableModuleBuilder<MailModuleOptions>()
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
  providers: [MailService],
  exports: [MailService],
})
export class MailModule extends ConfigurableModuleClass {
  static forRoot(options: MailModuleOptions): DynamicModule {
    return {
      module: MailModule,
      providers: [
        {
          provide: MAILER_OPTIONS_TOKEN,
          useValue: options,
        },
        MailService,
      ],
      exports: [MailService],
      global: true,
    };
  }
}
