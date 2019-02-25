import {Logger} from 'enqueuer-plugins-template';
import Redis from 'ioredis';

export const getClient = (options: any): Promise<Redis.Redis> => {
    return new Promise((resolve, reject) => {
        const client = new Redis(options);
        client.on('ready', () => {
            resolve(client);
        });
        client.on('error', (err: Error) => {
            reject(err);
        });
    });
};
