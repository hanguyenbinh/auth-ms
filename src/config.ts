import {resolve} from 'path';
export const context = resolve(__dirname + '/../');
export const filename = `config.${process.env.NODE_ENV || 'development'}.yaml`;
