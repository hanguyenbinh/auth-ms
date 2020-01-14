import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NestCloud } from '@nestcloud/core';
import { NestLogger } from '@nestcloud/logger';
import { context, filename } from './config';

async function bootstrap() {
  const app = NestCloud.create(await NestFactory.create(AppModule, {
    logger: new NestLogger({ path: context, filename }),
  }));
  await app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      url: `0.0.0.0:${NestCloud.global.boot.get('service.port')}`,
      package: 'auth_service',
      protoPath: join(__dirname, 'protobufs/auth_service.proto'),
    },
  });
  await app.startAllMicroservicesAsync();
  await app.listen(null);
}
bootstrap();
