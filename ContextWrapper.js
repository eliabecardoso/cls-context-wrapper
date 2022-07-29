const Context = require('./Context');
const { errorHandler } = require('./utils');

/**
 * @type {Context}
 */
let instance;

class ContextWrapper extends Context {
  static setRequestId(value) {
    if (!instance) return null;

    return instance.set('requestId', value);
  }

  static getRequestId() {
    if (!instance) return null;

    return instance.get('requestId');
  }

  static setUserSession(value) {
    if (!instance) return null;

    return instance.set('user', value);
  }

  static getUserSession() {
    if (!instance) return {};

    return instance.get('user') || {};
  }

  static middleware(...args) {
    if (!instance) return null;

    if (args[0] && args[0].req) {
      const [{ req, res }, ...rest] = args;
      return instance.use(req, res, ...rest);
    }

    return instance.use(...args);
  }

  static getInstance(params = {}) {
    if (!instance) {
      if (!params.name) {
        errorHandler(new Error('[ContextWrapper] Missed passing name param. Default Name: MyApp'));

        params.name = 'MyApp'
      }

      instance = new Context(params);
    }

    return instance;
  }

  static cleanInstance() {
    instance = null;
  }
}

module.exports = ContextWrapper;
