import { Injectable, Logger } from '@nestjs/common';
import { CustomerService } from '../customer/customer.service';
import { UserService } from '../user/user.service';
import { EmployeeService } from '../employee/employee.service';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import * as request from 'request';
import { InjectBoot, Boot } from '@nestcloud/boot';
import { GoogleTokenInfo } from 'src/common/interfaces/google.interface';


@Injectable()
export class AuthService {
    constructor(
        private readonly customerService: CustomerService,
        private readonly userService: UserService,
        private readonly employeeService: EmployeeService,
        private readonly jwtService: JwtService,
        @InjectBoot() private readonly boot: Boot,
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
        result.roles = new Array();
        result.roles.push('any');
        return result;
    }

    async checkGoogleToken(accessToken: string): Promise<GoogleTokenInfo> {
        return new Promise((resolve, reject) => {
            let options: any = {
                url: `${this.boot.get('google.checkTokenUrl', 'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=')}${accessToken}`,
                headers: {
                    'User-Agent': 'bookeoke-auth-service',
                    'Content-Type': 'application/json',
                },
            };
            request.get(options, (error, res) => {
                if (error) {
                    reject(error);
                }
                resolve(JSON.parse(res.body));

            });
        });
    }

    async validateGoogleLogin(email: string, accessToken: string): Promise<any> {
        // validate google token
        const checkResult: GoogleTokenInfo = await this.checkGoogleToken(accessToken);
        if (checkResult.email !== email || checkResult.expires_in === 0) {
            return false;
        } else {
            return true;
        }

    }
    async customerLogin(userName: string, password: string): Promise<any> {
        const customer = await this.validateCustomer(userName, password);
        const tokenString = this.jwtService.sign(customer.toJSON());
        return {
            accessToken: tokenString,
        };
    }

    async customerGoogleLogin(email: string, accessToken: string): Promise<any> {
        const isValid = await this.validateGoogleLogin(email, accessToken);
        if (isValid) {
            try {
                const customer = await this.customerService.findCustomerByGoogleAccount(email);
                if (customer) {
                    return customer;
                } else {
                    const newCustomer = await this.customerService.createCustomerWithGoogleAccount({
                        email,
                        password: this.boot.get('google.defaultPassword', '123456'),
                        phoneNumber: this.boot.get('google.defaultPhoneNumber', '0902345678'),
                        companyName: this.boot.get('google.defaultCompanyName', 'unknown'),
                        isGoogleAccount: true,
                    });
                    return newCustomer;
                }
            }
            catch (error) {
                console.log(error)
            }

        }
        return {
            code: 200,
            message: 'LOGIN_SUCCESS',
            result: {
                accessToken: 'tokenString',
            },
        };
    }
}
