import * as http from 'http';
import * as express from 'express';
import ContextWrapper from '../../src/ContextWrapper';

const app = express();

const instanceParams = {
  name: 'TestApp',
  options: { requestId: { enable: true } },
};

describe('express', () => {
  it('should use ContextWrapper as middleware', (done) => {
    app.use(ContextWrapper.middleware);

    app.get('/test', (_, res) => {
      res.send(ContextWrapper.getRequestId());
    });

    const server = app.listen(8000, () => {
      ContextWrapper.getInstance({ ...instanceParams });
    })

    http.get('http://localhost:8000/test', (res) => {
      server.close();

      res.on('data', (chunk) => {
       try {
        expect(chunk.toString().length).toBe(36);
       } catch (err) {
        done(err);
       }
      });
      
      res.on('close', () => {
        done();
      });
    });
  });
});
