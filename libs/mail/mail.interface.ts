import { SendMailOptions } from 'nodemailer';
import { Address, Attachment, Envelope } from 'nodemailer/lib/mailer';

export interface Transport {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export type MailAddress = string | Address;

export interface MailOptions extends SendMailOptions {
  from?: MailAddress;
  to: MailAddress | MailAddress[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  context?: object;
  attachments?:
    | Array<{ filename: string; path?: string; contentType?: string }>
    | Attachment[];
  transport?: Transport;
}

export interface MessageInfo {
  envelope: Envelope;
  messageId: string;
  accepted: string[] | Address[];
  rejected: string[] | Address[];
  pending: string[] | Address[];
  response: string;
}

export type LoggerLevel =
  | 'trace'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'log'
  | 'fatal';

export interface Logger {
  level?(level: LoggerLevel): void;
  log(...params: any[]): void;
  trace?(...params: any[]): void;
  debug(...params: any[]): void;
  info?(...params: any[]): void;
  warn(...params: any[]): void;
  error(...params: any[]): void;
  fatal?(...params: any[]): void;
}

export interface Options {
  logger: Logger;
}

export interface MailModuleOptions {
  transport: Transport;
  defaultFrom?: MailAddress;
  options?: Options;
}
