import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
  ) { }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const [data, grpcContext] = this.getDataAndContext(context);
    const ctxMap = grpcContext.getMap();
    // console.log(ctxMap.authorization);
    // console.log('handler', context.getHandler());
    if (ctxMap && ctxMap.authorizations) {
      try {
        const decode = this.jwtService.verify(ctxMap.authorizations);
        Logger.log(decode);
      } catch (error) {
        Logger.log(error);
        return false;
      }
      return true;
    } else {
      return false;
    }
    // console.log(ctxMap)
    // console.log("data", data);
    // console.log("context.getHandler", context.getHandler());
    // console.log("reflector", this.reflector)
    // return true;

  }
  getDataAndContext(context: ExecutionContext) {
    return [context.switchToRpc().getData(), context.switchToRpc().getContext()];
  }
}
