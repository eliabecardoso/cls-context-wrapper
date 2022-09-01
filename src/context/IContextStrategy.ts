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

  run(callback: () => void): void;

  run(store: any, callback: () => void): void;

  runPromise(callback: () => Promise<void>): void;

  runPromise(store: any, callback: () => Promise<void>): void;

  set(store: ObjectRecord): void;

  get(key?: string): any;

  use(req: ObjectRecord, res: ObjectRecord, next: () => void): void;
}
