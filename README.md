# cls-context-wrapper (Typescript)
[![Build Status](https://api.travis-ci.com/eliabecardoso/cls-context-wrapper.svg?branch=main)](https://app.travis-ci.com/github/eliabecardoso/cls-context-wrapper)

---
### Continuous-Local-Storage Context Wrapper.

This is a Wrapper of the [cls-hooked library (included fixes!)](https://www.npmjs.com/package/@eliabecardoso/cls-hooked)

The ContextWrapper class is a singleton instance of the Context class that uses cls-hooked as its own asynchooks.

This wrap is an easy plugin for http libraries (middleware use) and other types of nodejs uses, like service jobs, lambdas and different types of projects.

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

<br />

If you have a specific architecture or problem to solve, you can:
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

Note: Context class is also available to use in a particular case.

---
### Methods

- `static getInstance(params?: { name: string; options: defaultObj }): Context`: use to create an singleton instance or get the created instance (params is optional, but it is recommended to pass).
  - `params?.name: string`: name of the instance namespace context.
  - `params?.options?: object`: options.
  - `params?.options?.requestId?: object`: requestId config.
  - `params?.options?.requestId?.enable: boolean`: to enable requestId auto set. Default: true (if not passed params in the getInstance method in instance).
  - `params?.options?.requestId?.valuePath: string?`: the path if a requestId already exists in the `req` middleware param, e.g.: 'reqId' or 'headers.reqId'. (only available if middleware method is used). If the valuePath is not passed, the `middleware` method will try to fetch from `headers['x-request-id']`or `requestId` (respectively). Default value: uuid.v4.

<br />

- `static destroy(): void`: whenever you are going to delete, remove or no longer use the Instance, call destroy to remove the created namespace context. If `getInstance` is called after `destroy`, will be created a new instance.

<br />

- `static set(key: string, value: any): boolean | undefined`: set a key/value on the namespace context.

<br />

- `static get(key: string): any | undefined`: retrieve a value previously recorded.

<br />

- `static setRequestId(value: string | number): boolean | undefined`: set manually the requestId.

<br />

- `static getRequestId(): string | number | undefined`: get requestId value 

<br />

- `static setUserSession(value: defaultObj | any): boolean | undefined` 
: set authenticated user from the request.

<br />

- `static getUserSession(): defaultObj | any | undefined`: get authenticated user from the request.

<br />

- `middleware(...args: any[]): void`: middleware (app.use(middleware)). Also available for koa like (ctx, next).

---

For contact, feel free to email me: eliabe.hc@gmail.com.

ps: sorry for any english mistakes. :)

Enjoy it!
