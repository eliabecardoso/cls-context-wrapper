export interface InstanceParams {
  name: string;
  options?: Options;
}

interface CorrelationIdConfig {
  enable: boolean;
  valuePath?: string;
}

interface TrackingFlowIdConfig {
  enable: boolean;
  valuePath?: string;
}

export interface Options {
  correlationId?: CorrelationIdConfig;
  trackingFlowId?: TrackingFlowIdConfig;
}

export interface CheckParams {
  store?: Record<string, any>;
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

  set(store: Record<string, any>): void;

  get(key?: string): any;

  use(req: Record<string, any>, res: Record<string, any>, next: () => void): void;
}
