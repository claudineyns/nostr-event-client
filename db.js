const { createClient } = require('redis');

const redishost = process.env.REDIS_HOST;
const redispass = process.env.REDIS_PASS;

const open = async () => createClient({ url: `redis://default:${redispass}@${redishost}:6379` });

const db = {
  fetchActiveEvents
};

module.exports = db;

async function fetchActiveEvents() {
  const client = await open();
  await client.connect();

  const events       = await fetchList(client, 'event');
  const replaceables = await fetchList(client, 'replaceable');
  const parameters   = await fetchList(client, 'parameter');

  await client.disconnect();

  return events.concat(replaceables).concat(parameters).sort( (a, b) => b.created_at - a.created_at );
}


async function fetchList(redis, cache) {
  const ids = await redis.sMembers(cache+'List');

  const list = [];
  for(let id of ids) {
    const event = await redis.get(cache+'#'+id);
    if(event != null) list.push(JSON.parse(event));
  }

  return list;
}
