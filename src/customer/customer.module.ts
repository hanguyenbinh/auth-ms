import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerRepository } from '../entities/customer.repository';
import { CustomerController } from './customer.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '../jwt/jwtConfig.class';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerRepository]),
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),
  ],
  providers: [CustomerService],
  exports: [CustomerService],
  controllers: [CustomerController],
})
export class CustomerModule { }
