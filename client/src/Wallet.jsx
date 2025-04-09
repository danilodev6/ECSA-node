import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const address = toHex(
      secp.secp256k1.getPublicKey(evt.target.value).slice(1).slice(-20),
    );
    setAddress(address);
    if (address) {
      console.log(address);
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Your privateKey
        <input
          placeholder="Type a privateKey, for example: 0x1"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>

      <div>
        Adress: {address ? address.slice(0, 10) : "No wallet has been set yet"}
        ...
      </div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
