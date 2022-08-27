import Context from './Context';
import { errorHandler, middlewareStrategy } from './utils';

/**
 * @type {Context}
 */
let instance: Context | null;

export default class ContextWrapper extends Context {
  static getInstance(params?: { name: string; options: defaultObj }): Context {
    if (!instance) {
      const defaultParams = { name: 'MyApp', options: { requestId: { enable: true } } };
      if (!params?.name) {
        errorHandler(new Error('[ContextWrapper] Missed passing name param. Default Name: MyApp'));
      }

      instance = new Context(params || defaultParams);
    }

    return instance;
  }

  static destroy(): void {
    instance?.destroyNamespace();
    instance = null;
  }

  static set(key: string, value: any): boolean | undefined {
    return instance?.set(key, value);
  }

  static get(key: string): any | undefined {
    return instance?.get(key);
  }

  static setRequestId(value: string | number): boolean | undefined {
    return instance?.set('requestId', value);
  }

  static getRequestId(): string | number | undefined {
    return instance?.get('requestId');
  }

  static setUserSession(value: defaultObj | any): boolean | undefined {
    return instance?.set('user', value);
  }

  static getUserSession(): defaultObj | any | undefined {
    return instance?.get('user');
  }

  static middleware(...args: any[]): void {
    const { req, res, next } = middlewareStrategy(...args);

    if (!instance) return next();

    instance.use(req, res, next);
  }
}
