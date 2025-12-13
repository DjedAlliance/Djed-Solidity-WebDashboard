import { useState } from "react";
import { useAppProvider } from "../context/AppProvider";
import useBuyOrSell from "../utils/hooks/useBuyOrSell";
import { createBuyHandler, createSellHandler } from "./coinTradeHelpers";
import { TRANSACTION_VALIDITY } from "../utils/constants";
import { promiseTx, verifyTx, calculateTxFees, isTxLimitReached } from "../utils/ethereum";
import { stringToBigNumber, validatePositiveNumber } from "../utils/helpers";
import { BigNumber } from "ethers";
import { useWSCProvider, useModal as useWSCModal } from "milkomeda-wsc-ui-test-beta";

export default function useCoinTrade({
  createBuyOptions = {},
  createSellOptions = {}
}) {
  const {
    web3,
    isWalletConnected,
    isWrongChain,
    djedContract,
    coinsDetails,
    decimals,
    accountDetails,
    coinBudgets,
    account,
    signer,
    systemParams,
    getFutureScPrice
  } = useAppProvider();
  const { isWSCConnected } = useWSCProvider();
  const { setOpen } = useWSCModal();
  const { buyOrSell, isBuyActive, setBuyOrSell } = useBuyOrSell();

  const [tradeData, setTradeData] = useState({});
  const [value, setValue] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [txError, setTxError] = useState(null);
  const [txStatus, setTxStatus] = useState("idle");
  const [buyValidity, setBuyValidity] = useState(
    TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED
  );
  const [sellValidity, setSellValidity] = useState(
    TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED
  );

  const txStatusPending = txStatus === "pending";
  const txStatusRejected = txStatus === "rejected";
  const txStatusSuccess = txStatus === "success";

  const updateBuyTradeData = createBuyHandler({
    validatePositiveNumber,
    tradeDataPriceBuy: createBuyOptions.tradeDataPriceBuy,
    djedContract,
    decimalsValue: createBuyOptions.decimalsValue,
    getFutureScPrice,
    calculateTxFees,
    systemParams,
    isWalletConnected,
    isWrongChain,
    coinsDetails,
    accountDetails,
    isTxLimitReached,
    checkBuyable: createBuyOptions.checkBuyable,
    stringToBigNumber,
    BC_DECIMALS: createBuyOptions.bcDecimals,
    setTradeData,
    setBuyValidity,
    amountForLimitFn: createBuyOptions.amountForLimitFn,
    isRatioOkFn: createBuyOptions.isRatioOkFn,
    ratioFailState: createBuyOptions.ratioFailState,
    budgetUnscaled: createBuyOptions.budgetUnscaled
  });

  const updateSellTradeData = createSellHandler({
    validatePositiveNumber,
    tradeDataPriceSell: createSellOptions.tradeDataPriceSell,
    djedContract,
    decimalsValue: createSellOptions.decimalsValue,
    getFutureScPrice,
    calculateTxFees,
    systemParams,
    isWalletConnected,
    isWrongChain,
    coinsDetails,
    accountDetails,
    isTxLimitReached,
    checkSellable: createSellOptions.checkSellable,
    stringToBigNumber,
    bcDecimals: createSellOptions.bcDecimals,
    setTradeData,
    setSellValidity,
    amountForLimitFn: createSellOptions.amountForLimitFn,
    isRatioOkFn: createSellOptions.isRatioOkFn,
    ratioFailState: createSellOptions.ratioFailState
  });

  const onChangeBuyInput = (amountScaled) => {
    setValue(amountScaled);
    updateBuyTradeData(amountScaled);
  };
  const onChangeSellInput = (amountScaled) => {
    setValue(amountScaled);
    updateSellTradeData(amountScaled);
  };

  const runTransaction = (txCreator) => {
    return (amount) => {
      setTxStatus("pending");
      promiseTx(isWalletConnected, txCreator(djedContract, account, amount), signer)
        .then(({ hash }) => {
          verifyTx(web3, hash).then((res) => {
            if (res) {
              setTxStatus("success");
            } else {
              setTxError("The transaction reverted.");
              setTxStatus("rejected");
            }
          });
        })
        .catch((err) => {
          console.error("Error:", err.message);
          setTxStatus("rejected");
          setTxError("MetaMask error. See developer console for details.");
        });
    };
  };

  const buyFunction = createBuyOptions.buyTx
    ? runTransaction(createBuyOptions.buyTx)
    : null;
  const sellFunction = createSellOptions.sellTx
    ? runTransaction(createSellOptions.sellTx)
    : null;

  const tradeFxn = isBuyActive
    ? buyFunction?.bind(null, tradeData.totalBCUnscaled)
    : sellFunction?.bind(null, tradeData.amountUnscaled);

  const currentAmount = isBuyActive
    ? tradeData.totalBCUnscaled
    : tradeData.amountUnscaled;

  const onSubmit = (e) => {
    if (!isWalletConnected) return;
    if (!termsAccepted) return;
    e.preventDefault();
    if (isWSCConnected) {
      setOpen(true);
      return;
    }
    tradeFxn && tradeFxn();
  };

  const transactionValidated = isBuyActive
    ? buyValidity === TRANSACTION_VALIDITY.OK
    : sellValidity === TRANSACTION_VALIDITY.OK;

  const buttonDisabled =
    isNaN(parseFloat(value)) ||
    parseFloat(value) === 0 ||
    isWrongChain ||
    !transactionValidated;

  return {
    tradeData,
    value,
    termsAccepted,
    txError,
    txStatus,
    buyValidity,
    sellValidity,
    txStatusPending,
    txStatusRejected,
    txStatusSuccess,
    buyFunction,
    sellFunction,
    tradeFxn,
    currentAmount,
    onChangeBuyInput,
    onChangeSellInput,
    onSubmit,
    transactionValidated,
    buttonDisabled,
    setValue,
    setTermsAccepted,
    setBuyOrSell,
    setBuyValidity,
    setSellValidity,
    buyOrSell,
    isBuyActive
    ,
    isWSCConnected
  };
}
