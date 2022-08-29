const { AsyncLocalStorage } = require('async_hooks');
const fs = require('fs');

const convertToMB = (val) => {
  return Math.round(val / 1024 / 1024 * 100) / 100
}

(async () => {

  async function test() {
    const store = new AsyncLocalStorage();

    console.log('#1:', store.getStore());

    store.enterWith({ id: 1 });

    console.log('#2:', store.getStore());

    store.run({ ...store.getStore(), name: 'name' }, () => {
      console.log('#3:', store.getStore());

      store.run({ ...store.getStore() }, () => {
        store.enterWith({ ...store.getStore(), user: 'user' });

        console.log('#4:', store.getStore());
      });

      store.enterWith({ ...store.getStore(), email: 'user@user.com' });

      console.log('#5:', store.getStore());
    });

    console.log('#6:', store.getStore());

    await new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('#7:', store.getStore());
        resolve();
      }, 3000);
   });
  }

  await test();
  const store2 = new AsyncLocalStorage();
  console.log('#8:', store2.getStore());
})();
