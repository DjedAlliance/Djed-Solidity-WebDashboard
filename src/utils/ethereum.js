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

const BLOCKCHAIN_URI = "https://rpc-devnet-cardano-evm.c1.milkomeda.com/";
export const CHAIN_ID = 200101;
const DJED_ADDRESS = "0xFE7E66e02A80dcFa9267fE2F2b3f70f743A15bBe"; // djedAddress
const BC_DECIMALS = 18;
const ORACLE_DECIMALS = 18;
const SCALING_DECIMALS = 24; // scalingFixed // TODO: why do we need this?

const REFRESH_PERIOD = 4000;
const CONFIRMATION_WAIT_PERIOD = REFRESH_PERIOD + 1000;

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
  const [reserveRatioMin, reserveRatioMax, fee, thresholdSupplySC] = await Promise.all([
    percentScaledPromise(web3Promise(djed, "reserveRatioMin"), SCALING_DECIMALS),
    percentScaledPromise(web3Promise(djed, "reserveRatioMax"), SCALING_DECIMALS),
    percentScaledPromise(web3Promise(djed, "fee"), SCALING_DECIMALS),
    web3Promise(djed, "thresholdSupplySC")
  ]);

  return {
    reserveRatioMin,
    reserveRatioMax,
    fee,
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

const tradeDataPriceCore = (djed, method, decimals, amountScaled) => {
  const amountUnscaled = decimalUnscaling(amountScaled, decimals);
  return web3Promise(djed, method, amountUnscaled.toString(10)).then((totalUnscaled) => ({
    amountScaled,
    amountUnscaled,
    totalScaled: decimalScaling(totalUnscaled, BC_DECIMALS),
    totalUnscaled
  }));
};

// reservecoin

// TODO: change the buy and sell functions to conform to the new ABI: need ui address and fee

export const tradeDataPriceBuyRc = (djed, rcDecimals, amountScaled) =>
  tradeDataPriceCore(djed, "rcBuyingPrice", rcDecimals, amountScaled); // TODO: multiply by amount?

export const tradeDataPriceSellRc = (djed, rcDecimals, amountScaled) =>
  tradeDataPriceCore(djed, "rcTargetPrice", rcDecimals, amountScaled); // TODO: multiply by amount?


export const buyRcTx = (djed, account, value) => {
  const data = djed.methods.buyReserveCoins().encodeABI();
  return buildTx(account, DJED_ADDRESS, value, data);
};

export const sellRcTx = (djed, account, amount) => {
  const data = djed.methods.sellReserveCoins(amount).encodeABI();
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

export const tradeDataPriceBuySc = (djed, scDecimals, amountScaled) =>
  tradeDataPriceCore(oracle, "readData", scDecimals, amountScaled); // TODO: FIXME multiply by amount?

export const tradeDataPriceSellSc = (djed, scDecimals, amountScaled) =>
  tradeDataPriceCore(djed, "scPrice", scDecimals, amountScaled); // TODO: multiply by amount?


export const buyScTx = (djed, account, value) => {
  const data = djed.methods.buyStableCoins().encodeABI();
  return buildTx(account, DJED_ADDRESS, value, data);
};

export const sellScTx = (djed, account, amount) => {
  const data = djed.methods.sellStableCoins(amount).encodeABI();
  return buildTx(account, DJED_ADDRESS, 0, data);
};

export const checkBuyableSc = (djed, unscaledAmountSc, unscaledBudgetSc) => {
  return new Promise((r) => r(TRANSACTION_VALIDITY.OK));
};

export const checkSellableSc = (unscaledAmountSc, unscaledBalanceSc) => {
  return new Promise((r) => r(TRANSACTION_VALIDITY.OK));
}