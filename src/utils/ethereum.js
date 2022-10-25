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
  web3Promise
} from "./helpers";
import { TRANSACTION_VALIDITY } from "./constants";
import { BigNumber } from "@ethersproject/bignumber";

const BLOCKCHAIN_URI = process.env.REACT_APP_BLOCKCHAIN_URI;
const DJED_ADDRESS = process.env.REACT_APP_DJED_ADDRESS;
const FEE_UI = process.env.REACT_APP_FEE_UI;
const UI = process.env.REACT_APP_UI;

const BC_DECIMALS = 18;
const ORACLE_DECIMALS = 18;
const SCALING_DECIMALS = 24; // scalingFixed // TODO: why do we need this?

const REFRESH_PERIOD = 4000;
const CONFIRMATION_WAIT_PERIOD = REFRESH_PERIOD + 1000;
const scalingFactor = decimalUnscaling("1", SCALING_DECIMALS);
const FEE_UI_UNSCALED = decimalUnscaling(FEE_UI, SCALING_DECIMALS);

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

export const getOracleContract = (web3, oracleAddress) => {
  const oracle = new web3.eth.Contract(oracleArtifact.abi, oracleAddress);
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
  rcDecimals,
  oracle
) => {
  const [
    [scaledNumberSc, unscaledNumberSc],
    scaledPriceSc,
    scaledNumberRc,
    scaledReserveBc,
    percentReserveRatio,
    scaledBuyPriceRc,
    scaledSellPriceRc,
    scaledScExchangeRate
  ] = await Promise.all([
    scaledUnscaledPromise(web3Promise(stableCoin, "totalSupply"), scDecimals),
    scaledPromise(web3Promise(djed, "scPrice"), BC_DECIMALS),
    scaledPromise(web3Promise(reserveCoin, "totalSupply"), rcDecimals),
    scaledPromise(web3Promise(djed, "R"), BC_DECIMALS),
    percentScaledPromise(web3Promise(djed, "ratio"), SCALING_DECIMALS) /*.then(
      (value) => (parseFloat(value) * 100).toFixed(4) + "%"
    )*/,
    scaledPromise(web3Promise(djed, "rcBuyingPrice"), BC_DECIMALS),
    scaledPromise(web3Promise(djed, "rcTargetPrice"), BC_DECIMALS),
    scaledPromise(web3Promise(oracle, "readData"), ORACLE_DECIMALS)
  ]);

  return {
    scaledNumberSc,
    unscaledNumberSc,
    scaledPriceSc,
    scaledNumberRc,
    scaledReserveBc,
    percentReserveRatio,
    scaledBuyPriceRc,
    scaledSellPriceRc,
    scaledScExchangeRate
  };
};

export const getSystemParams = async (djed) => {
  const [reserveRatioMin, reserveRatioMax, fee, treasuryFee, thresholdSupplySC] =
    await Promise.all([
      percentScaledPromise(web3Promise(djed, "reserveRatioMin"), SCALING_DECIMALS),
      percentScaledPromise(web3Promise(djed, "reserveRatioMax"), SCALING_DECIMALS),
      percentScaledPromise(web3Promise(djed, "fee"), SCALING_DECIMALS),
      percentScaledPromise(web3Promise(djed, "treasuryFee"), SCALING_DECIMALS),
      web3Promise(djed, "thresholdSupplySC")
    ]);

  return {
    reserveRatioMin,
    reserveRatioMax,
    fee,
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
 * Function that deducts all platform fees from the mtADA amount
 * @param {*} value The amount of mtADA from which fees should be deducted
 * @param {*} fee The platform fee
 * @param {*} treasuryFee The treasury fee
 * @returns mtADA value with all fees calculated
 */
export const calculateTxFees = (value, fee, treasuryFee) => {
  const f = BigNumber.from(value)
    .mul(BigNumber.from(fee))
    .div(BigNumber.from(scalingFactor));
  const f_ui = BigNumber.from(value)
    .mul(BigNumber.from(FEE_UI_UNSCALED))
    .div(BigNumber.from(scalingFactor));
  const f_t = BigNumber.from(value)
    .mul(BigNumber.from(treasuryFee))
    .div(BigNumber.from(scalingFactor));
  return { f, f_ui, f_t };
};

/**
 * Function deductFees deducts all platform fees from the mtADA amount
 * Function appendFees apends all platform fees to the mtADA amount
 * @param {*} value The amount of mtADA from which fees should be deducted/appended
 * @param {*} f The platform fee
 * @param {*} f_ui The UI fee
 * @param {*} f_t The treasury fee
 * @returns mtADA value with all fees calculated
 */
export const deductFees = (value, f, f_ui, f_t) =>
  BigNumber.from(value).sub(f).sub(f_ui).sub(f_t);
export const appendFees = (value, f, f_ui, f_t) =>
  BigNumber.from(value).add(f).add(f_ui).add(f_t);

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
  } catch (error) {}
};

