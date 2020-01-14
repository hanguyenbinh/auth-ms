import { Controller, Inject, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CustomerRegisterResponse, CustomerRegisterInput } from './customer.interface';
import { AuthGuard } from '../auth.guard';

@Controller()
export class CustomerController {
    constructor(@Inject(CustomerService) private readonly customerService: CustomerService) { }
    @UseGuards(AuthGuard)
    @GrpcMethod('AuthService', 'customerRegister')
    async customerRegister(payload: CustomerRegisterInput, metadata: any): Promise<CustomerRegisterResponse> {
        const {code, message, result } = await this.customerService.createCustomer(payload);
        return {code, message, result, error: null};
    }
}
