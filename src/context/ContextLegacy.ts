import * as cls from '@ehsc/cls-hooked';
import { messageHandler } from '../utils';
import Context from './Context';
import IContextStrategy, { InstanceParams } from './IContextStrategy';

export default class ContextLegacy extends Context implements IContextStrategy {
  storage?: Record<string, any>;

  constructor(params: InstanceParams) {
    super({ ...params });

    this.create();
  }

  private create(): void {
    if (cls.getNamespace(this.name)) {
      return messageHandler('error', new Error(`The context ${this.name} already exists. Operation not permitted.`));
    }

    this.storage = cls.createNamespace(this.name || 'MyApp');
  }

  destroy(): void {
    if (cls.getNamespace(this.name)) cls.destroyNamespace(this.name);
    this.storage = undefined;
  }

  run(callback: () => void): void {
    this.storage?.run(callback);
  }

  runPromise(callback: () => Promise<void>): void {
    this.storage?.runPromise(callback);
  }

  set(store: Record<string, any>): void {
    this.check(this.storage, { store });

    Object.entries(store).forEach(([key, value]) => this.storage?.set(key, value));
  }

  get(key?: string): any {
    super.check(this.storage);

    return this.storage?.get(key);
  }

  use(req: Record<string, any>, res: Record<string, any>, next: (error?: Error | any) => any): void {
    super.check(this.storage);

    try {
      this.storage?.bindEmitter(req);
      this.storage?.bindEmitter(res);

      this.run(() => {
        const presets = super.preset({ req, res });
        this.set({ ...presets });

        next();
      });
    } catch (err) {
      messageHandler('error', err);

      next(err);
    }
  }
}
