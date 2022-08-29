export interface InstanceParams {
  name: string;
  options?: Options;
}

interface TrackingIdConfig {
  enable: boolean;
  valuePath?: string;
}

export interface Options {
  correlationId?: TrackingIdConfig;
}

export interface CheckParams {
  store: ObjectRecord;
}

export default interface IContextStrategy {
  name: string;
  options?: Options;
  storage?: any;

  create(): void;

  destroy(): void;

  run(callback: (...args: any[]) => any): any;

  run(store: any, callback: (...args: any[]) => any): any;

  runPromise(callback: (...args: any[]) => Promise<any>): Promise<any> | any;

  runPromise(store: any, callback: (...args: any[]) => Promise<any>): Promise<any> | any;

  set(store: any): void;

  get(key: string): any | undefined;

  use(req: ObjectRecord, res: ObjectRecord, next: (error?: Error) => void): void;
}
