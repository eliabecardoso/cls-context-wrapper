import * as EventEmitter from 'events';
import * as uuid from 'uuid';
import Context from '../../src/Context';
import ContextWrapper from '../../src/ContextWrapper';

const instanceParams = {
  name: 'TestApp',
  options: {}
};

describe('ContextWrapper', () => {
  beforeEach(() => {
    ContextWrapper.destroy();
  });

  it('should create the instance of Context class', () => {
    const instance: Context = ContextWrapper.getInstance({ ...instanceParams });

    expect(instance).toBeInstanceOf(Context);
  });

  it('should destroy the instance of Context class', () => {
    const instance: Context = ContextWrapper.getInstance({ ...instanceParams });
    ContextWrapper.destroy();

    expect(instance.set('prop', 'value')).toBe(false);
  });

  it('should set a value in the Context instance', (done) => {
    const instance: Context = ContextWrapper.getInstance({ ...instanceParams });

    instance.run(() => {
      try {
        expect(instance.set('prop', 'value')).toBe(true);

        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('should get a value in the Context instance', (done) => {
    const instance: Context = ContextWrapper.getInstance({ ...instanceParams });

    instance.run(() => {
      try {
        instance.set('prop', 'anything')

        expect(instance.get('prop')).toBe('anything');

        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('should get the requestId in the Context instance', (done) => {
    const instance: Context = ContextWrapper.getInstance({ ...instanceParams });

    const middleware = () => {
      ContextWrapper.setRequestId(uuid.v4());
    };

    const someMethod = () => {
      expect(ContextWrapper.getRequestId().length).toBe(36);
    };
    
    instance.run(() => {
      try {
        middleware();
        someMethod();

        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('should get the userSession in the Context instance', (done) => {
    const instance: Context = ContextWrapper.getInstance({ ...instanceParams });

    const authorization = () => {
      ContextWrapper.setUserSession({ id: 1, user: 'eliabecardoso' });
    };

    const someMethod = async () => {
      await (new Promise(resolve => setTimeout(resolve, 1)));

      const user = ContextWrapper.getUserSession();
      expect(user).toMatchObject({ id: 1, user: 'eliabecardoso' });
    };
    
    instance.runPromise(async () => {
      try {
        authorization();
        await someMethod();

        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('should call middleware method without throw error (express like)', (done) => {
    const req = new EventEmitter();
    const res = new EventEmitter();
    const next = (cb?: Function) => {
      try {
        expect(ContextWrapper.getRequestId().length).toBe(36);

        if (cb) cb();

        done();
      } catch (err) {
       done(err); 
      }
    };

    ContextWrapper.getInstance({ ...instanceParams, options: { requestId: { enable: true } } });

    ContextWrapper.middleware(req, res, next);
  });

  it('should call middleware method without throw error (koa like)', (done) => {
    const req = new EventEmitter();
    const res = new EventEmitter();
    const next = (cb?: Function) => {
      try {
        expect(ContextWrapper.getRequestId().length).toBe(36);

        if (cb) cb();

        done();
      } catch (err) {
       done(err); 
      }
    };

    ContextWrapper.getInstance({ ...instanceParams, options: { requestId: { enable: true } } });

    ContextWrapper.middleware({ req, res }, next);
  });
});
