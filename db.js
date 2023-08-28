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

  const events = await fetchList(client, 'event');

  console.log(events);
}


async function fetchList(redis, cache) {
  const ids = await redis.sMembers(cache+'List');
  console.log('ids', ids);

  return ids.map( async id => JSON.parse(await redis.get(cache+'#'+id)) );
}
