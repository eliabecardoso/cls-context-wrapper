import { v4 as uuid } from 'uuid';
import { CheckParams, InstanceParams, Options } from './IContextStrategy';
import { get } from '../utils';

const messages = {
  NOT_FOUND_STORAGE: 'The Storage not exists (is destroy called before?).',
  INVALID_STORE: 'The Store is an invalid type.',
};

export default class Context {
  name: string;
  options?: Options;

  constructor(params: InstanceParams) {
    this.name = params.name;
    this.options = params.options;
  }

  check(storage: any, checkParams?: CheckParams): void {
    if (!storage) throw new Error(messages.NOT_FOUND_STORAGE);

    if (!checkParams) return;

    const { store } = checkParams;

    if (store && typeof store !== 'object') throw new Error(messages.INVALID_STORE);
  }

  preset({ req = {}, res = {} }: Record<string, any>): any {
    return {
      correlationId: this.setupCorrelationId({ req, res }),
      trackingFlowId: this.setupTrackingFlowId({ req, res }),
    };
  }

  private getHeaders(headers: Record<string, any>): Record<string, any> {
    return Object.entries(headers || {}).reduce((acc, [key, value]) => ({ ...acc, [key.toLowerCase()]: value }), {});
  }

  private setupCorrelationId({ req, res }: Record<string, any>) {
    const headers = this.getHeaders(req?.headers);

    if (this.options?.correlationId?.enable) {
      const valuePath = this.options?.correlationId?.valuePath;

      const correlationId: string = headers['correlation-id'];
      const requestId: string = headers['request-id'];
      const value = get(req, valuePath || 'correlationId', correlationId || requestId || uuid());

      if (typeof res.setHeader === 'function') res.setHeader('Correlation-ID', value);

      return value;
    }
  }

  private setupTrackingFlowId({ req, res }: Record<string, any>) {
    const headers = this.getHeaders(req?.headers);

    if (this.options?.trackingFlowId?.enable) {
      const valuePath = this.options?.trackingFlowId?.valuePath;

      const trackingFlowId: string = headers['tracking-flow-id'];
      const value = get(req, valuePath || 'trackingFlowId', trackingFlowId || uuid());

      if (typeof res.setHeader === 'function') res.setHeader('Tracking-Flow-ID', value);

      return value;
    }
  }
}
