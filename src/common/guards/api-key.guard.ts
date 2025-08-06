import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKey implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ header: (name: string) => string | undefined }>();
    const apiKey = request.header('Authorization');
    if (apiKey == 'Bearer nest-js') {
      return true;
    }
    return false;
  }
}
