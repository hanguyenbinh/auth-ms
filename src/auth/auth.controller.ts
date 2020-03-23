import { Controller, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ManagerLoginInput, ManagerLoginResponse, GoogleLoginInput, FacebookLoginInput, CheckTokenInput, CheckRecoveryPasswordHashInput } from './auth.interface';
import { ManagerChangePasswordInput, ManagerRecoveryPasswordConfirmInput, ManagerRecoveryPasswordInput } from '../manager/manager.interface';
import { Metadata } from 'grpc';

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

    @GrpcMethod('AuthService', 'managerChangePassword')
    async managerChangePassword(payload: ManagerChangePasswordInput, metaData: Metadata): Promise<any> {
        const metaObject: any = metaData.getMap();
        return await this.authService.managerChangePassword(payload, metaObject.accessToken);
    }

    @GrpcMethod('AuthService', 'managerRecoveryPassword')
    async managerRecoveryPassword(payload: ManagerRecoveryPasswordInput): Promise<any> {
        return await this.authService.managerRecoveryPassword(payload);
    }

    @GrpcMethod('AuthService', 'managerRecoveryPasswordConfirmation')
    async managerRecoveryPasswordConfirmation(payload: ManagerRecoveryPasswordConfirmInput): Promise<any> {
        return await this.authService.managerRecoveryPasswordConfirmation(payload);
    }

    @GrpcMethod('AuthService', 'checkRecoveryPasswordHash')
    async checkRecoveryPasswordHash(payload: CheckRecoveryPasswordHashInput): Promise<any> {
        return await this.authService.checkRecoveryPasswordHash(payload.token);
    }
}
