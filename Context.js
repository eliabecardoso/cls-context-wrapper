const cls = require('@eliabecardoso/cls-hooked');
const { v4 } = require('uuid');
const { getProp, errorHandler } = require('./utils');

class Context {
  #ns;
  /**
   *
   * @param {object} params
   * @param {string} params.name
   * @param {object} params.requestId
   * @param {boolean} params.requestId.auto
   * @param {string} params.requestId.key
   * @param {string} params.requestId.value
   */
   constructor({ name, requestId }) {
    this.name = name;
    this.requestId = requestId || { auto: true };
    this.#ns = cls.createNamespace(this.name);
  }
  set(key, value) {
    try {
      if (!key || !value || !this.#ns.active) return null;

      this.#ns.set(key, value);

      return { ok: true };
    } catch (error) {
      errorHandler(error);

      return null;    
    }
  }

  get(key) {
    try {
      if (!key || !this.#ns.active) return null;

      return this.#ns.get(key);
    } catch (error) {
      errorHandler(error);

      return null;
    }
  }

  use(req, res, next) {
    try {
      this.#ns.bindEmitter(req);
      this.#ns.bindEmitter(res);

      this.#ns.run(() => {
        this.preset(req);

        next();
      });
    } catch (error) {
      errorHandler(error);

      return null;
    }
  }

  preset(req) {
    if (this.requestId.enable) {
      const { key: k, value: v } = this.requestId;

      const key = getProp(k) || 'requestId';
      const value = getProp(req, v, req.requestId || req.headers['x-request-id'] || v4());

      req[key] = value;
      this.set('requestId', req.requestId);
    }
  }
}

module.exports = Context;
