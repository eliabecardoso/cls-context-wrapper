import cls from '@eliabecardoso/cls-hooked';
import { v4 } from 'uuid';
import { getProp, errorHandler } from './utils';

interface InstanceParams {
  readonly name: string;
  readonly options: Options;
}

interface RequestIDConfig {
  enable: boolean;
  key: string;
  value: string;
}

interface Options {
  requestId: RequestIDConfig;
}

export default class Context {
  name: string;
  options: Options;
  private ns: any;

  constructor({ name, options }: InstanceParams) {
    this.name = name;
    this.options = options;

    this.ns = cls.createNamespace(this.name || 'MyApp');
  }

  set(key: string, value: any): boolean {
    try {
      if (!key || !value) throw new Error('Missing params.');

      this.ns.set(key, value);

      return true;
    } catch (error: any) {
      errorHandler(error as Error);

      return false;
    }
  }

  get(key: string): any {
    try {
      if (!key) throw new Error('Missing key param.');

      return this.ns.get(key);
    } catch (error: any) {
      errorHandler(error as Error);

      return null;
    }
  }

  use(req: defaultObj, res: defaultObj, next: Function): void {
    try {
      this.ns.bindEmitter(req);
      this.ns.bindEmitter(res);

      this.ns.run(() => {
        this.preset(req);

        next();
      });
    } catch (error: any) {
      errorHandler(error as Error);

      next();
    }
  }

  preset(req: any): void {
    if (this.options.requestId.enable) {
      const { key: k, value: v } = this.options.requestId;

      req[getProp(req, k, 'requestId')] = getProp(req, v, req.requestId || req.headers['x-request-id'] || v4());
      this.set('requestId', req.requestId);
    }
  }
}
