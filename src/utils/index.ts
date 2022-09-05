const devEnvs = ['dev', 'develop', 'development', 'test'];

export const get = (object: ObjectRecord = {}, keys: string | string[], defaultVal?: any): any => {
  const auxKeys: string[] = Array.isArray(keys) ? keys : keys.split('.');
  const auxObject = object[auxKeys[0]];

  if (auxObject && auxKeys.length > 1) return get(auxObject, auxKeys.slice(1));

  return auxObject === undefined ? defaultVal : auxObject;
};

type messageType = 'info' | 'error' | 'warn';

export const messageHandler = (mType: messageType, message: Error | any) => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV && devEnvs.includes(NODE_ENV)) {
    console[mType](`[ContextWrapper] ${mType}:`, message);
  }
};

export const middlewareStrategy = (...args: any[]): { req: ObjectRecord; res: ObjectRecord; next: () => any } => {
  if (args[0] && args[0].req) return { req: args[0].req, res: args[0].req, next: args[1] };

  return { req: args[0], res: args[1], next: args[2] };
};
