export interface InstanceParams {
  name: string;
  options?: Options;
}

interface CorrelationIdConfig {
  enable: boolean;
  valuePath?: string;
}

export interface Options {
  correlationId?: CorrelationIdConfig;
}

export interface CheckParams {
  store: ObjectRecord;
}

export default interface IContextStrategy {
  name: string;
  options?: Options;
  storage?: any;

  destroy(): void;

  run(callback: (...args: any[]) => void): void;

  run(store: any, callback: (...args: any[]) => void): void;

  runPromise(callback: (...args: any[]) => Promise<void>): void;

  runPromise(store: any, callback: (...args: any[]) => Promise<void>): void;

  set(store: ObjectRecord): void;

  get(key?: string): any;

  use(req: ObjectRecord, res: ObjectRecord, next: () => void): void;
}
