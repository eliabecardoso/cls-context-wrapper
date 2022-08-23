const devEnvs = ['dev', 'develop', 'development', 'test'];

export const getProp = (object: { [key: string]: any }, keys: string | Array<string>, defaultVal?: any): any => {
  const auxKeys: Array<string> = Array.isArray(keys) ? keys : keys.split('.');
  const auxObject = object[auxKeys[0]];
  if (auxObject && auxKeys.length > 1) {
    return getProp(auxObject, auxKeys.slice(1));
  }
  return auxObject === undefined ? defaultVal : auxObject;
};

export const errorHandler = (error: Error) => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV && devEnvs.includes(NODE_ENV)) {
    console.error('[ContextWrapper] Error:', error);
  }
};

export const middlewareStrategy = (...args: any[]): { req: defaultObj; res: defaultObj; next: Function } => {
  if (args[0] && args[0].req) return { req: args[0].req, res: args[0].req, next: args[1] };

  return { req: args[0], res: args[1], next: args[2] };
};
