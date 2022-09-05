import { AsyncLocalStorage } from 'async_hooks';
import { messageHandler } from '../utils';
import Context from './Context';
import IContextStrategy, { InstanceParams } from './IContextStrategy';

export default class ContextAsyncHooks extends Context implements IContextStrategy {
  storage?: AsyncLocalStorage<any>;

  constructor(params: InstanceParams) {
    super({ ...params });

    this.create();
  }

  private create(): void {
    this.storage = new AsyncLocalStorage();
  }

  destroy(): void {
    this.storage?.disable();
    this.storage?.exit(() => {});
    this.storage = undefined;
  }

  run(store: any, callback?: () => void): void {
    if (!callback) return this.storage?.run({} as any, store as () => void);

    return this.storage?.run(store, callback);
  }

  runPromise(store: any, callback?: () => Promise<void>): void {
    if (!callback) {
      this.storage?.run({} as any, store as () => Promise<void>);

      return;
    }

    this.storage?.run(store, callback);
  }

  set(store: ObjectRecord): boolean | void {
    this.check(this.storage, { store });

    this.storage?.enterWith({ ...this.storage?.getStore(), ...(store as any) });
  }

  get(key?: string): any {
    super.check(this.storage);

    const store = this.storage?.getStore() as any;

    if (typeof store === 'object' && key) return store[key];

    return store;
  }

  use(req: ObjectRecord, res: ObjectRecord, next: (error?: Error | any) => void): void {
    super.check(this.storage);

    try {
      this.run({}, () => {
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
