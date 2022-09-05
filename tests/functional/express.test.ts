import * as http from 'http';
import * as express from 'express';
import { v4 as uuid } from 'uuid';
import ContextWrapper from '../../src/context/ContextWrapper';
import { InstanceParams } from '../../src/context/IContextStrategy';

const app = express();
let server: http.Server;

const instanceParams: InstanceParams = {
  name: 'TestApp',
  options: { correlationId: { enable: true }, trackingFlowId: { enable: true } },
};

const CORRELATION_ID = 'correlation-id';
const TRACKING_FLOW_ID = 'tracking-flow-id';

const endpoint = 'http://localhost:9999/test';

describe('express', () => {
  beforeAll(() => {
    app.use(ContextWrapper.middleware);
    app.use((err: any, req: any, res: any, next: () => void) => {
      res.json(err);
    });

    app.use((_, __, next) => {
      try {
        ContextWrapper.setUserSession({ id: 1, user: 'ecardoso' }); // req.user
        ContextWrapper.set({ corporation: 'EHSC' });
      
        const instance = ContextWrapper.getInstance();
        if (instance) instance.set({ foo: 'bar' });

        next();
      } catch (err) {
        next(err);
      }
    });
    
    app.get('/test', (_, res) => {
      const result = {
        user: ContextWrapper.getUserSession(),
        corporation: ContextWrapper.get('corporation'),
        foo: ContextWrapper.getInstance().get('foo')
      };

      res.status(200).json(result);
    });

    server = app.listen(9999, () => {
      ContextWrapper.getInstance({ ...instanceParams });
    });
  });

  afterAll(() => {
    server.close();
  });

  it('should request with ContextWrapper middleware setup', (done) => {
    const client = http.get(endpoint, (res) => {
      let data: string = '';
      
      res.on('error', (err) => {  done(err); });

      res.on('data', (chunk) => {
        try {
          data += chunk;
        } catch (err) {
         done(err);
        }
      });

      
      res.on('close', () => {
        client.end();

        try {
          const result = JSON.parse(data) || {};

          expect(res.statusCode).toBe(200);
          expect((res.headers[CORRELATION_ID] || '').length).toBe(36);
          expect((res.headers[TRACKING_FLOW_ID] || '').length).toBe(36);
          expect(result.user).toMatchObject({ id: 1, user: 'ecardoso' });
          expect(result.corporation).toBe('EHSC');
          expect(result.foo).toBe('bar');

          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('should request passing Correlation-ID header', (done) => {
    const correlationId = uuid();

    const client = http.get(endpoint,
      { headers: { [CORRELATION_ID]: correlationId,  } },
      (res) => {
        res.on('error', (err) => { done(err); });
        res.on('data', (_) => {});
        
        res.on('close', () => {
          client.destroy();

          try {
            expect(res.statusCode).toBe(200);
            expect(res.headers[CORRELATION_ID]).toBe(correlationId);

            done();
          } catch (err) {
            done(err);
          }
        });
    });
  });

  it('should request passing Tracking-Flow-ID header', (done) => {
    const trackingFlowId = uuid();

    const client = http.get(endpoint,
      { headers: { [TRACKING_FLOW_ID]: trackingFlowId,  } },
      (res) => {
        res.on('error', (err) => { done(err); });
        res.on('data', (_) => {});
        
        res.on('close', () => {
          client.destroy();

          try {
            expect(res.statusCode).toBe(200);
            expect(res.headers[TRACKING_FLOW_ID]).toBe(trackingFlowId);

            done();
          } catch (err) {
            done(err);
          }
        });
    });
  });
});
