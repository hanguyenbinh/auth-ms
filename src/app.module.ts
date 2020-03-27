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
import { NEST_BOOT, NEST_CONSUL, NEST_BOOT_PROVIDER } from '@nestcloud/common';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { join } from 'path';



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
        migrationsRun: config.get('database.migrationsRun', true),
        migrations: [join(__dirname, '/../migrations/**/*{.ts,.js}')],
        cli: {
          // Location of migration should be inside src folder
          // to be compiled into dist/ folder.
          migrationsDir: 'src/migrations',
        },
        maxQueryExecutionTime: config.get(
          'database.maxQueryExecutionTime',
          1000,
        ),
        logging: 'all'
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
