import * as EventEmitter from 'events';
import ContextAsyncHooks from '../../src/context/ContextAsyncHooks';

const instanceParams = {
  name: 'TestApp',
  options: {}
};

let context: ContextAsyncHooks;

describe('ContextAsyncHooks', () => {
  beforeEach(() => {
    if (context) context.destroy();
  });

  it('should valid an instance of the ContextAsyncHooks class', () => {
    context = new ContextAsyncHooks({ ...instanceParams });
    expect(context).toBeInstanceOf(ContextAsyncHooks);
    expect(context.name).toBe(instanceParams.name);
    expect(context.options).toMatchObject(instanceParams.options);
  });

  it('shouldnt create a new instance with same context name', () => {
    try {
      new ContextAsyncHooks({ ...instanceParams });
      new ContextAsyncHooks({ ...instanceParams });
    } catch (err: any) {
      expect(err.message).toBe('The context TestApp already exists. Operation not permitted.');
    }   
  });

  it('should destroy the storage context', () => {
    context = new ContextAsyncHooks({ ...instanceParams });
    context.destroy();

    expect(context.storage).toBe(undefined);
  });

  describe('#run', () => {
    it('should set a value in context namespace', () => {
      context = new ContextAsyncHooks({ ...instanceParams });
  
      context.run(() => {
        expect(context.set({ key: 'value' })).toBe(undefined);
        expect(context.get('key')).toBe('value');
      });
    });
  
    it('should get a value in context namespace', () => {
      context = new ContextAsyncHooks({ ...instanceParams });
      
      context.run(() => {
        context.set({ key: 'sample' });
  
        expect(context.get('key')).toBe('sample');
      });
    });
  });

  describe('#runPromise', () => {
    it('should set a value in context namespace', async () => {
      context = new ContextAsyncHooks({ ...instanceParams });
  
      await context.runPromise(async () => {
        expect(context.set({ key: 'value' })).toBe(undefined);
        expect(context.get('key')).toBe('value');
      });

    });
  
    it('should get a value in context namespace', async () => {
      context = new ContextAsyncHooks({ ...instanceParams });
      
      await context.runPromise(async () => {
        context.set({ key: 'sample' });
  
        expect(context.get('key')).toBe('sample');
      });
    });
  });

  describe('#use', () => {
    it('should create a context that can be used by all inner closures', (done: Function) => {
      context = new ContextAsyncHooks({ ...instanceParams, options: { correlationId: { enable: true }}});

      const req = new EventEmitter();
      const res = new EventEmitter();
      const next = () => {
        try {
          expect((context.get('correlationId')).length).toBe(36);
  
          done();
        } catch (err) {
          done(err);
        }
       
      };

      context.use(req, res, next);
    });
  });
});
