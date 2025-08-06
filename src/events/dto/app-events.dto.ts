export class EventsAppInternalErrorDto {
  readonly appName: string;
  readonly appStaging: string;
  readonly errorMessage: string;
  readonly method: string;
  readonly requestUrl: string;
  readonly errorStack?: string;
  readonly payloadData?: string;
  constructor(data: EventsAppInternalErrorDto) {
    Object.assign(this, data);
  }
}
