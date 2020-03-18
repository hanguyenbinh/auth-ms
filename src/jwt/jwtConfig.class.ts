import { JwtOptionsFactory, JwtModuleOptions } from '@nestjs/jwt';
import { Injectable, Logger } from '@nestjs/common';
import { BootValue, InjectBoot, Boot } from '@nestcloud/boot';

@Injectable()
export class JwtConfig implements JwtOptionsFactory {
    constructor(@InjectBoot() private readonly boot: Boot) {
        Logger.log(this.boot.get('jwt.public'));
    }
    createJwtOptions(): JwtModuleOptions {
        return {
            // secret: this.boot.get('jwt.serect', 'cinnolab'),
            signOptions: { expiresIn: this.boot.get('jwt.expireIn'), algorithm: 'RS256' },
            privateKey: this.boot.get('jwt.private'),
            publicKey: this.boot.get('jwt.public'),
            verifyOptions: { algorithms: ['RS256'] },
        };
    }
}
