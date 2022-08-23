const cls = require('@eliabecardoso/cls-hooked');
const ns = cls.createNamespace('test');
const fs = require('fs');

const convertToMB = (val) => {
  return Math.round(val / 1024 / 1024 * 100) / 100
}

async function processing(qtty) {
  const memInit = process.memoryUsage();
  for (let index = 0; index < qtty; index++) {
    await ns.runPromise(async () => {
      ns.set(`foo_${index}`, `bar_${index}`);
    });

    await ns.runPromise(async () => {
      ns.set('foo', 'bar');
      
      const val = ns.get('foo')
      console.log('#1', val);

      await ns.runPromise(async () => {
        const val = ns.get('foo');
        console.log('#2', val);

        ns.set('foo', 'foo');
        const valChanged = ns.get('foo');
        console.log('#3', valChanged);
      });

      const valNotChanged = ns.get('foo');
      console.log('#4', valNotChanged);
    });
  }
  const memEnd = process.memoryUsage();

  // console.log(convertToMB(memInit.rss), convertToMB(memEnd.rss))
  // console.log((convertToMB(memEnd.rss) - convertToMB(memInit.rss)).toFixed(2))

  const data = `\n${qtty},${convertToMB(memInit.heapUsed)},${convertToMB(memEnd.heapUsed)},${convertToMB(memInit.rss)},${convertToMB(memEnd.rss)}`;

  fs.appendFile('./test/performance/memory.csv', data, { flag: 'a', encoding: 'utf8' }, () => {});
}

(async () => {
  const qtties = [100, 1000, 10000, 100000, 1000000];

  for (const qtty of qtties) {
    await processing(qtty);
  }
})();
