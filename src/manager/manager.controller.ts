import { Controller, Inject } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { GrpcMethod } from '@nestjs/microservices';
import { ManagerRegisterResponse, ManagerRegisterInput } from './manager.interface';

@Controller()
export class ManagerController {
    constructor(@Inject(ManagerService) private readonly managerService: ManagerService) { }

    @GrpcMethod('AuthService', 'managerRegister')
    async managerRegister(payload: ManagerRegisterInput, metadata: any): Promise<ManagerRegisterResponse> {
        return await this.managerService.createManager(payload);
    }
}
