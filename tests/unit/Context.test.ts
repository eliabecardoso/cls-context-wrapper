import * as EventEmitter from 'events';
import Context from '../../src/Context';

const instanceParams = {
  name: 'TestApp',
  options: {}
};

let context: Context;

describe('Context', () => {
  beforeEach(() => {
    if (context) context.destroyNamespace();
  });

  it('should valid a instance of the Context class', () => {
    context = new Context({ ...instanceParams });
    expect(context).toBeInstanceOf(Context);
    expect(context.name).toBe(instanceParams.name);
    expect(context.options).toMatchObject(instanceParams.options);
  });

  it('should valid a context is active', () => {
    context = new Context({ ...instanceParams });
    expect(context.isNamespaceActive()).toBe(true);
  });

  it('should destroy a namespace context', () => {
    context = new Context({ ...instanceParams });
    context.destroyNamespace();

    expect(context.isNamespaceActive()).toBe(false);
  });

  describe('#run', () => {
    it('should set a value in context namespace', () => {
      context = new Context({ ...instanceParams });
  
      context.run(() => {
        expect(context.set('key', 'value')).toBe(true);
      });
    });
  
    it('should get a value in context namespace', () => {
      context = new Context({ ...instanceParams });
      
      context.run(() => {
        context.set('key', 'sample');
  
        expect(context.get('key')).toBe('sample');
      });
    });
  });

  describe('#runAndReturn', () => {
    it('should set a value in context namespace', () => {
      context = new Context({ ...instanceParams });
  
      context.runAndReturn(() => {
        expect(context.set('key', 'value')).toBe(true);
      });
    });
  
    it('should get a value in context namespace', () => {
      context = new Context({ ...instanceParams });
      
      context.runAndReturn(() => {
        context.set('key', 'sample');
  
        expect(context.get('key')).toBe('sample');
      });
    });
  });

  describe('#runPromise', () => {
    it('should set a value in context namespace', async () => {
      context = new Context({ ...instanceParams });
  
      await context.runPromise(async () => {
        expect(context.set('key', 'value')).toBe(true);
      });

    });
  
    it('should get a value in context namespace', async () => {
      context = new Context({ ...instanceParams });
      
      await context.runPromise(async () => {
        context.set('key', 'sample');
  
        expect(context.get('key')).toBe('sample');
      });
    });
  });

  describe('#use', () => {
    it('should create a context that can be used by all inner closures', (done: Function) => {
      context = new Context({ ...instanceParams, options: { requestId: { enable: true }}});

      const req = new EventEmitter();
      const res = new EventEmitter();
      const next = (cb?: Function) => {
        try {
          expect((context.get('requestId')).length).toBe(36);
  
          if (cb) cb();
  
          done();
        } catch (err) {
          done(err);
        }
       
      };

      context.use(req, res, next);
    });
  });
});
