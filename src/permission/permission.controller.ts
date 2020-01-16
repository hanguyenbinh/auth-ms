import { Controller, Inject } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionInput } from './permission.interface';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { GrpcMethod } from '@nestjs/microservices';

@Controller('permission')
export class PermissionController {
    constructor(
        @Inject(PermissionService) private readonly permissionService: PermissionService,
    ) { }
    @GrpcMethod('AuthService', 'createPermission')
    async createPermission(payload: CreatePermissionInput): Promise<ApiResponse> {
        return {
            code: 0,
            message: 'TESTTING',
            result: null,
            error: null,
        };
    }
}
