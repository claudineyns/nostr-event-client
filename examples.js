const { randomBytes, createHash } = require('crypto')
const secp256k1                   = require('secp256k1')
const { bech32, bech32m }         = require('bech32')

// or require('secp256k1/elliptic')
//   if you want to use pure js implementation in node

console.log('Finding some privkey');

//const keypair = keypair_from_private('<key>');
const keypair = gen_keypair();
console.log('compressed\n',keypair.compressed);
console.log('bech32\n',keypair.bech32);

function gen_keypair() {
  let privKey;
  do {
    privKey = randomBytes(32)
  } while (!secp256k1.privateKeyVerify(privKey))

  return keypair_from_private(privKey);
}

function keypair_from_private(priv) {
  let privHex;
  let privKey;

  if( typeof(priv) === 'string' ) {
    privHex = priv;
    privKey = Buffer.from(privHex, 'hex');
  } else {
    privKey = priv;
    privHex = privKey.toString('hex');
  }

  // get the private key in hex format
  //console.log(`privKey: ${privHex}`);

  // get the public key in a compressed format
  const pubKey = secp256k1.publicKeyCreate(privKey)
  const pubHex = Buffer.from(pubKey).toString('hex').substring(2)

  const pbq = bech32.toWords(Buffer.from(pubHex, 'hex'));
  const pbk = bech32.encode('npub', pbq);

  const pvq = bech32.toWords(Buffer.from(privHex, 'hex'));
  const pvk = bech32.encode('nsec', pvq);

  return {
    privKey,
    pubKey,
    compressed: {
      privKey: privHex,
      pubKey: pubHex
    },
    bech32: {
      privKey: pvk,
      pubKey:  pbk
    }
  };
}

function signAndCheck() {
  // generate message to sign message should have 32-byte length, if you have some other length you can hash message for example `msg = sha256(rawMessage)`
  const msg = randomBytes(32)

  const keypair = gen_keypair()

  // sign the message
  const sigObj = secp256k1.ecdsaSign(msg, keypair.privKey)

  // verify the signature
  console.log(secp256k1.ecdsaVerify(sigObj.signature, msg, keypair.pubKey))
  // => true
}
