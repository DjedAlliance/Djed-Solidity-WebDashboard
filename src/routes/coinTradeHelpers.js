import { TRANSACTION_VALIDITY } from "../utils/constants";
import { BigNumber } from "ethers";

export function createBuyHandler(options) {
  const {
    validatePositiveNumber,
    tradeDataPriceBuy,
    djedContract,
    decimalsValue,
    getFutureScPrice,
    calculateTxFees,
    systemParams,
    isWalletConnected,
    isWrongChain,
    coinsDetails,
    accountDetails,
    isTxLimitReached,
    checkBuyable,
    stringToBigNumber,
    BC_DECIMALS,
    setTradeData,
    setBuyValidity,
    amountForLimitFn,
    isRatioOkFn
  } = options;

  return (amountScaled) => {
    const inputSanity = validatePositiveNumber(amountScaled);
    if (inputSanity !== TRANSACTION_VALIDITY.OK) {
      setBuyValidity(inputSanity);
      return;
    }
    const getTradeData = async () => {
      try {
        const data = await tradeDataPriceBuy(djedContract, decimalsValue, amountScaled);
        const futureSCPrice = await getFutureScPrice({
          amountBC: data.totalUnscaled,
          amountSC: data.amountUnscaled
        });
        const { f } = calculateTxFees(data.totalUnscaled, systemParams?.feeUnscaled, 0);

        const isRatioOk = isRatioOkFn({
          totalScSupply: BigNumber.from(coinsDetails?.unscaledNumberSc).add(
            BigNumber.from(data.amountUnscaled)
          ),
          scPrice: BigNumber.from(futureSCPrice),
          reserveBc: BigNumber.from(coinsDetails?.unscaledReserveBc).add(
            BigNumber.from(data.totalUnscaled).add(f)
          )
        });

        setTradeData(data);
        if (!isWalletConnected) {
          setBuyValidity(TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED);
        } else if (isWrongChain) {
          setBuyValidity(TRANSACTION_VALIDITY.WRONG_NETWORK);
        } else if (
          isTxLimitReached(amountForLimitFn(amountScaled, data), coinsDetails.unscaledNumberSc, systemParams.thresholdSupplySC)
        ) {
          setBuyValidity(TRANSACTION_VALIDITY.TRANSACTION_LIMIT_REACHED);
        } else if (
          stringToBigNumber(accountDetails.unscaledBalanceBc, BC_DECIMALS).lt(
            stringToBigNumber(data.totalBCUnscaled, BC_DECIMALS)
          )
        ) {
          setBuyValidity(TRANSACTION_VALIDITY.INSUFFICIENT_BC);
        } else if (!isRatioOk) {
          setBuyValidity(options.ratioFailState || TRANSACTION_VALIDITY.RESERVE_RATIO_LOW);
        } else {
          checkBuyable(djedContract, data.amountUnscaled, options.budgetUnscaled).then((res) => {
            setBuyValidity(res);
          });
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    getTradeData();
  };
}

export function createSellHandler(options) {
  const {
    validatePositiveNumber,
    tradeDataPriceSell,
    djedContract,
    decimalsValue,
    getFutureScPrice,
    calculateTxFees,
    systemParams,
    isWalletConnected,
    isWrongChain,
    coinsDetails,
    accountDetails,
    isTxLimitReached,
    checkSellable,
    stringToBigNumber,
    bcDecimals,
    setTradeData,
    setSellValidity,
    amountForLimitFn,
    isRatioOkFn
  } = options;

  return (amountScaled) => {
    const inputSanity = validatePositiveNumber(amountScaled);
    if (inputSanity !== TRANSACTION_VALIDITY.OK) {
      setSellValidity(inputSanity);
      return;
    }
    const getTradeData = async () => {
      try {
        const data = await tradeDataPriceSell(djedContract, decimalsValue, amountScaled);
        const futureSCPrice = await getFutureScPrice({
          amountBC: data.totalUnscaled,
          amountSC: 0
        });
        const { f } = calculateTxFees(data.totalUnscaled, systemParams?.feeUnscaled, 0);

        const isRatioOk = isRatioOkFn({
          totalScSupply: BigNumber.from(coinsDetails?.unscaledNumberSc),
          scPrice: BigNumber.from(futureSCPrice),
          reserveBc: BigNumber.from(coinsDetails?.unscaledReserveBc).sub(
            BigNumber.from(data.totalUnscaled).sub(f)
          )
        });

        setTradeData(data);
        if (!isWalletConnected) {
          setSellValidity(TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED);
        } else if (isWrongChain) {
          setSellValidity(TRANSACTION_VALIDITY.WRONG_NETWORK);
        } else if (
          isTxLimitReached(amountForLimitFn(amountScaled, data), coinsDetails.unscaledNumberSc, systemParams.thresholdSupplySC)
        ) {
          setSellValidity(TRANSACTION_VALIDITY.TRANSACTION_LIMIT_REACHED);
        } else if (
          stringToBigNumber(accountDetails.unscaledBalanceSc, bcDecimals).lt(
            stringToBigNumber(data.amountUnscaled, bcDecimals)
          )
        ) {
          setSellValidity(TRANSACTION_VALIDITY.INSUFFICIENT_SC);
        } else if (!isRatioOk) {
          setSellValidity(options.ratioFailState || TRANSACTION_VALIDITY.RESERVE_RATIO_LOW);
        } else {
          checkSellable(data.amountUnscaled, accountDetails?.unscaledBalanceSc).then((res) =>
            setSellValidity(res)
          );
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    getTradeData();
  };
}
