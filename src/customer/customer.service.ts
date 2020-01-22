import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { CustomerRegisterInput, CustomerRepositoryResult, CustomerGoogleRegisterInput } from './customer.interface';
import { CustomerRepository } from '../entities/customer.repository';
import { RpcException } from '@nestjs/microservices';


@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: CustomerRepository,
    ) { }
    async createCustomer(payload: CustomerRegisterInput): Promise<Customer> {
        if (!(payload.email && payload.phoneNumber)) {
            throw new RpcException( { code: 406, message: 'MAKE_SURE_EMAIL_AND_PHONE_NUMBER_BOTH_EXIST', result: null });
        }
        if (!(payload.password)) {
            throw new RpcException({ code: 406, message: 'MAKE_SURE_PASSWORD_EXIST', result: null });
        }
        if (payload.email && await this.customerRepository.findOne({ where: { email: payload.email } })) {
            throw new RpcException( { code: 409, message: 'EMAIL_ALREADY_EXISTS', result: null });
        }
        if (payload.phoneNumber && await this.customerRepository.findOne({ where: { phoneNumber: payload.phoneNumber } })) {
            throw new RpcException( { code: 409, message: 'PHONE_NUMBER_ALREADY_EXISTS', result: null });
        }
        return await this.customerRepository.save(this.customerRepository.create(payload));
    }

    async createCustomerWithGoogleAccount(payload: CustomerGoogleRegisterInput): Promise<Customer> {
        if (!(payload.email && payload.phoneNumber)) {
            throw new RpcException( { code: 406, message: 'MAKE_SURE_EMAIL_AND_PHONE_NUMBER_BOTH_EXIST', result: null });
        }
        if (!(payload.password)) {
            throw new RpcException({ code: 406, message: 'MAKE_SURE_PASSWORD_EXIST', result: null });
        }
        if (payload.email && await this.customerRepository.findOne({ where: { email: payload.email } })) {
            throw new RpcException( { code: 409, message: 'EMAIL_ALREADY_EXISTS', result: null });
        }
        if (payload.phoneNumber && await this.customerRepository.findOne({ where: { phoneNumber: payload.phoneNumber } })) {
            throw new RpcException( { code: 409, message: 'PHONE_NUMBER_ALREADY_EXISTS', result: null });
        }
        payload.isGoogleAccount = true;
        return await this.customerRepository.save(this.customerRepository.create(payload));
    }
    async findCustomerByEmailOrPhone(customerName: string): Promise<CustomerRepositoryResult> {
        const customer = await this.customerRepository.findOne({
            where: [
                { email: customerName },
                { phoneNumber: customerName },
            ],
        });
        if (customer) {
            return { code: 200, message: 'CUSTOMER_FOUND', result: customer };
        } else {
            return { code: 200, message: 'CUSTOMER_NOT_FOUND', result: customer };
        }
    }

    async findCustomerByGoogleAccount(email: string): Promise<any> {
        const customer = await this.customerRepository.findOne({
            where: [
                { email },
                { isGoogleAccount: true },
            ],
        });
        return customer;
    }
}
