import {PublisherProtocol, Publisher, PublisherModel, Logger, MainInstance} from 'enqueuer-plugins-template';
import * as utils from './utils';

export class RedisPublisher extends Publisher {

    public constructor(publish: PublisherModel) {
        super(publish);
    }

    public publish(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const publisher = await utils.getClient(this.connectionOptions);
                const subscriber = await utils.getClient(this.connectionOptions);
                subscriber.subscribe(this.channel, async (err: Error) => {
                    if (err) {
                        reject(err);
                    } else {
                        await publisher.publish(this.channel, this.payload);
                    }
                });
                setTimeout(() => resolve(), this.responseTimeout || 1000);
                subscriber.on('message',(channel: string, payload: string) => {
                    this.messageReceived = {payload, channel};
                    subscriber.disconnect();
                    publisher.disconnect();
                    resolve();
                });
            } catch (e) {
              reject(e);
            }
        });
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    const redis = new PublisherProtocol('redis',
        (publisherModel: PublisherModel) => new RedisPublisher(publisherModel))
        .setLibrary('ioredis');
    mainInstance.protocolManager.addProtocol(redis);
}
