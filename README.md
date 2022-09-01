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
  ContextWrapper.getInstance({ name: 'MyApp', options: { correlationId: { enable: true } } });
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

  instance.run(() => {
    ContextWrapper.set('foo', 'bar');
    // or
    instance.set('foo', 'bar');

    // some inner function...
    function doSomething() {
      console.log(ContextWrapper.get('foo'));
    }

    doSomething(); // print "bar"
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

Note: The Context class is also available for use in other scenarios.

---
### ContextWrapper Methods

- `static getInstance(params?: { name: string; options: object }): IContextStrategy`: create a singleton instance.
  - `params?.name: string`: name of the instance context.
  - `params?.options?: object`: options.
  - `params?.options?.correlationId?: object`: correlationId config.
  - `params?.options?.correlationId?.enable: boolean`: to enable automatic set of correlationId in `middleware` method. Default: true (if not passed params in the getInstance method in instance).
  - `params?.options?.correlationId?.valuePath: string?`: the path if a correlationId already exists in the `req` middleware param, e.g.: 'reqId' or 'headers.reqId'. (only available if middleware method is used). If the valuePath is not passed, the `middleware` method will try to fetch from `headers['X-Correlation-ID']`, `headers['X-Request-ID']` or `requestId` (respectively). Default value: uuid.v4.

  - Returns an instance that implements the `IContextStrategy` interface, a super set of the [AsyncLocalStorage from node:async_hooks](https://nodejs.org/api/async_context.html#class-asynclocalstorage)(if the Node version is 14.20.0 or major) or [Namespace from cls-hooked lib](https://www.npmjs.com/package/@ehsc/cls-hooked).
  - `IContextStrategy` Methods:
    - `destroy(): void`: whenever you are going to delete, remove or no longer use the Instance, call destroy to remove the instance context. If `getInstance` is called after `destroy`, will be created a new instance.
    - `run(callback: (...args: any[]) => any): any`: Runs a function synchronously within a context and returns its return value. The storage is not accessible outside of the callback function. The store is accessible to any asynchronous operations created within the callback.
    - `runPromise(callback: (...args: any[]) => Promise<void>): void`: Runs a function synchronously within a context and returns its return value. The storage is not accessible outside of the callback function. The store is accessible to any asynchronous operations created within the async callback.
    - `set(store: { [prop: string]: any }): void`: set a value in the context.
    - `get(key?: string): any`: retrieve a value from the context, if key not passed, it retrieve whole object from the context.
    - `use(req: Request, res: Response, next: () => void): void`: Use like a middleware (express, koa, etc.).

<br />

- `static destroy(): void`: whenever you are going to delete, remove or no longer use the Instance, call destroy to remove the instance context. If `getInstance` is called after `destroy`, will be created a new instance.

<br />

- `static set(store: { [prop: string]: any }): void`: set a key value in the context.

<br />

- `static get(key?: string): any`: read a value previously recorded.

<br />

- `static setCorrelationId(value: string | number): void`: set the correlation identifier, like ContextWrapper.set({ correlationId: uuid.v4() }) ([see pattern](https://www.informit.com/articles/article.aspx?p=1398616&seqNum=6)).

<br />

- `static getCorrelationId(): string | number | undefined`: retrieve correlation identifier value, like ContextWrapper.get('correlationId').

<br />

- `static setUserSession(value: { [prop: string]: any } | any): void` : set user, like ContextWrapper.set({ user: {...} }).

<br />

- `static getUserSession(): { [prop: string]: any } | any`: get user, like ContextWrapper.get('user').

<br />

- `middleware(...args: any[]): void`: all of the middlewares and routes setup can set or read context values if it is called after this middleware, like [asyncLocalStorage.run](https://nodejs.org/api/async_context.html#asynclocalstoragerunstore-callback-args) and [Namespace.run](https://github.com/eliabecardoso/cls-hooked#namespaceruncallback).

<br />

Notes:
- `ContextWrapper.middleware` will only create a request context if `ContextWrapper.getInstance` is called before.
- Methods `set`, `get`, `set/get CorrelationId`, `set/get UserSession` only works if `instance.run`, `instance.runPromise` or `ContextWrapper.middleware` is called before.

---
### License

This project is distributed under the MIT license.

---

For contact, feel free to email me: eliabe.hc@gmail.com.

ps: sorry for any english mistakes. :)

Enjoy it!
