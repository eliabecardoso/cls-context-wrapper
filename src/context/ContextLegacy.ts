import * as cls from '@ehsc/cls-hooked';
import * as uuid from 'uuid';
import Context from './Context';
import IContextStrategy, { InstanceParams } from './IContextStrategy';
import * as utils from '../utils';

const { errorHandler } = utils;

export default class ContextLegacy extends Context implements IContextStrategy {
  storage?: ObjectRecord;

  constructor(params: InstanceParams) {
    super({ ...params });

    this.create();
  }

  private create(): void {
    if (cls.getNamespace(this.name)) {
      return errorHandler(new Error(`The context ${this.name} already exists. Operation not permitted.`));
    }

    this.storage = cls.createNamespace(this.name || 'MyApp');
  }

  destroy(): void {
    if (cls.getNamespace(this.name)) cls.destroyNamespace(this.name);
    this.storage = undefined;
  }

  run(callback: (...args: any[]) => void): void {
    this.storage?.run(callback);
  }

  runPromise(callback: (...args: any[]) => Promise<void>): void {
    this.storage?.runPromise(callback);
  }

  set(store: ObjectRecord): void {
    this.check(this.storage, { store });

    Object.entries(store).forEach(([key, value]) => this.storage?.set(key, value));
  }

  get(key?: string): any {
    super.check(this.storage);

    return this.storage?.get(key);
  }

  use(req: ObjectRecord, res: ObjectRecord, next: () => any): void {
    super.check(this.storage);

    try {
      this.storage?.bindEmitter(req);
      this.storage?.bindEmitter(res);

      this.run(() => {
        const presets = super.preset(req, res);
        this.set({ ...presets });

        next();
      });
    } catch (err: any) {
      errorHandler(err as Error);

      next();
    }
  }
}
