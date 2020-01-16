import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../entities/permission.entity';
import { PermissionRepository } from '../entities/permission.repository';
import { CreatePermissionInput } from './permission.interface';
import { ApiResponse } from '../common/interfaces/response.interface';

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission)
        private readonly customerRepository: PermissionRepository,
    ) {

    }
    async createPermission(payload: CreatePermissionInput): Promise<ApiResponse> {
        return {
            code: 0,
            message: 'TESTTING',
            result: null,
            error: null,
        };
    }
}
