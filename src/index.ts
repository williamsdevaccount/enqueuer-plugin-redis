import * as subscription from './redis-subscription';
import * as publisher from './redis-publisher';
import {MainInstance} from 'enqueuer-plugins-template';

export function entryPoint(mainInstance: MainInstance): void {
    subscription.entryPoint(mainInstance);
    publisher.entryPoint(mainInstance);
}
