import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

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
    if (!roles) {
      return true;
    }

    

    // const httpContext: HttpArgumentsHost =nes context.switchToHttp();
    console.log(context.getHandler().name);
    //const data = httpContext
    return true;
    // const [data, grpcContext] = this.getDataAndContext(context);
    // const ctxMap = grpcContext.getMap();
    // console.log(context.switchToHttp());
    // //console.log('handler', context.switchToRpc().getContext());
    // if (ctxMap && ctxMap.authorizations) {
    //   try {
    //     const decode = this.jwtService.verify(ctxMap.authorizations);
    //     Logger.log(decode);
    //   } catch (error) {
    //     Logger.log(error);
    //     return false;
    //   }
    //   return true;
    // } else {
    //   return false;
    // }
    // // console.log(ctxMap)
    // // console.log("data", data);
    // // console.log("context.getHandler", context.getHandler());
    // // console.log("reflector", this.reflector)
    // // return true;

  }
  getDataAndContext(context: ExecutionContext) {
    return [context.switchToRpc().getData(), context.switchToRpc().getContext()];
  }
}
