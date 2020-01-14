import { Controller, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CustomerLoginInput, CustomerLoginResponse } from './auth.interface';

@Controller()
export class AuthController {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService,
    ) { }
    @GrpcMethod('AuthService', 'customerLogin')
    async customerLogin(payload: CustomerLoginInput): Promise<CustomerLoginResponse> {
        return this.authService.customerLogin(payload.customerName, payload.password);
    }
}
