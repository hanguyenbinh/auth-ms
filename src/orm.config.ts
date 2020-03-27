import { ConnectionOptions } from 'typeorm';
import { join } from 'path';
import * as YAML from 'yamljs';
import { context, filename } from './config';
const appConfig: any = YAML.load(context + '/' + filename);

// You can load you .env file here synchronously using dotenv package (not installed here),
// import * as dotenv from 'dotenv';
// import * as fs from 'fs';
// const environment = process.env.NODE_ENV || 'development';
// const data: any = dotenv.parse(fs.readFileSync(`${environment}.env`));
// You can also make a singleton service that load and expose the .env file content.
// ...


// Check typeORM documentation for more information.
console.log(appConfig);
const config: ConnectionOptions = {
    type: 'postgres',
    host: appConfig.database.host || 'localhost',
    port: appConfig.database.port || 5432,
    username: appConfig.database.user || 'postgres',
    password: appConfig.database.password || 'postgres',
    database: appConfig.database.database || 'auth_ms',
    entities: [__dirname + '/entities/*.entity{.ts,.js}'],
    synchronize: appConfig.database.synchronize || false,
    migrationsRun: appConfig.database.migrationsRun || true,
    migrations: [join(__dirname, '/../migrations/**/*{.ts,.js}')],
    cli: {
        // Location of migration should be inside src folder
        // to be compiled into dist/ folder.
        migrationsDir: 'src/migrations',
    },
    maxQueryExecutionTime: appConfig.database.maxQueryExecutionTime || 1000,
    logging: 'all'
};

export = config;