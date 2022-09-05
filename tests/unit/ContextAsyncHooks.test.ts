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

  it('should destroy the context storage', () => {
    context = new ContextAsyncHooks({ ...instanceParams });
    context.destroy();

    expect(context.storage).toBe(undefined);
  });

  describe('#run', () => {
    it('should set a value in store', () => {
      context = new ContextAsyncHooks({ ...instanceParams });
  
      context.run(() => {
        expect(context.set({ key: 'value' })).toBe(undefined);
        expect(context.get('key')).toBe('value');
      });
    });
  
    it('should get a value from store', () => {
      context = new ContextAsyncHooks({ ...instanceParams });
      
      context.run(() => {
        context.set({ key: 'value' });
  
        expect(context.get('key')).toBe('value');
      });
    });

    it('should get whole value from store', () => {
      context = new ContextAsyncHooks({ ...instanceParams });
      
      context.run(() => {
        context.set({ key: 'value' });
  
        expect(context.get()).toMatchObject({ key: 'value' });
      });
    });
  });

  describe('#runPromise', () => {
    it('should set a value in store', (done) => {
      context = new ContextAsyncHooks({ ...instanceParams });
  
      context.runPromise(async () => {
        expect(context.set({ key: 'value' })).toBe(undefined);
        expect(context.get('key')).toBe('value');

        done();
      });

    });
  
    it('should get a value from store', (done) => {
      context = new ContextAsyncHooks({ ...instanceParams });
      
      context.runPromise(async () => {
        context.set({ key: 'value' });
  
        expect(context.get('key')).toBe('value');

        done();
      });
    });

    it('should get whole value from store', (done) => {
      context = new ContextAsyncHooks({ ...instanceParams });
      
      context.runPromise(async () => {
        context.set({ key: 'value' });
  
       try {
        expect(context.get()).toMatchObject({ key: 'value' });
        
        done();
       } catch (error) {
        done(error);
       }
      });
    });

    it('should set a value in store (option 2)', (done) => {
      context = new ContextAsyncHooks({ ...instanceParams });
  
      context.runPromise({}, async () => {
        expect(context.set({ key: 'value' })).toBe(undefined);
        expect(context.get('key')).toBe('value');

        done();
      });

    });
  
    it('should get a value from store (option 2)', (done) => {
      context = new ContextAsyncHooks({ ...instanceParams });
      
      context.runPromise({}, async () => {
        context.set({ key: 'value' });
  
        expect(context.get('key')).toBe('value');

        done();
      });
    });

    it('should get whole value from store (option 2)', (done) => {
      context = new ContextAsyncHooks({ ...instanceParams });
      
      context.runPromise({}, async () => {
        context.set({ key: 'value' });
  
       try {
        expect(context.get()).toMatchObject({ key: 'value' });
        
        done();
       } catch (error) {
        done(error);
       }
      });
    });
  });

  describe('#use', () => {
    it('should create a context that can be used by all inner closures', () => {
      context = new ContextAsyncHooks({ ...instanceParams, options: { correlationId: { enable: true }}});

      const req = new EventEmitter();
      const res = new EventEmitter();
      const next = () => {
        expect((context.get('correlationId')).length).toBe(36);
      };

      context.use(req, res, next);
    });

    it('should throw an error', () => {
      context = new ContextAsyncHooks({ ...instanceParams, options: { correlationId: { enable: true }}});

      const req: any = '';
      const res = new EventEmitter();
      const next = () => {
        throw new Error('some error');
      };

      expect(() => {
        context.use(req, res, next);
      }).toThrow('some error');
    });
  });
});
