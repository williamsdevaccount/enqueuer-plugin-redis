import {Logger, MainInstance, Subscription, SubscriptionModel, SubscriptionProtocol} from 'enqueuer-plugins-template';
import * as utils from './utils';
import Redis from 'ioredis';

export class RedisSubscription extends Subscription {

    private client?: Redis.Redis;
    private messageReceivedResolver?: (value?: (PromiseLike<any> | any)) => void;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.client === null) {
                reject(`Error trying to receive message. Subscription is not connected yet: ${this.connectionOptions}`);
            } else {
                Logger.debug('message receiver resolver initialized');
                this.messageReceivedResolver = resolve;
            }
        });
    }

    public subscribe(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                this.client = await utils.getClient(this.connectionOptions);
                this.client.subscribe(this.channel, (err: Error) => {
                    if (err) {
                        reject(err);
                    } else {
                        this.client!.on('message', (channel: string, payload: string) => this.gotMessage(channel, payload));
                        resolve();
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    public async unsubscribe(): Promise<void> {
        if (this.client) {
            this.client.disconnect();
        }
        delete this.client;
    }

    private gotMessage(channel: string, payload: string) {
        Logger.debug('redis subscriber got message');
        if (this.messageReceivedResolver) {
            this.messageReceivedResolver({payload, channel});
        } else {
            Logger.error('redis message receiver resolver is not initialized');
        }
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    const redis = new SubscriptionProtocol('redis',
        (subscriptionModel: SubscriptionModel) => new RedisSubscription(subscriptionModel),
        ['payload', 'channel'])
        .setLibrary('ioredis');
    mainInstance.protocolManager.addProtocol(redis);
}
