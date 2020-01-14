import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CustomerModule } from '../customer/customer.module';
import { UserModule } from '../user/user.module';
import { EmployeeModule } from '../employee/employee.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '../jwt/jwtConfig.class';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    CustomerModule,
    UserModule,
    EmployeeModule,
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule { }
