import Web3 from "web3";
import djedArtifact from "../artifacts/Djed.json";
import coinArtifact from "../artifacts/Coin.json";
import oracleArtifact from "../artifacts/Oracle.json";

import {
  buildTx,
  convertInt,
  decimalScaling,
  decimalUnscaling,
  scaledPromise,
  scaledUnscaledPromise,
  percentScaledPromise,
  web3Promise,
  percentageScale
} from "./helpers";
import { TRANSACTION_USD_LIMIT, TRANSACTION_VALIDITY } from "./constants";
import { BigNumber } from "ethers";

const BLOCKCHAIN_URI = process.env.REACT_APP_BLOCKCHAIN_URI;
const DJED_ADDRESS = process.env.REACT_APP_DJED_ADDRESS;
const FEE_UI = process.env.REACT_APP_FEE_UI;
const UI = process.env.REACT_APP_UI;

export const BC_DECIMALS = 18;
export const SCALING_DECIMALS = 24; // scalingFixed // TODO: why do we need this?

const REFRESH_PERIOD = 4000;
const CONFIRMATION_WAIT_PERIOD = REFRESH_PERIOD + 1000;
export const scalingFactor = decimalUnscaling("1", SCALING_DECIMALS);
const FEE_UI_UNSCALED = decimalUnscaling((FEE_UI / 100).toString(), SCALING_DECIMALS);

export const getWeb3 = () =>
  new Promise(async (resolve, reject) => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(BLOCKCHAIN_URI);
        resolve(web3);
      } catch (error) {
        reject(error);
      }
    }
    reject("Install Metamask");
  });

export const getDjedContract = (web3) => {
  const djed = new web3.eth.Contract(djedArtifact.abi, DJED_ADDRESS);
  return djed;
};

export const getOracleAddress = async (djedContract) => {
  return await web3Promise(djedContract, "oracle");
};

export const getOracleContract = (web3, oracleAddress, FEAddress) => {
  const oracle = new web3.eth.Contract(oracleArtifact.abi, oracleAddress, {
    from: FEAddress
  });
  return oracle;
};

export const getCoinContracts = async (djedContract, web3) => {
  const [stableCoinAddress, reserveCoinAddress] = await Promise.all([
    web3Promise(djedContract, "stableCoin"),
    web3Promise(djedContract, "reserveCoin")
  ]);
  const stableCoin = new web3.eth.Contract(coinArtifact.abi, stableCoinAddress);
  const reserveCoin = new web3.eth.Contract(coinArtifact.abi, reserveCoinAddress);
  return { stableCoin, reserveCoin };
};

export const getDecimals = async (stableCoin, reserveCoin) => {
  const [scDecimals, rcDecimals] = await Promise.all([
    convertInt(web3Promise(stableCoin, "decimals")),
    convertInt(web3Promise(reserveCoin, "decimals"))
  ]);
  return { scDecimals, rcDecimals };
};

export const getCoinDetails = async (
  stableCoin,
  reserveCoin,
  djed,
  scDecimals,
  rcDecimals
) => {
  const [
    [scaledNumberSc, unscaledNumberSc],
    [scaledPriceSc, unscaledPriceSc],
    [scaledNumberRc, unscaledNumberRc],
    [scaledReserveBc, unscaledReserveBc],
    scaledBuyPriceRc,

    scaledScExchangeRate
  ] = await Promise.all([
    scaledUnscaledPromise(web3Promise(stableCoin, "totalSupply"), scDecimals),
    scaledUnscaledPromise(web3Promise(djed, "scPrice", 0), BC_DECIMALS),
    scaledUnscaledPromise(web3Promise(reserveCoin, "totalSupply"), rcDecimals),
    scaledUnscaledPromise(web3Promise(djed, "R", 0), BC_DECIMALS),
    scaledPromise(web3Promise(djed, "rcBuyingPrice", 0), BC_DECIMALS),
    scaledPromise(web3Promise(djed, "scPrice", 0), BC_DECIMALS)
  ]);
  const emptyValue = decimalScaling("0".toString(10), BC_DECIMALS);
  let scaledSellPriceRc = emptyValue;
  let unscaledSellPriceRc = emptyValue;
  let percentReserveRatio = emptyValue;

  //Check total stablecoin supply
  if (!BigNumber.from(unscaledNumberRc).isZero()) {
    [scaledSellPriceRc, unscaledSellPriceRc] = await scaledUnscaledPromise(
      web3Promise(djed, "rcTargetPrice", 0),
      BC_DECIMALS
    );
  }
  //Check total reservecoin supply
  if (!BigNumber.from(unscaledNumberSc).isZero()) {
    percentReserveRatio = await percentScaledPromise(
      web3Promise(djed, "ratio"),
      SCALING_DECIMALS
    );
  }
  return {
    scaledNumberSc,
    unscaledNumberSc,
    scaledPriceSc,
    unscaledPriceSc,
    scaledNumberRc,
    unscaledNumberRc,
    scaledReserveBc,
    unscaledReserveBc,
    percentReserveRatio,
    scaledBuyPriceRc,
    scaledSellPriceRc,
    unscaledSellPriceRc,
    scaledScExchangeRate
  };
};

export const getSystemParams = async (djed) => {
  const [
    reserveRatioMinUnscaled,
    reserveRatioMaxUnscaled,
    feeUnscaled,
    treasuryFee,
    thresholdSupplySC
  ] = await Promise.all([
    web3Promise(djed, "reserveRatioMin"),
    web3Promise(djed, "reserveRatioMax"),
    web3Promise(djed, "fee"),
    percentScaledPromise(web3Promise(djed, "treasuryFee"), SCALING_DECIMALS),
    web3Promise(djed, "thresholdSupplySC")
  ]);

  return {
    reserveRatioMin: percentageScale(reserveRatioMinUnscaled, SCALING_DECIMALS, true),
    reserveRatioMax: percentageScale(reserveRatioMaxUnscaled, SCALING_DECIMALS, true),
    reserveRatioMinUnscaled,
    reserveRatioMaxUnscaled,
    fee: percentageScale(feeUnscaled, SCALING_DECIMALS, true),
    feeUnscaled,
    treasuryFee,
    thresholdSupplySC
  };
};

export const getAccountDetails = async (
  web3,
  account,
  stableCoin,
  reserveCoin,
  scDecimals,
  rcDecimals
) => {
  const [
    [scaledBalanceSc, unscaledBalanceSc],
    [scaledBalanceRc, unscaledBalanceRc],
    [scaledBalanceBc, unscaledBalanceBc]
  ] = await Promise.all([
    scaledUnscaledPromise(web3Promise(stableCoin, "balanceOf", account), scDecimals),
    scaledUnscaledPromise(web3Promise(reserveCoin, "balanceOf", account), rcDecimals),
    scaledUnscaledPromise(web3.eth.getBalance(account), BC_DECIMALS)
  ]);

  return {
    scaledBalanceSc,
    unscaledBalanceSc,
    scaledBalanceRc,
    unscaledBalanceRc,
    scaledBalanceBc,
    unscaledBalanceBc
  };
};

export const getCoinBudgets = async (djed, unscaledBalanceBc, scDecimals, rcDecimals) => {
  return {
    scaledBudgetSc: null,
    unscaledBudgetSc: null,
    scaledBudgetRc: null,
    unscaledBudgetRc: null
  };
};

export const promiseTx = (accounts, tx) => {
  if (accounts.length === 0) {
    return Promise.reject(new Error("Metamask not connected!"));
  }
  return window.ethereum.request({
    method: "eth_sendTransaction",
    params: [tx]
  });
};

export const verifyTx = (web3, hash) => {
  return new Promise((res) => {
    setTimeout(() => {
      web3.eth.getTransactionReceipt(hash).then((receipt) => res(receipt.status));
    }, CONFIRMATION_WAIT_PERIOD);
  });
};

/**
 * Function that deducts all platform fees from the BC amount
 * @param {*} value The amount of BC from which fees should be deducted
 * @param {*} fee The platform fee
 * @param {*} treasuryFee The treasury fee
 * @returns BC value with all fees calculated
 */
export const calculateTxFees = (value, fee, treasuryFee, feeUI) => {
  const f = BigNumber.from(value)
    .mul(BigNumber.from(fee))
    .div(BigNumber.from(scalingFactor));
  const f_ui = BigNumber.from(value)
    .mul(BigNumber.from(feeUI || FEE_UI_UNSCALED))
    .div(BigNumber.from(scalingFactor));
  const f_t = BigNumber.from(value)
    .mul(BigNumber.from(treasuryFee))
    .div(BigNumber.from(scalingFactor));
  return { f, f_ui, f_t };
};

/**
 * Function that deducts all platform fees from the BC amount
 * @param {*} value The amount of BC from which fees should be deducted
 * @param {*} fee The platform fee
 * @param {*} treasuryFee The treasury fee
 * @returns BC value with all fees calculated
 */
export const deductFees = (value, fee, treasuryFee) => {
  const { f, f_ui, f_t } = calculateTxFees(value, fee, treasuryFee);
  return BigNumber.from(value).sub(f).sub(f_ui).sub(f_t);
};

/**
 * Function that appends all platform fees to the BC amount
 * @param {*} amountBC The unscaled amount of BC (e.g. for 1BC, value should be 1 * 10^BC_DECIMALS)
 * @param {*} treasuryFee Treasury fee unscaled (e.g. If the fee is 1%, than 1/100 * scalingFactor)
 * @param {*} fee Fee unscaled (e.g. If the fee is 1%, than 1/100 * scalingFactor)
 * @param {*} fee_UI UI fee unscaled (e.g. If the fee is 1%, than 1/100 * scalingFactor)
 * @returns Unscaled BC amount with calculated fees
 */
export const appendFees = (amountBC, treasuryFee, fee, fee_UI) => {
  const totalFees = BigNumber.from(treasuryFee)
    .add(BigNumber.from(fee))
    .add(BigNumber.from(fee_UI));
  const substractedFees = BigNumber.from(scalingFactor).sub(totalFees);
  const appendedFeesAmount = BigNumber.from(amountBC)
    .mul(BigNumber.from(scalingFactor))
    .div(BigNumber.from(substractedFees));
  return appendedFeesAmount.toString();
};

/**
 * Function that returns treasury and platform fees
 * @param {*} djed Djed contract
 * @returns Treasury and platform fee
 */
const getFees = async (djed) => {
  try {
    const [treasuryFee, fee] = await Promise.all([
      web3Promise(djed, "treasuryFee"),
      web3Promise(djed, "fee")
    ]);
    return {
      treasuryFee,
      fee
    };
  } catch (error) {
    console.log("error", error);
  }
};

/**
 * Function that converts coin amount to BC
 * @param {*} amount unscaled coin amount to be converted to BC
 * @param {*} price unscaled coin price
 * @param {*} decimals coin decimals
 * @returns unscaled BC amount
 */
export const convertToBC = (amount, price, decimals) => {
  const decimalScalingFactor = Math.pow(10, decimals);

  return BigNumber.from(amount)
    .mul(BigNumber.from(price))
    .div(BigNumber.from(decimalScalingFactor));
};

const tradeDataPriceCore = (djed, method, decimals, amountScaled) => {
  const amountUnscaled = decimalUnscaling(amountScaled, decimals);
  return scaledUnscaledPromise(web3Promise(djed, method, 0), BC_DECIMALS).then(
    (price) => {
      const [priceScaled, priceUnscaled] = price;
      const totalUnscaled = convertToBC(
        amountUnscaled,
        priceUnscaled,
        decimals
      ).toString();

      const totalScaled = decimalScaling(totalUnscaled, BC_DECIMALS);

      return {
        amountScaled,
        amountUnscaled,
        totalScaled,
        totalUnscaled,
        priceUnscaled,
        priceScaled
      };
    }
  );
};

// reservecoin

/**
 * Function that calculates fees and how much BC (totalBCAmount) user should pay to receive desired amount of reserve coin
 * @param {*} djed DjedContract
 * @param {*} rcDecimals Reserve coin decimals
 * @param {*} amountScaled Reserve coin amount that user wants to buy
 * @returns
 */
export const tradeDataPriceBuyRc = async (djed, rcDecimals, amountScaled) => {
  try {
    const data = await tradeDataPriceCore(
      djed,
      "rcBuyingPrice",
      rcDecimals,
      amountScaled
    );
    const { treasuryFee, fee } = await getFees(djed);

    const totalBCUnscaled = appendFees(
      data.totalUnscaled,
      treasuryFee,
      fee,
      FEE_UI_UNSCALED
    );
    return {
      ...data,
      totalBCScaled: decimalScaling(totalBCUnscaled, BC_DECIMALS),
      totalBCUnscaled
    };
  } catch (error) {
    console.log("error", error);
  }
};

