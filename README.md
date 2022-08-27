# cls-context-wrapper
cls-tests-passed.png
---
### Continuous-Local-Storage Context Wrapper.

This is a Wrapper of the [cls-hooked library (included fixes!)](https://www.npmjs.com/package/@eliabecardoso/cls-hooked)

The ContextWrapper class is a singleton instance of the Context class that use the cls-hooked as your own asynchooks.

This wrap is an easy plugin for http libraries (middleware use) and other types of nodejs uses, like service jobs, lambdas and various types of projects.

Example:
```ts
// App
import * as http from 'http';
import * as express from 'express';
import authentication from './middlewares/authentication';
import ContextWrapper from '@eliabecardoso/cls-context-wrapper';

const app = express();

app.use(ContextWrapper.middleware);

app.use(authentication);

app.use((req, res, next) => {
  ContextWrapper.setUserSession(req.user || { id: 1, user: 'ecardoso' });
  ContextWrapper.set('corporation', 'EHSC');

  const instance = ContextWrapper.getInstance();
  if (instance) instance.set('foo', 'bar');

  next();
});

app.get('/test', (_, res) => {
  res.json({
    reqId: ContextWrapper.getRequestId(),
    user: ContextWrapper.getUserSession(),
    corporation: ContextWrapper.get('corporation'),
    foo: ContextWrapper.getInstance().get('foo')
  });
});

const server = app.listen(8000, () => {
  ContextWrapper.getInstance({ name: 'MyApp', options: { requestId: { enable: true } } });
});

// Request
http.get('http://localhost:8000/test', (res) => {
  server.close();
  let data: string = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('error', (err) => {
    console.error('error:', err);
  });
  
  res.on('close', () => {
    console.log('data:', JSON.parse(data));
  });
});
```
In case you has a particular architecture or problem to solve, you can:
```js
const ContextWrapper = require('@eliabecardoso/cls-context-wrapper');

// Sync
(() => {
  const instance = ContextWrapper.getInstance({ name: 'MyApp' });

  instance.run((namespace) => {
    ContextWrapper.set('foo', 'bar');
    // or
    instance.set('foo', 'bar');

    // some inner function...
    function doSomething() {
      console.log(ContextWrapper.get('foo'));
    }

    doSomething(); // print "bar"
  });

  // or
  const result = instance.runAndReturn((namespace) => {
    ContextWrapper.set('foo', 'bar');
    // or
    instance.set('foo', 'bar');

    // some inner function...
    function doSomething() {
      return ContextWrapper.get('foo');
    }

    return doSomething(); // print "bar"
  });

  // Warning - Inner Contexts!!!
  const result = instance.run((namespace) => {
    ContextWrapper.set('foo', 'bar');
    // or
    instance.set('foo', 'bar');

    instance.run(() => {
      // some inner function...
      function doSomething() {
        console.log(ContextWrapper.get('foo'));
      }

      doSomething(); // print "undefined"
    });
  });
})();

// Async
(() => {
    const instance = ContextWrapper.getInstance({ name: 'MyApp' });
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    instance.runPromise(async (namespace) => {
      console.time('test');
      await sleep(10000);
      console.timeEnd('test');
    });
})();
```
---
### Methods
