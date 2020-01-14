import { Injectable, Logger } from '@nestjs/common';
import { CustomerService } from '../customer/customer.service';
import { UserService } from '../user/user.service';
import { EmployeeService } from '../employee/employee.service';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly customerService: CustomerService,
        private readonly userService: UserService,
        private readonly employeeService: EmployeeService,
        private readonly jwtService: JwtService,
    ) {
    }

    async validateCustomer(userName: string, password: string): Promise<any> {
        const { code, message, result } = await this.customerService.findCustomerByEmailOrPhone(userName);
        if (code !== 200) {
            throw new RpcException({ code, message });
        }
        if (!result) {
            throw new RpcException({ code: 404, message: 'CUSTOMER_DOES_NOT_EXIST' });
        }
        if (result.isBanned || result.deletedAt) {
            throw new RpcException({ code: 400, message: 'CUSTOMER_IS_BANNED' });
        }

        if (!await bcrypt.compare(password, result.password)) {
            throw new RpcException({ code: 406, message: 'INVALID_PASSWORD' });
        }
        return result;
    }
    async customerLogin(userName: string, password: string): Promise<any> {
        const customer = await this.validateCustomer(userName, password);
        const tokenString = this.jwtService.sign(customer.toJSON());
        Logger.log(tokenString);
        return {
            accessToken: tokenString,
        };
    }
}
