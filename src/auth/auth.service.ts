import { Injectable, Logger } from '@nestjs/common';
import { ManagerService } from '../manager/manager.service';
import { UserService } from '../user/user.service';
import { EmployeeService } from '../employee/employee.service';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import * as request from 'request';
import { InjectBoot, Boot } from '@nestcloud/boot';
import { GoogleTokenInfo } from 'src/common/interfaces/google.interface';
import { Manager } from 'src/entities/manager.entity';
import { FacebookTokenInfo } from 'src/common/interfaces/facebook.interface';
import { FacebookLoginInput } from './auth.interface';


@Injectable()
export class AuthService {
    constructor(
        private readonly managerService: ManagerService,
        private readonly userService: UserService,
        private readonly employeeService: EmployeeService,
        private readonly jwtService: JwtService,
        @InjectBoot() private readonly boot: Boot,
    ) {
    }

    async validateManager(userName: string, password: string): Promise<any> {
        const { code, message, result } = await this.managerService.findManagerByEmailOrPhone(userName);
        if (code !== 200) {
            throw new RpcException({ code, message });
        }
        if (!result) {
            throw new RpcException({ code: 404, message: 'MANAGER_DOES_NOT_EXIST' });
        }
        if (result.isBanned || result.deletedAt) {
            throw new RpcException({ code: 400, message: 'MANAGER_IS_BANNED' });
        }

        if (!await bcrypt.compare(password, result.password)) {
            throw new RpcException({ code: 406, message: 'INVALID_PASSWORD' });
        }
        result.roles = new Array();
        result.roles.push('any');
        return result;
    }

    async checkGoogleToken(token: string): Promise<GoogleTokenInfo> {
        return new Promise((resolve, reject) => {
            let options: any = {
                url: `${this.boot.get('google.checkTokenUrl', 'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=')}${token}`,
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

    async checkFacebookToken(id: string, token: string): Promise<FacebookTokenInfo> {
        const url = this.boot.get('facebook.checkTokenUrl', 'https://graph.facebook.com/${id}/?access_token=${token}').replace('${id}', id).replace('${token}', token);
        console.log(url);
        return new Promise((resolve, reject) => {
            let options: any = {
                url: this.boot.get('facebook.checkTokenUrl', 'https://graph.facebook.com/${id}/?access_token=${token}').replace('${id}', id).replace('${token}', token),
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

    async validateGoogleLogin(email: string, token: string): Promise<any> {
        // validate google token
        console.log(token)
        const checkResult: GoogleTokenInfo = await this.checkGoogleToken(token);
        console.log(checkResult);
        if (checkResult.email !== email || checkResult.expires_in === 0) {
            return false;
        } else {
            return true;
        }

    }

    async validateFacebookLogin(id: string, token: string, name: string): Promise<any> {
        // validate facebook token        
        const checkResult: FacebookTokenInfo = await this.checkFacebookToken(id, token);
        if (checkResult.id !== id || checkResult.name !== name) {
            return false;
        } else {
            return true;
        }
    }
    async managerLogin(userName: string, password: string): Promise<any> {
        const manager = await this.validateManager(userName, password);
        const tokenString = this.jwtService.sign(manager.toJSON());
        return {
            accessToken: tokenString,
        };
    }

    async managerGoogleLogin(email: string, token: string): Promise<any> {
        const isValid = await this.validateGoogleLogin(email, token);
        if (!isValid) {
            throw new RpcException({ code: 406, message: 'INVALID_GOOGLE_TOKEN' });
        }
        let manager: Manager;
        manager = await this.managerService.findManagerByGoogleAccount(email);
        if (!manager) {
            manager = await this.managerService.createManagerWithGoogleAccount({
                email,
                password: this.boot.get('google.defaultPassword', '123456'),
                phoneNumber: this.boot.get('google.defaultPhoneNumber', '0902345678'),
                companyName: this.boot.get('google.defaultCompanyName', 'unknown'),
                isGoogleAccount: true,
            });
        }
        const tokenString = this.jwtService.sign(manager.toJSON());
        return {
            accessToken: tokenString,
        };
    }

    async managerFacebookLogin(payload: FacebookLoginInput): Promise<any> {
        const isValid = await this.validateFacebookLogin(payload.id, payload.token, payload.name);
        if (!isValid) {
            throw new RpcException({ code: 406, message: 'INVALID_FACEBOOK_TOKEN' });
        }
        let manager: Manager;
        manager = await this.managerService.findManagerByFacebookAccount(payload.email);
        if (!manager) {
            manager = await this.managerService.createManagerWithFacebookAccount({
                email: payload.email,
                password: this.boot.get('google.defaultPassword', '123456'),
                phoneNumber: this.boot.get('google.defaultPhoneNumber', '0902345678'),
                companyName: this.boot.get('google.defaultCompanyName', 'unknown'),
                isFacebookAccount: true,
            });
        }
        const tokenString = this.jwtService.sign(manager.toJSON());
        return {
            accessToken: tokenString,
        };
    }
}
