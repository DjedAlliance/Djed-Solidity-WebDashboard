import { promiseTx, verifyTx } from "../utils/ethereum";

export const executeTx = async ({
  isWalletConnected,
  txFunction,
  contract,
  account,
  amount,
  signer,
  web3,
  setTxStatus,
  setTxError,
}) => {
  try {
    if (!isWalletConnected) {
      setTxError("Metamask not connected!");
      setTxStatus("rejected");
      return;
    }
    if (!signer) {
      setTxError("Couldn't get Signer");
      setTxStatus("rejected");
      return;
    }
    setTxStatus("pending");

    const { hash } = await promiseTx(
      isWalletConnected,
      txFunction(contract, account, amount),
      signer
    );

    const res = await verifyTx(web3, hash);

    if (res) {
      setTxStatus("success");
    } else {
      setTxError("Transaction reverted.");
      setTxStatus("rejected");
    }
  } catch (err) {
    console.error(err);
    setTxStatus("rejected");
    setTxError("MetaMask error.");
  }
};