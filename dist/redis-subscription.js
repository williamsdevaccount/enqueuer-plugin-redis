"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const enqueuer_plugins_template_1 = require("enqueuer-plugins-template");
const utils = __importStar(require("./utils"));
class RedisSubscription extends enqueuer_plugins_template_1.Subscription {
    constructor(subscriptionAttributes) {
        super(subscriptionAttributes);
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            if (this.client === null) {
                reject(`Error trying to receive message. Subscription is not connected yet: ${this.connectionOptions}`);
            }
            else {
                enqueuer_plugins_template_1.Logger.debug('message receiver resolver initialized');
                this.messageReceivedResolver = resolve;
            }
        });
    }
    subscribe() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.client = yield utils.getClient(this.connectionOptions);
                this.client.subscribe(this.channel, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        this.client.on('message', (channel, payload) => this.gotMessage(channel, payload));
                        resolve();
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client) {
                this.client.disconnect();
            }
            delete this.client;
        });
    }
    gotMessage(channel, payload) {
        enqueuer_plugins_template_1.Logger.debug('redis subscriber got message');
        if (this.messageReceivedResolver) {
            this.messageReceivedResolver({ payload, channel });
        }
        else {
            enqueuer_plugins_template_1.Logger.error('redis message receiver resolver is not initialized');
        }
    }
}
exports.RedisSubscription = RedisSubscription;
function entryPoint(mainInstance) {
    const redis = new enqueuer_plugins_template_1.SubscriptionProtocol('redis', (subscriptionModel) => new RedisSubscription(subscriptionModel), ['payload', 'channel'])
        .setLibrary('ioredis');
    mainInstance.protocolManager.addProtocol(redis);
}
exports.entryPoint = entryPoint;
