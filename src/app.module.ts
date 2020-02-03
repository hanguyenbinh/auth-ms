import { Module, CacheModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from '@nestcloud/logger';
import { BootModule, Boot } from '@nestcloud/boot';
import { ConsulModule } from '@nestcloud/consul';
import { ServiceModule } from '@nestcloud/service';
import { LoadbalanceModule } from '@nestcloud/loadbalance';
import {
  TypeOrmHealthIndicator,
  TerminusModule,
  TerminusModuleOptions,
} from '@nestjs/terminus';

import { TypeOrmModule } from '@nestjs/typeorm';
import * as Config from './config';
import * as redisStore from 'cache-manager-redis-store';

import { NEST_BOOT, NEST_CONSUL, NEST_BOOT_PROVIDER } from '@nestcloud/common';
import { UserModule } from './user/user.module';
import { CustomerModule } from './customer/customer.module';
import { EmployeeModule } from './employee/employee.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { ManagerModule } from './manager/manager.module';


const getTerminusOptions = (
  db: TypeOrmHealthIndicator,
): TerminusModuleOptions => ({
  endpoints: [
    {
      url: '/health',
      healthIndicators: [
        async () => db.pingCheck('database', { timeout: 300 }),
      ],
    },
  ],
});

@Module({
  imports: [
    AuthModule,
    LoggerModule.register(),
    BootModule.register(Config.context, Config.filename),
    ConsulModule.register({ dependencies: [NEST_BOOT] }),
    ServiceModule.register({ dependencies: [NEST_BOOT, NEST_CONSUL] }),
    LoadbalanceModule.register({ dependencies: [NEST_BOOT] }),
    TerminusModule.forRootAsync({
      inject: [TypeOrmHealthIndicator],
      useFactory: db => getTerminusOptions(db as TypeOrmHealthIndicator),
    }),
    // HttpModule.register({ dependencies: [NEST_BOOT, NEST_LOADBALANCE] }),
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
    TypeOrmModule.forRootAsync({
      useFactory: (config: Boot) => ({
        type: 'postgres',
        host: config.get('database.host', 'localhost'),
        port: config.get('database.port', 5432),
        username: config.get('database.user', 'postgres'),
        password: config.get('database.password', 'postgres'),
        database: config.get('database.database', 'auth_ms'),
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
        synchronize: config.get('database.synchronize', false),
        maxQueryExecutionTime: config.get(
          'dataSource.maxQueryExecutionTime',
          1000,
        ),
        logging: 'all',
        cache: {
          type: 'redis',
          options: {
            host: config.get('redis.host', 'localhost'),
            port: config.get('redis.port', 6379),
            password: config.get('redis.auth_pass', ''),
            prefix: config.get('redis.prefix', ''),
          },
          duration: config.get('redis.cache_duration', 10),
        },
      }),
      inject: [NEST_BOOT_PROVIDER],
    }),
    RoleModule,
    PermissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
