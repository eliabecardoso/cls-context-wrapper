import Context from './Context';
import { errorHandler, middlewareStrategy } from './utils';

/**
 * @type {Context}
 */
let instance: Context | null;

export default class ContextWrapper extends Context {
  static getInstance(params: { name: string; options: defaultObj }) {
    if (!instance) {
      if (!params.name) {
        errorHandler(new Error('[ContextWrapper] Missed passing name param. Default Name: MyApp'));

        params.name = 'MyApp';
      }

      instance = new Context(params);
    }

    return instance;
  }

  static destroy() {
    instance?.destroyNamespace();
    instance = null;
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
