import Context from './Context';
import { errorHandler, middlewareStrategy } from './utils';

/**
 * @type {Context}
 */
let instance: Context | null;

export default class ContextWrapper extends Context {
  static getInstance(params?: { name: string; options: defaultObj }) {
    if (!instance) {
      const defaultParams = { name: 'MyApp', options: { requestId: { enable: true } }};
      if (!params?.name) {
        errorHandler(new Error('[ContextWrapper] Missed passing name param. Default Name: MyApp'));
      }

      instance = new Context(params || defaultParams);
    }

    return instance;
  }

  static destroy() {
    instance?.destroyNamespace();
    instance = null;
  }

  static set(key: string, value: any) {
    if (!instance) return null;

    return instance.set(key, value);
  }

  static get(key: string) {
    if (!instance) return null;

    return instance.get(key);
  }

  static setRequestId(value: string | number) {
    if (!instance) return null;

    return instance.set('requestId', value);
  }

  static getRequestId() {
    if (!instance) return null;

    return instance.get('requestId');
  }

  static setUserSession(value: defaultObj) {
    if (!instance) return null;

    return instance.set('user', value);
  }

  static getUserSession() {
    if (!instance) return {};

    return instance.get('user') || {};
  }

  static middleware(...args: any[]) {
    const { req, res, next } = middlewareStrategy(...args);

    if (!instance) return next();

    instance.use(req, res, next);
  }
}
