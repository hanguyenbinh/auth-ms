import { Controller, Inject, UseGuards, UseInterceptors, CacheInterceptor } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { GrpcMethod } from '@nestjs/microservices';
import { ManagerRegisterResponse, ManagerRegisterInput } from './manager.interface';
import { AuthGuard } from '../auth.guard';
import { Roles } from '../common/decorators/role.decorator';

@Controller()
export class ManagerController {
    constructor(@Inject(ManagerService) private readonly managerService: ManagerService) { }

    // @UseInterceptors(CacheInterceptor)
    @GrpcMethod('AuthService', 'managerRegister')
    async managerRegister(payload: ManagerRegisterInput, metadata: any): Promise<ManagerRegisterResponse> {
        return await this.managerService.createManager(payload);
    }
}
