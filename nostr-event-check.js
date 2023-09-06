const { createHash } = require('node:crypto');
const process = require('node:process');

const Buffer     = require('safe-buffer').Buffer;
const BigInteger = require('bigi');
const schnorr    = require('bip-schnorr');

const event = Buffer.from(process.argv[2].replaceAll('-','+').replaceAll('_','/'), 'base64').toString('utf8')

const data = validate_event(JSON.parse(event));
console.log(JSON.stringify(data));

function validate_event(event) {

  const id = event.id;
  const event_id = create_event_id(event.pubkey, event.created_at, event.kind, event.tags, event.content);
  if(id !== event_id) return {'status':false, 'message': 'id not match'};

  const valid = check_sig(event.pubkey, event.id, event.sig);
  if(!valid) return {'status':false, 'message': 'signature not match'};

  return {'status':true, 'message':'OK'};
}

function check_sig(pubkey, event_id, sig) {

  const public_key = Buffer.from(pubkey, 'hex')
  const message    = Buffer.from(event_id, 'hex');
  const signature  = Buffer.from(sig, 'hex');

  try {
    schnorr.verify(public_key, message, signature);
    return true;
  } catch (e) {
    return false;
  }

}

function create_event_id(pubkey, created_at, kind, tags, content) {
    const hash = createHash('sha256');

    const event_data = JSON.stringify([0, pubkey, created_at, kind, tags, content]);
    hash.update(Buffer.from(event_data, 'utf8'));

    const event_id = hash.digest('hex');
    return event_id;
}
