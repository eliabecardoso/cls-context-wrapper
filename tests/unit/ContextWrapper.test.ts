import * as EventEmitter from 'events';
import { v4 as uuid } from 'uuid';
import Context from '../../src/context/Context';
import ContextWrapper from '../../src/context/ContextWrapper';
import { InstanceParams } from '../../src/context/IContextStrategy';

const instanceParams: InstanceParams = {
  name: 'TestApp',
};

describe('ContextWrapper', () => {
  beforeEach(() => {
    ContextWrapper.destroy();
  });

  it('should create the instance of Context class', () => {
    const instance = ContextWrapper.getInstance({ ...instanceParams });

    expect(instance).toBeInstanceOf(Context);
  });

  it('should create the instance of Context class (using default config)', () => {
    const instance = ContextWrapper.getInstance();

    expect(instance).toBeInstanceOf(Context);
  });

  it('should destroy the instance of Context class', () => {
    const instance = ContextWrapper.getInstance({ ...instanceParams });
    ContextWrapper.destroy();

    expect(() => {
      instance.set({ prop: 'value' });
    }).toThrow('The Storage not exists (is destroy called before?).');
  });

  it('should set a value in the Context instance', (done) => {
    const instance = ContextWrapper.getInstance({ ...instanceParams });

    instance.run(() => {
      try {
        instance.set({ prop: 'value' })

        expect(instance.get('prop')).toBe('value');

        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('should get a value in the Context instance', (done) => {
    const instance = ContextWrapper.getInstance({ ...instanceParams });

    instance.run(() => {
      try {
        instance.set({ prop: 'anything' });

        expect(instance.get('prop')).toBe('anything');

        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('should static set a value in the Context instance', (done) => {
    const instance = ContextWrapper.getInstance({ ...instanceParams });

    instance.run(() => {
      try {
        ContextWrapper.set({ 'prop': 'value' });
        expect(ContextWrapper.get('prop')).toBe('value');

        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('should static get a value in the Context instance', (done) => {
    const instance = ContextWrapper.getInstance({ ...instanceParams });

    instance.run(() => {
      try {
        ContextWrapper.set({ prop: 'anything' });

        expect(ContextWrapper.get('prop')).toBe('anything');

        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('should get the correlationId in the Context instance', (done) => {
    const instance = ContextWrapper.getInstance({ ...instanceParams });

    const middleware = () => {
      ContextWrapper.setCorrelationId(uuid());
    };

    const someMethod = () => {
      expect(ContextWrapper.getCorrelationId()?.toString().length).toBe(36);
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

  it('should get the trackingFlowId in the Context instance', (done) => {
    const instance = ContextWrapper.getInstance({ ...instanceParams });

    const middleware = () => {
      ContextWrapper.setTrackingFlowId(uuid());
    };

    const someMethod = () => {
      expect(ContextWrapper.getTrackingFlowId()?.toString().length).toBe(36);
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
    const instance = ContextWrapper.getInstance({ ...instanceParams });

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
    const next = () => {
      try {
        expect(ContextWrapper.getCorrelationId()?.toString().length).toBe(36);

        done();
      } catch (err) {
       done(err); 
      }
    };

    ContextWrapper.getInstance({ ...instanceParams });

    ContextWrapper.middleware(req, res, next);
  });

  it('should call middleware method without throw error (koa like)', (done) => {
    const req = new EventEmitter();
    const res = new EventEmitter();
    const next = () => {
      try {
        const correlationId = ContextWrapper.getCorrelationId();
        expect(correlationId?.toString().length).toBe(36);

        done();
      } catch (err) {
       done(err); 
      }
    };

    ContextWrapper.getInstance();

    ContextWrapper.middleware({ req, res }, next);
  });
});
