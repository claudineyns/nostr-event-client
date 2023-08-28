const { createClient } = require('redis');

const redishost = process.env.REDIS_HOST;
const redispass = process.env.REDIS_PASS;

const open = () => createClient({ url: `redis://default:${redispass}@${redishost}:6379` });

const db = {
  fetchActiveEvents
};

// module.exports = db;

fetchActiveEvents();

async function fetchActiveEvents() {
  const client = await open();
  await client.connect();

  const events = fetchList(client, 'event');

  print(events);
}


async function fetchList(redis, cache) {
  const ids = await redis.sMembers(cache+'List');

  const list = [];
  ids.forEach( async id => (await redis.get(cache+'#'+id)).forEach( event => list.push(JSON.parse(event)) ) );

  return list;
}
