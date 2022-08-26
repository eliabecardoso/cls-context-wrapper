import * as cls from '@eliabecardoso/cls-hooked';
import * as uuid from 'uuid';
import * as utils from './utils';

const { v4 } = uuid;
const { get, errorHandler } = utils;

const messages = {
  nsNotExists: 'The namespace not exists (destroy called before).',
  keyInvalid: 'The key is nullable or invalid type.',
};

interface InstanceParams {
  readonly name: string;
  readonly options: Options;
}

interface RequestIDConfig {
  enable: boolean;
  valuePath?: string;
}

interface Options {
  requestId?: RequestIDConfig;
}

interface CheckParams {
  key?: string;
}

export default class Context {
  name: string;
  options?: Options;
  private ns: any;

  constructor({ name, options }: InstanceParams) {
    this.name = name;
    this.options = options;

    this.ns = this.createNamespace();
  }

  private createNamespace(): any {
    if (cls.getNamespace(this.name)) {
      throw new Error(`The context ${this.name} already exists. Operation not permitted.`);
    }

    return cls.createNamespace(this.name || 'MyApp');
  }

  destroyNamespace(): void {
    if (cls.getNamespace(this.name)) cls.destroyNamespace(this.name);
    this.ns = null;
  }

  isNamespaceActive(): boolean {
    return !!this.ns;
  }

  run(callback: () => any): () => any {
    return this.ns.run(callback);
  }

  runAndReturn(callback: () => any): () => any {
    return this.ns.runAndReturn(callback);
  }

  async runPromise(promise: () => any): Promise<any> {
    return this.ns.runPromise(promise);
  }

  private check(checkParams?: CheckParams): void {
    if (!this.ns) throw new Error(messages.nsNotExists);

    if (!checkParams) return;

    const { key } = checkParams;

    if (key && typeof key !== 'string') throw new Error(messages.keyInvalid);
  }

  set(key: string, value: any): boolean {
    try {
      this.check({ key });
      this.ns.set(key, value);

      return true;
    } catch (error: any) {
      errorHandler(error as Error);

      return false;
    }
  }

  get(key: string): any {
    try {
      this.check({ key });

      return this.ns.get(key);
    } catch (error: any) {
      errorHandler(error as Error);

      return null;
    }
  }

  use(req: defaultObj, res: defaultObj, next: () => any): void {
    this.check();

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

  private preset(req: any): void {
    if (this.options?.requestId?.enable) {
      const { valuePath } = this.options.requestId;

      const value = get(req, valuePath || (req.headers && req.headers['x-request-id']) || 'requestId', v4());

      this.set('requestId', value);
    }
  }
}
