import { Controller, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CustomerLoginInput, CustomerLoginResponse, CustomerGoogleLoginInput } from './auth.interface';

@Controller()
export class AuthController {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService,
    ) { }
    @GrpcMethod('AuthService', 'customerLogin')
    async customerLogin(payload: CustomerLoginInput): Promise<CustomerLoginResponse> {
        return this.authService.customerLogin(payload.customerName, payload.password);
    }

    @GrpcMethod('AuthService', 'customerGoogleLogin')
    async customerGoogleLogin(payload: CustomerGoogleLoginInput): Promise<CustomerLoginResponse> {
        return this.authService.customerGoogleLogin(payload.email, payload.accessToken);
    }
}