/**
 * Function that converts coin amount to mtADA
 * @param {*} amount unscaled coin amount to be converted to mtADA
 * @param {*} price unscaled coin price
 * @param {*} decimals coin decimals
 * @returns unscaled mtADA amount
 */
const convertToMtADA = (amount, price, decimals) => {
  const decimalScalingFactor = Math.pow(10, decimals);
  return (amount * price) / decimalScalingFactor;
};

const tradeDataPriceCore = (djed, method, decimals, amountScaled) => {
  const amountUnscaled = decimalUnscaling(amountScaled, decimals);
  return scaledUnscaledPromise(web3Promise(djed, method), BC_DECIMALS).then((price) => {
    const [priceScaled, priceUnscaled] = price;
    const total = priceScaled.replaceAll(",", "") * amountScaled;
    const totalUnscaled = decimalUnscaling(total.toString(), BC_DECIMALS);
    const totalScaled = decimalScaling(totalUnscaled, BC_DECIMALS);

    return {
      amountScaled,
      amountUnscaled,
      totalScaled,
      totalUnscaled,
      priceUnscaled
    };
  });
};

// reservecoin

/**
 * Function that calculates fees and how much mtADA (totalmtADAAmount) user should pay to receive desired amount of reserve coin
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
    const { f, f_ui, f_t } = calculateTxFees(data.totalUnscaled, fee, treasuryFee);
    const totalmtADAAmount = appendFees(data.totalUnscaled, f, f_ui, f_t);

    return {
      ...data,
      totalmtADAScaled: decimalScaling(totalmtADAAmount.toString(), BC_DECIMALS),
      totalmtADAUnscaled: totalmtADAAmount.toString()
    };
  } catch (error) {}
};

export const tradeDataPriceSellRc = (djed, rcDecimals, amountScaled) =>
  tradeDataPriceCore(djed, "rcTargetPrice", rcDecimals, amountScaled);
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
 * Function that calculates fees and how much mtADA (totalmtADAAmount) user should pay to receive desired amount of stable coin
 * @param {*} djed DjedContract
 * @param {*} scDecimals Stable coin decimals
 * @param {*} amountScaled Stable coin amount that user wants to buy
 * @returns
 */
export const tradeDataPriceBuySc = async (djed, scDecimals, amountScaled) => {
  try {
    const data = await tradeDataPriceCore(djed, "scPrice", scDecimals, amountScaled);
    const { treasuryFee, fee } = await getFees(djed);
    const { f, f_ui, f_t } = calculateTxFees(data.totalUnscaled, fee, treasuryFee);
    const totalmtADAAmount = appendFees(data.totalUnscaled, f, f_ui, f_t);

    return {
      ...data,
      totalmtADAScaled: decimalScaling(totalmtADAAmount.toString(), BC_DECIMALS),
      totalmtADAUnscaled: totalmtADAAmount.toString()
    };
  } catch (error) {}
};

/**
 * Function that calculates fees and how much mtADA (totalmtADAAmount) user will receive if he sells desired amount of stable coin
 * @param {*} djed DjedContract
 * @param {*} scDecimals Stable coin decimals
 * @param {*} amountScaled Stable coin amount that user wants to sell
 * @returns
 */
export const tradeDataPriceSellSc = async (djed, scDecimals, amountScaled) => {
  try {
    const data = await tradeDataPriceCore(djed, "scPrice", scDecimals, amountScaled);
    const { treasuryFee, fee } = await getFees(djed);
    const value = convertToMtADA(
      data.amountUnscaled,
      data.priceUnscaled,
      scDecimals
    ).toString();

    const { f, f_ui, f_t } = calculateTxFees(value, fee, treasuryFee);
    const totalmtADAAmount = deductFees(value, f, f_ui, f_t);

    return {
      ...data,
      totalmtADAScaled: decimalScaling(totalmtADAAmount.toString(), BC_DECIMALS)
    };
  } catch (error) {}
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
