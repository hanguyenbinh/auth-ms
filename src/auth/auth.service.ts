import { Injectable, Logger } from '@nestjs/common';
import { ManagerService } from '../manager/manager.service';
import { UserService } from '../user/user.service';
import { EmployeeService } from '../employee/employee.service';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import * as request from 'request';
import { InjectBoot, Boot } from '@nestcloud/boot';
import { GoogleTokenInfo } from '../common/interfaces/google.interface';
import { Manager } from '../entities/manager.entity';
import { FacebookTokenInfo } from '../common/interfaces/facebook.interface';
import { FacebookLoginInput, CheckTokenInput } from './auth.interface';
import { ManagerChangePasswordInput, ManagerRecoveryPasswordConfirmInput, ManagerRecoveryPasswordInput } from '../manager/manager.interface';
import * as jwt from 'jsonwebtoken';
import { RpcClient, Service, GrpcClient } from '@nestcloud/grpc';

import { IsNull } from 'typeorm';

import { join } from 'path';
import { MailerService } from 'src/mailer_ms/mailer_ms.interface';

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
    // @RpcClient({
    //     service: 'MailerService',
    //     package: 'mailer_ms',
    //     protoPath: join(__dirname, './protobufs/mailer_ms.proto'),
    //   }) private readonly client: GrpcClient;
      @Service('MailerService', {
        service: 'MailerService',
        package: 'mailer_ms',
        protoPath: join(__dirname, '../protobufs/mailer_ms.proto'),
      }) private mailerService: MailerService;

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
            const options: any = {
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
            const options: any = {
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

    async managerCheckToken(payload: CheckTokenInput): Promise<any> {
        const user = this.jwtService.verify(payload.accessToken);
        if (user && user.id) {
            const result = await this.managerService.findOne(
                {
                    id: user.id,
                },
            );
            if (result) {
                return {
                    accessToken: payload.accessToken,
                };

            }
        }
        throw new RpcException({ code: 403, message: 'INVALID_APPLICATION_TOKEN' });
    }

    async managerChangePassword(payload: ManagerChangePasswordInput, accessToken: string): Promise<any> {
        if (!payload.newPassword) {
            throw new RpcException({ code: 406, message: 'MAKE_SURE_NEW_PASSWORD_EXIST', result: null });
        }
        if (!payload.currentPassword) {
            throw new RpcException({ code: 406, message: 'MAKE_SURE_CURRENT_PASSWORD_EXIST', result: null });
        }
        let user: any = null;
        try {
            user = this.jwtService.verify(accessToken);
        } catch (error) {
            throw new RpcException({ code: 406, message: 'CAN_NOT_VERIFY_ACCESS_TOKEN', result: null });
        }
        if (user && user.id) {
            const manager: Manager = await this.managerService.findOne({ id: user.id, deleteAt: IsNull() });
            if (manager) {
                if (!await bcrypt.compare(manager.password, payload.currentPassword)) {
                    throw new RpcException({ code: 406, message: 'INVALID_PASSWORD' });
                }
                manager.password = await bcrypt.hash(
                    payload.newPassword,
                    this.boot.get('bcrypt.salt', 12),
                );
                const result = this.managerService.save(manager);
                // send confirmation email here
                return {
                    code: 200,
                    message: 'PASSWORD_CHANGED',
                };
            }
        }
        throw new RpcException({ code: 406, message: 'INVALID_APPLICATION_TOKEN' });
    }

    async managerRecoveryPassword(payload: ManagerRecoveryPasswordInput) {
        if (!payload.email) {
            throw new RpcException({ code: 406, message: 'MAKE_SURE_EMAIL_EXIST', result: null });
        }
        const manager: Manager = await this.managerService.findOne({ email: payload.email, deleteAt: IsNull() });
        if (manager) {
            manager.changePasswordHash = jwt.sign(manager.toJSON(), this.boot.get('confirmation.serect', 'cinnolab'), {expiresIn: this.boot.get('confirmation.expiresIn', '24h')});
            // send confirmation email here
            await this.managerService.save(manager);
            const result = await this.mailerService.createSendMailJob({
                destination: manager.email,
                templateId: 'asfasfssadfsfsaf',
                values: ['fsfasfdfasfdf'],
            }).toPromise();
            console.log(result);
            return {
                code: 200,
                message: 'RECOVERY_LINK_SENT_BY_EMAIL',
            };
        }
        throw new RpcException({ code: 404, message: 'MANAGER_NOT_FOUND', result: null });
    }

    async checkRecoveryPasswordHash(payload: string) {
        const user: any = jwt.verify(payload, this.boot.get('confirmation.serect', 'cinnolab'));
        if (user && user.id) {
            const manager: Manager = await this.managerService.findOne(
                {
                    id: user.id,
                    changePasswordHash: payload,
                },
            );
            if (manager) {
                return {
                    code: 200,
                    message: 'RECOVERY_TOKEN_CORRECT',
                };
            }
        }
        throw new RpcException({ code: 406, message: 'INVALID_RECOVERY_TOKEN' });
    }

    async managerRecoveryPasswordConfirmation(payload: ManagerRecoveryPasswordConfirmInput) {
        if (!payload.newPassword) {
            throw new RpcException({ code: 406, message: 'MAKE_SURE_NEW_PASSWORD_EXIST', result: null });
        }
        const user: any = jwt.verify(payload.changePasswordHash, this.boot.get('confirmation.serect', 'cinnolab'));
        if (user && user.id) {
            const manager: Manager = await this.managerService.findOne(
                {
                    id: user.id,
                    changePasswordHash: payload.changePasswordHash,
                },
            );
            if (manager) {
                manager.password = await bcrypt.hash(
                    payload.newPassword,
                    this.boot.get('bcrypt.salt', 12),
                );
                manager.changePasswordHash = '';
                const result = await this.managerService.save(manager);
                return {
                    code: 200,
                    message: 'PASSWORD_CHANGED',
                };
            }
        }
        throw new RpcException({ code: 406, message: 'INVALID_CONFIRMATION_TOKEN' });
    }
}
