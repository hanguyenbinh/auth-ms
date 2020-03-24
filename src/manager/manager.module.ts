import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';


import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '../jwt/jwtConfig.class';
import { ManagerRepository } from '../entities/manager.repository';
import { ManagerService } from './manager.service';
import { ManagerController } from './manager.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ManagerRepository]),
    JwtModule.registerAsync({
      useClass: JwtConfig,
    })
  ],
  providers: [ManagerService],
  exports: [ManagerService],
  controllers: [ManagerController],
})
export class ManagerModule { } 