export const tradeDataPriceSellRc = async (djed, rcDecimals, amountScaled) => {
  try {
    const data = await tradeDataPriceCore(
      djed,
      "rcTargetPrice",
      rcDecimals,
      amountScaled
    );

    const { treasuryFee, fee } = await getFees(djed);
    const value = convertToBC(
      data.amountUnscaled,
      data.priceUnscaled,
      rcDecimals
    ).toString();

    const totalBCAmount = deductFees(value, fee, treasuryFee);

    return {
      ...data,
      totalBCScaled: decimalScaling(totalBCAmount.toString(), BC_DECIMALS),
      totalBCUnscaled: totalBCAmount.toString()
    };
  } catch (error) {
    console.log("error", error);
  }
};

export const buyRcTx = (djed, account, value) => {
  const data = djed.methods.buyReserveCoins(account, FEE_UI_UNSCALED, UI).encodeABI();
  return buildTx(account, DJED_ADDRESS, value, data);
};

export const sellRcTx = (djed, account, amount) => {
  const data = djed.methods
    .sellReserveCoins(amount, account, FEE_UI_UNSCALED, UI)
    .encodeABI();
  return buildTx(account, DJED_ADDRESS, 0, data);
};

// TODO: Check reserve ratio!
export const checkBuyableRc = (djed, unscaledAmountRc, unscaledBudgetRc) => {
  return new Promise((r) => r(TRANSACTION_VALIDITY.OK));
};

export const checkSellableRc = (djed, unscaledAmountRc, unscaledBalanceRc) => {
  return new Promise((r) => r(TRANSACTION_VALIDITY.OK));
};

// stablecoin

/**
 * Function that calculates fees and how much BC (totalBCAmount) user should pay to receive desired amount of stable coin
 * @param {*} djed DjedContract
 * @param {*} scDecimals Stable coin decimals
 * @param {*} amountScaled Stable coin amount that user wants to buy
 * @returns
 */
export const tradeDataPriceBuySc = async (djed, scDecimals, amountScaled) => {
  try {
    const data = await tradeDataPriceCore(djed, "scPrice", scDecimals, amountScaled);
    const { treasuryFee, fee } = await getFees(djed);
    const totalBCUnscaled = appendFees(
      data.totalUnscaled,
      treasuryFee,
      fee,
      FEE_UI_UNSCALED
    );

    return {
      ...data,
      totalBCScaled: decimalScaling(totalBCUnscaled, BC_DECIMALS),
      totalBCUnscaled
    };
  } catch (error) {
    console.log("error", error);
  }
};

/**
 * Function that calculates fees and how much BC (totalBCAmount) user will receive if he sells desired amount of stable coin
 * @param {*} djed DjedContract
 * @param {*} scDecimals Stable coin decimals
 * @param {*} amountScaled Stable coin amount that user wants to sell
 * @returns
 */
export const tradeDataPriceSellSc = async (djed, scDecimals, amountScaled) => {
  try {
    const data = await tradeDataPriceCore(djed, "scPrice", scDecimals, amountScaled);
    const { treasuryFee, fee } = await getFees(djed);
    const value = convertToBC(
      data.amountUnscaled,
      data.priceUnscaled,
      scDecimals
    ).toString();

    const totalBCAmount = deductFees(value, fee, treasuryFee);

    return {
      ...data,
      totalBCScaled: decimalScaling(totalBCAmount.toString(), BC_DECIMALS)
    };
  } catch (error) {
    console.log("error", error);
  }
};

export const buyScTx = (djed, account, value) => {
  const data = djed.methods.buyStableCoins(account, FEE_UI_UNSCALED, UI).encodeABI();
  return buildTx(account, DJED_ADDRESS, value, data);
};

export const sellScTx = (djed, account, amount) => {
  const data = djed.methods
    .sellStableCoins(amount, account, FEE_UI_UNSCALED, UI)
    .encodeABI();
  return buildTx(account, DJED_ADDRESS, 0, data);
};

export const checkBuyableSc = (djed, unscaledAmountSc, unscaledBudgetSc) => {
  return new Promise((r) => r(TRANSACTION_VALIDITY.OK));
};

export const checkSellableSc = (unscaledAmountSc, unscaledBalanceSc) => {
  return new Promise((r) => r(TRANSACTION_VALIDITY.OK));
};

/**
 * Calculate if the transaction will reach the maximum reserve ratio
 * @param scPrice - Unscaled stablecoin price
 * @param reserveBc - Unscaled reserve of base coin with appended potential transaction amount.
 * Example: If user wants to buy 1RC, the reserveBc param will be calculated as sum of current reserve of BC and desired RC amount converted in BC
 * @param totalScSupply - Unscaled total stablecoin supply
 * @param reserveRatioMax - Unscaled maximum reserve ratio
 * @param scDecimalScalingFactor - If stablecoin has 6 decimals, scDecimalScalingFactor will be calculated as 10^6
 * @param thresholdSupplySC - Unscaled threshold SC supply
 * @returns
 */
export const calculateIsRatioBelowMax = ({
  scPrice,
  reserveBc,
  totalScSupply,
  reserveRatioMax,
  scDecimalScalingFactor,
  thresholdSupplySC
}) => {
  return (
    reserveBc
      .mul(BigNumber.from(scalingFactor))
      .mul(scDecimalScalingFactor)
      .lt(totalScSupply.mul(scPrice).mul(reserveRatioMax)) ||
    totalScSupply.lte(thresholdSupplySC)
  );
};

/**
 * Calculate if the transaction will reach the minimum reserve ratio
 * @param scPrice - Unscaled stablecoin price
 * @param reserveBc - Unscaled reserve of base coin with calculated potential transaction amount.
 * Example: If user wants to buy 1SC, the reserveBc param will be calculated as sum of current reserve of BC and desired SC amount converted in BC
 * @param totalScSupply - Unscaled total stablecoin supply
 * @param reserveRatioMin - Unscaled minimum reserve ratio
 * @param scDecimalScalingFactor - If stablecoin has 6 decimals, scDecimalScalingFactor will be calculated as 10^6
 * @returns
 */
export const calculateIsRatioAboveMin = ({
  scPrice,
  reserveBc,
  totalScSupply,
  reserveRatioMin,
  scDecimalScalingFactor
}) => {
  return reserveBc
    .mul(BigNumber.from(scalingFactor))
    .mul(scDecimalScalingFactor)
    .gt(totalScSupply.mul(scPrice).mul(reserveRatioMin));
};

/**
 *
 * @param {*} amountUSD
 * @param {*} totalSCSupply
 * @param {*} thresholdSCSupply
 * @returns
 */
export const isTxLimitReached = (amountUSD, totalSCSupply, thresholdSCSupply) =>
  amountUSD > TRANSACTION_USD_LIMIT ||
  BigNumber.from(totalSCSupply).gte(BigNumber.from(thresholdSCSupply));

/**
 * This function should calculate the future stable coin price that we can expect after some transaction.
 * @param {string} amountBC The unscaled amount of BC (e.g. for 1BC, value should be 1 * 10^BC_DECIMALS)
 * @param {string} amountSC The unscaled amount of StableCoin (e.g. for 1SC, value should be 1 * 10^SC_DECIMALS)
 * @param djedContract - Instance of Djed contract
 * @param stableCoinContract - Instance of Stablecoin contract
 * @param oracleContract - Instance of Oracle contract
 * @param scDecimalScalingFactor - If stablecoin has 6 decimals, scDecimalScalingFactor will be calculated as 10^6
 * @returns future stablecoin price
 */
export const calculateFutureScPrice = async ({
  amountBC,
  amountSC,
  djedContract,
  oracleContract,
  stableCoinContract,
  scDecimalScalingFactor
}) => {
  try {
    const [scTargetPrice, scSupply, ratio] = await Promise.all([
      web3Promise(oracleContract, "readData"),
      web3Promise(stableCoinContract, "totalSupply"),
      web3Promise(djedContract, "R", 0)
    ]);

    const futureScSupply = BigNumber.from(scSupply).add(BigNumber.from(amountSC));
    const futureRatio = BigNumber.from(ratio).add(BigNumber.from(amountBC));
    const futurePrice = futureRatio.mul(scDecimalScalingFactor).div(futureScSupply);

    if (futureScSupply == 0) {
      return scTargetPrice;
    } else {
      return BigNumber.from(scTargetPrice).lt(futurePrice)
        ? scTargetPrice
        : futurePrice.toString();
    }
  } catch (error) {
    console.log("calculateFutureScPrice error ", error);
  }
};
