import { Controller, Inject } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CustomerRegisterResponse, CustomerRegisterInput } from './customer.interface';

@Controller()
export class CustomerController {
    constructor(@Inject(CustomerService) private readonly customerService: CustomerService) { }

    @GrpcMethod('AuthService', 'customerRegister')
    // @UseGuards(AuthGuard)
    // @Roles('any')
    async customerRegister(payload: CustomerRegisterInput, metadata: any): Promise<CustomerRegisterResponse> {
        try {
            const newCustomer = await this.customerService.createCustomer(payload);
            return { result: newCustomer };
        } catch (error) {
            return { error };
        }
    }
}
