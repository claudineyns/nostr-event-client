const { createClient } = require('redis');

const redishost = process.env.REDIS_HOST;
const redispass = process.env.REDIS_PASS;

const open = async () => createClient({ url: `redis://default:${redispass}@${redishost}:6379` });

const db = {
  fetchActiveEvents
};

// module.exports = db;

fetchActiveEvents();

async function fetchActiveEvents() {
  const client = await open();
  await client.connect();

  const events     = await fetchList(client, 'event');
  const profiles   = await fetchList(client, 'profile');
  const contacts   = await fetchList(client, 'contact');
  const parameters = await fetchList(client, 'parameter');

  await client.disconnect();

  const list = events.concat(profiles).concat(contacts).concat(parameters);

  console.log(list);
}


async function fetchList(redis, cache) {
  const ids = await redis.sMembers(cache+'List');

  const list = [];
  for(let id of ids) {
    const event = await redis.get(cache+'#'+id);
    list.push(JSON.parse(event));
  }

  return list;
}
