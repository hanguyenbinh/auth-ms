import { Controller, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ManagerLoginInput, ManagerLoginResponse, GoogleLoginInput, FacebookLoginInput, CheckTokenInput } from './auth.interface';


@Controller()
export class AuthController {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService,
    ) { }
    @GrpcMethod('AuthService', 'managerLogin')
    async managerLogin(payload: ManagerLoginInput): Promise<any> {
        return await this.authService.managerLogin(payload.email, payload.password);
    }

    @GrpcMethod('AuthService', 'managerGoogleLogin')
    async managerGoogleLogin(payload: GoogleLoginInput): Promise<any> {
        return await this.authService.managerGoogleLogin(payload.email, payload.token);
    }

    @GrpcMethod('AuthService', 'managerFacebookLogin')
    async managerFacebookLogin(payload: FacebookLoginInput): Promise<any> {
        return await this.authService.managerFacebookLogin(payload);
    }

    @GrpcMethod('AuthService', 'managerCheckToken')
    async managerCheckToken(payload: CheckTokenInput): Promise<any> {
        return await this.authService.managerCheckToken(payload);
    }
}
