import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { Inject, Injectable } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import {
  Logger,
  MailAddress,
  MailModuleOptions,
  MailOptions,
  MessageInfo,
} from './mail.interface';
import { MAILER_OPTIONS_TOKEN } from './mail.constansts';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly defaultFrom: MailAddress;
  private readonly logger: Logger;

  constructor(
    @Inject(MAILER_OPTIONS_TOKEN)
    private readonly options: MailModuleOptions,
  ) {
    this.transporter = nodemailer.createTransport(this.options.transport);
    const handlebarOptions = {
      viewEngine: {
        defaultLayout: undefined,
      },
      viewPath: path.resolve('./templates/'),
      extName: '.hbs',
    };
    this.transporter.use('compile', hbs(handlebarOptions));
    this.defaultFrom =
      this.options.defaultFrom || this.options.transport.auth.user;
    this.logger = this.options.options?.logger ?? console;
  }

  public sendMail(options: MailOptions) {
    const mailOptions = {
      ...options,
      from: options.from || this.defaultFrom,
    };

    const transporter = options.transport
      ? nodemailer.createTransport(options.transport)
      : this.transporter;

    return transporter.sendMail(mailOptions, (err, info: MessageInfo) => {
      if (err) {
        this.logger.error(`Error sending email: ${err}`);
        return;
      }
      this.logger.log(`Message sent: ${info.messageId}`);
      return info;
    }) as unknown as MessageInfo;
  }
}
