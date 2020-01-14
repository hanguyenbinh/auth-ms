import { Module } from '@nestjs/common';
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
import { NEST_BOOT, NEST_CONSUL, NEST_BOOT_PROVIDER, NEST_TYPEORM_LOGGER_PROVIDER } from '@nestcloud/common';
import { UserModule } from './user/user.module';
import { CustomerModule } from './customer/customer.module';
import { EmployeeModule } from './employee/employee.module';

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
    BootModule.register(__dirname, Config.filename),
    ConsulModule.register({ dependencies: [NEST_BOOT] }),
    ServiceModule.register({ dependencies: [NEST_BOOT, NEST_CONSUL] }),
    LoadbalanceModule.register({ dependencies: [NEST_BOOT] }),
    TerminusModule.forRootAsync({
      inject: [TypeOrmHealthIndicator],
      useFactory: db => getTerminusOptions(db as TypeOrmHealthIndicator),
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
      }),
      inject: [NEST_BOOT_PROVIDER],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
