import { useState } from "react";
import { promiseTx, verifyTx } from "../utils/ethereum";

export default function useTransactionFlow({
  web3,
  signer,
  account,
  isWalletConnected
}) {
  const [txStatus, setTxStatus] = useState("idle");
  const [txError, setTxError] = useState(null);

  const executeTx = async (txCallback) => {
    try {
      setTxStatus("pending");
      setTxError(null); // Clear previous errors

      const { hash } = await promiseTx(
        isWalletConnected,
        txCallback(),
        signer
      );

      const success = await verifyTx(web3, hash);

      if (success) {
        setTxStatus("success");
      } else {
        setTxStatus("rejected");
        setTxError("The transaction reverted.");
      }
    } catch (err) {
      console.error("Transaction error:", err); // Log actual error
      setTxStatus("rejected");
      setTxError("MetaMask error. See developer console for details.");
    }
  };

  return {
    txStatus,
    txError,
    executeTx
  };
}