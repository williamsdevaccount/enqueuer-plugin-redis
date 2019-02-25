"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const subscription = __importStar(require("./redis-subscription"));
const publisher = __importStar(require("./redis-publisher"));
function entryPoint(mainInstance) {
    subscription.entryPoint(mainInstance);
    publisher.entryPoint(mainInstance);
}
exports.entryPoint = entryPoint;
