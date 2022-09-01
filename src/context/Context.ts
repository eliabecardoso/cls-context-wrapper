import { v4 as uuid } from 'uuid';
import { CheckParams, InstanceParams, Options } from './IContextStrategy';
import { get } from '../utils';

const messages = {
  NOT_FOUND_STORAGE: 'The Storage not exists (destroy called before).',
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

    if (typeof store !== 'object') throw new Error(messages.NOT_FOUND_STORAGE);
  }

  preset(req: ObjectRecord, res: ObjectRecord): any {
    const presets: ObjectRecord = {};

    if (this.options?.correlationId?.enable) {
      const { valuePath } = this.options?.correlationId;

      const correlationId: string = req.headers && req.headers['X-Correlation-ID'];
      const requestId: string = (req.headers && req.headers['X-Request-ID']) || 'requestId';

      const value = get(req, valuePath || correlationId || requestId, uuid());

      if (typeof res.setHeader === 'function') res.setHeader('X-Correlation-ID', value);

      presets.correlationId = value;
    }

    return presets;
  }
}
