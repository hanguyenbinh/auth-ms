import { Module, CacheModule } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';


import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '../jwt/jwtConfig.class';
import { Boot } from '@nestcloud/boot';
import * as redisStore from 'cache-manager-redis-store';
import { NEST_BOOT_PROVIDER } from '@nestcloud/common';
import { ManagerRepository } from '../entities/manager.repository';
import { ManagerService } from './manager.service';
import { ManagerController } from './manager.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ManagerRepository]),
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),
    CacheModule.registerAsync({
      useFactory: (config: Boot) => ({
        store: redisStore,
        host: config.get('redis.host', 'localhost'),
        port: config.get('redis.port', 6379),
        auth_pass: config.get('redis.auth_pass', ''),
        ttl: config.get('redis.ttl', 5),
      }),
      inject: [NEST_BOOT_PROVIDER],
    }),
  ],
  providers: [ManagerService],
  exports: [ManagerService],
  controllers: [ManagerController],
})
export class ManagerModule { } 
