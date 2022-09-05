import { v4 as uuid } from 'uuid';
import Context from '../../src/context/Context';

let storage: any;

describe('ContextAsyncHooks', () => {
  beforeEach(() => {
    storage = {};
  });

  it('should instance a Context class', () => {
    const contextBase = new Context({ name: 'MyApp' });

    expect(contextBase).toBeInstanceOf(Context);
  });

  describe('#check', () => {
    it('should invalidate the storage', () => {
      const contextBase = new Context({ name: 'MyApp' });

      expect(() => {
        contextBase.check(storage = undefined);
      }).toThrow('The Storage not exists (is destroy called before?).');
    });

    it('should validate the storage', () => {
      const contextBase = new Context({ name: 'MyApp' });

      expect(contextBase.check(storage)).toBeUndefined();
    });

    it('should invalidate the checkParams store', () => {
      const contextBase = new Context({ name: 'MyApp' });
      const options: any = { store: 'X' };


      expect(() => {
        contextBase.check(storage, options);
      }).toThrow('The Store is an invalid type.');
    });

    it('should validate the checkParams store', () => {
      const contextBase = new Context({ name: 'MyApp' });


      expect(contextBase.check(storage, { store: { key: 'value' } })).toBeUndefined();
    });
  });

  describe('#preset', () => {
    it('should return a void object', () => {
      const contextBase = new Context({ name: 'MyApp' });

      expect(contextBase.preset({})).toMatchObject({});
    });

    it('should return an object with correlationId', () => {
      const contextBase = new Context({
        name: 'MyApp',
        options: { correlationId: { enable: true } }
      });

      expect((contextBase.preset({}).correlationId || '').length).toBe(36);
    });


    it('should return an object with correlationId from valuePath', () => {
      const contextBase = new Context({
        name: 'MyApp',
        options: { correlationId: { enable: true, valuePath: 'headers.c-id' } }
      });
      const params = { req: { headers: { 'c-id': 123 } }, res: {} };

      expect(contextBase.preset(params).correlationId).toBe(123);
    });

    it('should return an object with exactly correlationId', () => {
      const correlationId = uuid();
      const contextBase = new Context({
        name: 'MyApp',
        options: { correlationId: { enable: true } }
      });
      const params = { req: { correlationId }, res: {} };

      expect((contextBase.preset(params))).toMatchObject({ correlationId, trackingFlowId: undefined });
    });

    it('should not return an object with trackingFlowId', () => {
      const contextBase = new Context({
        name: 'MyApp',
        options: { trackingFlowId: { enable: true } }
      });

      expect(contextBase.preset({}).trackingFlowId).toBeUndefined();
    });

    it('should return an object with trackingFlowId from valuePath', () => {
      const contextBase = new Context({
        name: 'MyApp',
        options: { trackingFlowId: { enable: true, valuePath: 'tfId' } }
      });
      const params = { req: { tfId: 123 }, res: {} };

      expect(contextBase.preset(params).trackingFlowId).toBe(123);
    });

    it('should return an object with exactly trackingFlowId', () => {
      const trackingFlowId = uuid();
      const contextBase = new Context({
        name: 'MyApp',
        options: { trackingFlowId: { enable: true } }
      });
      const params = { req: { trackingFlowId }, res: {} };

      expect((contextBase.preset(params))).toMatchObject({ correlationId: undefined, trackingFlowId });
    });
  });
});
