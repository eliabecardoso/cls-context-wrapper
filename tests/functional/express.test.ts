import * as http from 'http';
import * as express from 'express';
import ContextWrapper from '../../src/context/ContextWrapper';
import { InstanceParams } from '../../src/context/IContextStrategy';

const app = express();

const instanceParams: InstanceParams = {
  name: 'TestApp',
  options: { correlationId: { enable: true } },
};

describe('express', () => {
  beforeAll(() => { jest.setTimeout(1000000)})
  it('should use ContextWrapper as middleware', (done) => {
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
        reqId: ContextWrapper.getCorrelationId(),
        user: ContextWrapper.getUserSession(),
        corporation: ContextWrapper.get('corporation'),
        foo: ContextWrapper.getInstance().get('foo')
      };

      res.status(200).json(result);
    });

    const server = app.listen(9999, () => {
      ContextWrapper.getInstance({ ...instanceParams });
    })

    const client = http.get('http://localhost:9999/test', (res) => {
      server.close();
      let data: string = '';

      res.on('data', (chunk) => {
        try {
          data += chunk;
        } catch (err) {
         done(err);
        }
      });

      res.on('error', (err) => {
        done(err);
      })
      
      res.on('close', () => {
        client.destroy();

        try {
          const result = JSON.parse(data) || {};

          expect(res.statusCode).toBe(200);
          expect(result.reqId.length).toBe(36);
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
});
