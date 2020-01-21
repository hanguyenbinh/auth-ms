import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { CustomerRegisterInput, CustomerRepositoryResult } from './customer.interface';
import { CustomerRepository } from '../entities/customer.repository';

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: CustomerRepository,
    ) { }
    async createCustomer(payload: CustomerRegisterInput): Promise<CustomerRepositoryResult> {
        if (!(payload.email && payload.phoneNumber)) {
            return { code: 406, message: 'MAKE_SURE_EMAIL_AND_PHONE_NUMBER_BOTH_EXIST', result: null };
        }
        if (!(payload.password)) {
            return ({ code: 406, message: 'MAKE_SURE_PASSWORD_EXIST', result: null });
        }
        if (payload.email && await this.customerRepository.findOne({ where: { email: payload.email } })) {
            return { code: 409, message: 'EMAIL_ALREADY_EXISTS', result: null };
        }
        if (payload.phoneNumber && await this.customerRepository.findOne({ where: { phoneNumber: payload.phoneNumber } })) {
            return { code: 409, message: 'PHONE_NUMBER_ALREADY_EXISTS', result: null };
        }
        try {
            const result = await this.customerRepository.save(this.customerRepository.create(payload));
            return { code: 200, message: 'CREATE_CUSTOMER_SUCCESSFUL', result };
        } catch (error) {
            let message: string = '';
            if (Array.isArray(error)) {
                if (error[0].property === 'phoneNumber') {
                    message = 'INCORRECT_PHONE_NUMBER';
                } else if (error[0].property === 'email') {
                    message = 'INCORRECT_EMAIL_ADDRESS';
                } else {
                    message = 'INCORRECT_UNKNOWN_PROPERTY';
                }
            } else {
                message = error;
            }
            return ({ code: 406, message, result: null });
        }

    }
    async findCustomerByEmailOrPhone(customerName: string): Promise<CustomerRepositoryResult> {
        const customer = await this.customerRepository.findOne({
            where: [
                { email: customerName },
                { phoneNumber: customerName },
            ],
        });
        return { code: 200, message: 'CREATE_CUSTOMER_SUCCESSFUL', result: customer };
    }
}
