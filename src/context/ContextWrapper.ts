import * as semver from 'semver';
import ContextAsyncHooks from './ContextAsyncHooks';
import ContextLegacy from './ContextLegacy';
import IContextStrategy, { InstanceParams } from './IContextStrategy';
import { messageHandler, middlewareStrategy } from '../utils';

/**
 * @type {IContextStrategy}
 */
let instance: IContextStrategy | null;
const CORRELATION_ID = 'correlationId';
const TRACKING_FLOW_ID = 'trackingFlowId';
const USER = 'user';

export default class ContextWrapper {
  static getInstance(params?: InstanceParams): IContextStrategy {
    if (!instance) {
      if (!params?.name) {
        messageHandler('warn', '[ContextWrapper] Missed passing name param. Default Name: MyApp');
      }

      const props: InstanceParams = {
        name: 'MyApp',
        options: {
          correlationId: { enable: true },
          trackingFlowId: { enable: false },
        },
        ...params,
      };

      instance = ContextWrapper.createInstance(props);
    }

    return instance;
  }

  private static createInstance(props: InstanceParams): IContextStrategy {
    return semver.gte(process.versions.node, '14.20.0') ? new ContextAsyncHooks(props) : new ContextLegacy(props);
  }

  static destroy(): void {
    instance?.destroy();
    instance = null;
  }

  static set(store: ObjectRecord): void {
    instance?.set(store);
  }

  static get(key?: string): any {
    return instance?.get(key);
  }

  static setCorrelationId(value: string | number): void {
    instance?.set({ correlationId: value });
  }

  static getCorrelationId(): string | number | undefined {
    return instance?.get(CORRELATION_ID);
  }

  static setTrackingFlowId(value: string | number): void {
    instance?.set({ trackingFlowId: value });
  }

  static getTrackingFlowId(): string | number | undefined {
    return instance?.get(TRACKING_FLOW_ID);
  }

  static setUserSession(value: ObjectRecord | any): void {
    instance?.set({ user: value });
  }

  static getUserSession(): ObjectRecord | any {
    return instance?.get(USER);
  }

  static middleware(...args: any[]): void {
    const { req, res, next } = middlewareStrategy(...args);

    if (!instance) return next();

    instance.use(req, res, next);
  }
}
