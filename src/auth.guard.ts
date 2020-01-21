import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Metadata } from 'grpc';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) { }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    Logger.log(roles);
    if (!roles) {
      return true;
    }
    const contextArgs = context.getArgs();
    const metaData: Metadata = contextArgs[1] as Metadata;
    const accessToken = metaData.get('authorizations')[0] as string;
    if (!accessToken) {
      return false;
    }

    try {
      const user = this.jwtService.verify(accessToken);
      const hasRole = () => user.roles.some(role => !!roles.find(item => item === role));
      return user && user.roles && hasRole();
    } catch (error) {
      Logger.log(error);
      return false;
    }
  }
  getDataAndContext(context: ExecutionContext) {
    return [context.switchToRpc().getData(), context.switchToRpc().getContext()];
  }
}
