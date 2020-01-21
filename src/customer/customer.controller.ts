import { Controller, Inject, UseGuards, UseInterceptors, CacheInterceptor } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CustomerRegisterResponse, CustomerRegisterInput } from './customer.interface';
import { AuthGuard } from '../auth.guard';
import { Roles } from '../common/decorators/role.decorator';

@Controller()
export class CustomerController {
    constructor(@Inject(CustomerService) private readonly customerService: CustomerService) { }

    @UseInterceptors(CacheInterceptor)
    @GrpcMethod('AuthService', 'customerRegister')
    // @UseGuards(AuthGuard)
    // @Roles('any')
    async customerRegister(payload: CustomerRegisterInput, metadata: any): Promise<CustomerRegisterResponse> {
        const { code, message, result } = await this.customerService.createCustomer(payload);
        return { code, message, result, error: null };
    }
}
