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
class RedisPublisher extends enqueuer_plugins_template_1.Publisher {
    constructor(publish) {
        super(publish);
    }
    publish() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const publisher = yield utils.getClient(this.connectionOptions);
                const subscriber = yield utils.getClient(this.connectionOptions);
                subscriber.subscribe(this.channel, (err) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        reject(err);
                    }
                    else {
                        yield publisher.publish(this.channel, this.payload);
                    }
                }));
                setTimeout(() => resolve(), this.responseTimeout || 1000);
                subscriber.on('message', (channel, payload) => {
                    this.messageReceived = { payload, channel };
                    subscriber.disconnect();
                    publisher.disconnect();
                    resolve();
                });
            }
            catch (e) {
                reject(e);
            }
        }));
    }
}
exports.RedisPublisher = RedisPublisher;
function entryPoint(mainInstance) {
    const redis = new enqueuer_plugins_template_1.PublisherProtocol('redis', (publisherModel) => new RedisPublisher(publisherModel))
        .setLibrary('ioredis');
    mainInstance.protocolManager.addProtocol(redis);
}
exports.entryPoint = entryPoint;
