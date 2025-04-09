const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

// privatekey1 = 9ed7073f58291e209ee9dcb2c17a0a3465a2d8df3eeb78ea46186e4202c036a0
// privatekey2 = a109fc363aa8e0c5e3d9e6d44dd0e4265402b51fa0b1ab01221515d40e18af2d
// privatekey3 = 3983201befb29ceac14193c46024dbf4bff1cb08cd11e66a6b9c2054451b7274
// const balances = {
//   "02f1d581bd584bf7553fef20a85e0eeb4ba30b97d59fa5c5d26feeb5265483cb5d": 100,
//   "025b834d28a66703c230066ef4aa1f888d5e2d52c18d7bb860231ff30058b08cc2": 50,
//   "023215a9861c06de1c245d9bbdee2175bc52014e66652f2e3dcfb65af26f55b854": 75,
// };

const balances = JSON.parse(
  require("fs").readFileSync("./address.json", "utf8"),
);

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

const dataValidation = async (req, res, next) => {
  try {
    const { sender, recipient, amount } = req.body;
    if (!sender || !recipient || !amount) {
      res.status(400).send({ message: "Missing fields" });
    }
    const isValidBalance = +amount > 0 && +amount <= balances[sender];
    if (!isValidBalance) throw new Error("Not enough funds!");
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
  next();
};

app.post("/send", (req, res) => {
  const { messageHash, signedResponse, data } = req.body;
  const { amount, sender, recipient } = data;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const isValid = isValidSender(messageHash, signedResponse, sender);
  if (!isValid) {
    res.status(400).send({ message: "Invalid signature" });
  }

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

const isValidSender = (messageHash, signedResponse, sender) => {
  const publicKey = secp256k1.recoverPublicKey(
    messageHash,
    signature,
    signedResponse[1],
  );
  const signature = Uint8Array.from(Object.values(signedResponse[0]));
  const isSigned = secp256k1.verify(signature, messageHash, publicKey);

  const isValidSender =
    sender.toString() === getAddressFromPublicKey(publicKey);

  if (!isValidSender && isSigned) return false;
  return true;
};

const getAddressFromPublicKey = (pk) => {
  const walletAddress = utils.toHex(pk.slice(1).slice(-20));
  return walletAddress.toString();
};
