import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Manager } from '../entities/manager.entity';
import { ManagerRepository } from '../entities/manager.repository';
import { ManagerFacebookRegisterInput, ManagerGoogleRegisterInput, ManagerRegisterInput, ManagerRepositoryResult } from './manager.interface';

@Injectable()
export class ManagerService {
    constructor(
        @InjectRepository(Manager)
        private readonly managerRepository: ManagerRepository,

    ) { }
    async createManager(payload: ManagerRegisterInput): Promise<Manager> {
        if (!(payload.email && payload.phoneNumber)) {
            throw new RpcException({ code: 406, message: 'MAKE_SURE_EMAIL_AND_PHONE_NUMBER_BOTH_EXIST', result: null });
        }
        if (!(payload.password)) {
            throw new RpcException({ code: 406, message: 'MAKE_SURE_PASSWORD_EXIST', result: null });
        }
        if (payload.email && await this.managerRepository.findOne({ where: { email: payload.email } })) {
            throw new RpcException({ code: 409, message: 'EMAIL_ALREADY_EXISTS', result: null });
        }
        // if (payload.phoneNumber && await this.managerRepository.findOne({ where: { phoneNumber: payload.phoneNumber } })) {
        //     throw new RpcException({ code: 409, message: 'PHONE_NUMBER_ALREADY_EXISTS', result: null });
        // }
        return await this.managerRepository.save(this.managerRepository.create(payload));
    }

    async createManagerWithGoogleAccount(payload: ManagerGoogleRegisterInput): Promise<Manager> {
        if (!(payload.email && payload.phoneNumber)) {
            throw new RpcException({ code: 406, message: 'MAKE_SURE_EMAIL_AND_PHONE_NUMBER_BOTH_EXIST', result: null });
        }
        if (!(payload.password)) {
            throw new RpcException({ code: 406, message: 'MAKE_SURE_PASSWORD_EXIST', result: null });
        }
        if (payload.email && await this.managerRepository.findOne({ where: { email: payload.email } })) {
            throw new RpcException({ code: 409, message: 'EMAIL_ALREADY_EXISTS', result: null });
        }
        // if (payload.phoneNumber && await this.managerRepository.findOne({ where: { phoneNumber: payload.phoneNumber } })) {
        //     throw new RpcException({ code: 409, message: 'PHONE_NUMBER_ALREADY_EXISTS', result: null });
        // }
        payload.isGoogleAccount = true;
        return await this.managerRepository.save(this.managerRepository.create(payload));
    }

    async createManagerWithFacebookAccount(payload: ManagerFacebookRegisterInput): Promise<Manager> {
        if (!(payload.email && payload.phoneNumber)) {
            throw new RpcException({ code: 406, message: 'MAKE_SURE_EMAIL_AND_PHONE_NUMBER_BOTH_EXIST', result: null });
        }
        if (!(payload.password)) {
            throw new RpcException({ code: 406, message: 'MAKE_SURE_PASSWORD_EXIST', result: null });
        }
        if (payload.email && await this.managerRepository.findOne({ where: { email: payload.email } })) {
            throw new RpcException({ code: 409, message: 'EMAIL_ALREADY_EXISTS', result: null });
        }
        // if (payload.phoneNumber && await this.managerRepository.findOne({ where: { phoneNumber: payload.phoneNumber } })) {
        //     throw new RpcException({ code: 409, message: 'PHONE_NUMBER_ALREADY_EXISTS', result: null });
        // }
        payload.isFacebookAccount = true;
        return await this.managerRepository.save(this.managerRepository.create(payload));
    }
    async findManagerByEmailOrPhone(email: string): Promise<ManagerRepositoryResult> {
        const manager = await this.managerRepository.findOne({
            where: [
                { email },
                { phoneNumber: email },
            ],
        });
        if (manager) {
            return { code: 200, message: 'MANAGER_FOUND', result: manager };
        } else {
            return { code: 200, message: 'MANAGER_NOT_FOUND', result: manager };
        }
    }

    async findManagerByGoogleAccount(email: string): Promise<any> {
        const manager = await this.managerRepository.findOne({
            where: [
                { email },
                { isGoogleAccount: true },
            ],
        });
        return manager;
    }

    async findManagerByFacebookAccount(email: string): Promise<any> {
        const manager = await this.managerRepository.findOne({
            where:
                {
                    email,
                    isFacebookAccount: true,
                },
        });
        return manager;
    }
    async find(conditions: any): Promise<any> {
        const manager = await this.managerRepository.find({ where: conditions });
        return manager;
    }

    async findOne(conditions: any): Promise<any> {
        const manager = await this.managerRepository.findOne({ where: conditions });
        return manager;
    }

    async save(manager: Manager): Promise<any> {
        return this.managerRepository.save(manager);
    }
}
