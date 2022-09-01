const fs = require('fs');

if (!fs.existsSync('lib')) throw new Error('run "npm run build" first.');

const { default: ContextWrapper } = require('../lib');

// Sync
(() => {
  const instance = ContextWrapper.getInstance({ name: 'MyApp' });

  instance.run(() => {
    ContextWrapper.set({ foo: 'bar' });
    // or
    instance.set({ foo: 'bar' });

    // some inner function...
    function doSomething() {
      console.log(ContextWrapper.get('foo'));
    }

    doSomething(); // print "bar"
  });

  // Warning - Inner Contexts!!!
  instance.run(() => {
    ContextWrapper.set({ foo: 'bar' });
    // or
    instance.set({ foo: 'bar' });

    instance.run(() => {
      ContextWrapper.set({ john: 'doe' });
      // some inner function...
      function doSomething() {
        console.log(ContextWrapper.get('foo'));
      }

      doSomething(); // print "bar"
      console.log(ContextWrapper.get('john')); // print "doe"
    });

    console.log(ContextWrapper.get('john')); // print "undefined"
  });
})();

// Async
(() => {
    const instance = ContextWrapper.getInstance({ name: 'MyApp' });
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    instance.runPromise(async () => {

      ContextWrapper.set({ start: new Date() });
      await sleep(7000);
      const end = new Date();

      console.log('response time (ms):', Math.abs(end - ContextWrapper.get('start'))); // print "response time (ms): 700*"
    });
})();
