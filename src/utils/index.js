const devEnvs = ['dev', 'develop', 'development', 'test'];

export function getProp(object, keys, defaultVal) {
  keys = Array.isArray(keys) ? keys : keys.split('.');
  object = object[keys[0]];
  if (object && keys.length > 1) {
    return getProp(object, keys.slice(1));
  }
  return object === undefined ? defaultVal : object;
}

const errorHandler = (error) => {
  if (devEnvs.includes(process.env.NODE_ENV)) {
    console.error('[ContextWrapper] Error:', error);
  }
};

module.exports = {
  errorHandler,
  getProp,
};
