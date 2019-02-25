"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
exports.getClient = (options) => {
    return new Promise((resolve, reject) => {
        const client = new ioredis_1.default(options);
        client.on('ready', () => {
            resolve(client);
        });
        client.on('error', (err) => {
            reject(err);
        });
    });
};
