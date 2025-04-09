const { secp256k1, getPublicKey } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8Tobytes } = require("ethereum-cryptography/utils");
const { toHex } = require("ethereum-cryptography/utils");
const fs = require("fs");

// const privatekey = secp256k1.utils.randomPrivateKey();
// console.log("privatekey: ", toHex(privatekey));
// const publicKey = secp256k1.getPublicKey(privatekey);
// console.log("publicKey: ", toHex(publicKey));

const generateAddress = (limit) => {
  let address = {};

  for (let i = 0; i < limit; i++) {
    const privatekey = secp256k1.utils.randomPrivateKey();
    const publicKey = getPublicKey(privatekey);
    const address = toHex(publicKey.slice(1).slice(-20));
    address[address] = Math.floor(Math.random() * 100);
  }
  return address;
};

async function storeAddressInFile() {
  fs.writeFileSync(
    "../address.json",
    JSON.stringify(generateAddress(3)),
    "utf8",
  );
}

storeAddressInFile();
