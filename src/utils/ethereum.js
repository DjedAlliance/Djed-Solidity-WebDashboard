import Web3 from "web3";
import djedArtifact from "../artifacts/DjedProtocol.json";
import oracleArtifact from "../artifacts/AdaUsdSimpleOracle.json";

import djedStableCoinArtifact from "../artifacts/DjedStableCoin.json";
import djedReserveCoinArtifact from "../artifacts/DjedReserveCoin.json";
import {
  buildTx,
  convertInt,
  decimalScaling,
  decimalUnscaling,
  scaledPromise,
  web3Promise
} from "./helpers";

const BLOCKCHAIN_URI = "https://rpc-devnet-cardano-evm.c1.milkomeda.com/";
//const CHAIN_ID = 200101;
const DJED_ADDRESS = "0xa5D1ae7052785801f4681De9a9aA13294F1e8D3d"; // djedAddress
const ORACLE_ADDRESS = "0xf1E16aC91dC04a9583E45Dc95ef1C41d485eBd84"; // oracleAddress
const BC_DECIMALS = 18;
const SCALING_DECIMALS = 24; // scalingFixed

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

export const getOracleContract = (web3) => {
  const oracle = new web3.eth.Contract(oracleArtifact.abi, ORACLE_ADDRESS);
  return oracle;
};

export const getCoinContracts = async (djedContract, web3) => {
  const [stableCoinAddress, reserveCoinAddress] = await Promise.all([
    web3Promise(djedContract, "stableCoin"),
    web3Promise(djedContract, "reserveCoin")
  ]);
  const stableCoin = new web3.eth.Contract(djedStableCoinArtifact.abi, stableCoinAddress);
  const reserveCoin = new web3.eth.Contract(
    djedReserveCoinArtifact.abi,
    reserveCoinAddress
  );
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
  oracle,
  scDecimals,
  rcDecimals
) => {
  const [
    scaledNumberSc,
    scaledPriceSc,
    scaledNumberRc,
    scaledReserveBc,
    percentReserveRatio,
    scaledPriceRc
  ] = await Promise.all([
    scaledPromise(web3Promise(stableCoin, "totalSupply"), scDecimals),
    scaledPromise(web3Promise(oracle, "exchangeRate"), BC_DECIMALS),
    scaledPromise(web3Promise(reserveCoin, "totalSupply"), rcDecimals),
    scaledPromise(web3Promise(djed, "reserveBC"), BC_DECIMALS),
    scaledPromise(web3Promise(djed, "getReserveRatio"), SCALING_DECIMALS).then(
      (value) => (parseFloat(value) * 100).toString(10) + "%"
    ),
    scaledPromise(
      web3Promise(reserveCoin, "balanceOf", "0x1867Cd64DE4F9aEcfbC14846bc736cd7008dca40"),
      rcDecimals
    )
  ]);

  return {
    scaledNumberSc,
    scaledPriceSc,
    scaledNumberRc,
    scaledReserveBc,
    percentReserveRatio,
    scaledPriceRc
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
  const [scaledBalanceSc, scaledBalanceRc, scaledBalanceBc] = await Promise.all([
    scaledPromise(web3Promise(stableCoin, "balanceOf", account), scDecimals),
    scaledPromise(web3Promise(reserveCoin, "balanceOf", account), rcDecimals),
    scaledPromise(web3.eth.getBalance(account), BC_DECIMALS)
  ]);

  return {
    scaledBalanceSc,
    scaledBalanceRc,
    scaledBalanceBc
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

// reservecoin
export const tradeDataPriceBuyRc = (djed, rcDecimals, amountUnscaled) => {
  const amount = decimalUnscaling(amountUnscaled, rcDecimals);
  return web3Promise(djed, "getPriceBuyNReserveCoinsBC", amount.toString(10)).then(
    (value) => ({
      amountText: amountUnscaled,
      amountInt: amount,
      totalText: decimalScaling(value, rcDecimals),
      totalInt: value
    })
  );
};

export const tradeDataPriceSellRc = (djed, rcDecimals, amountUnscaled) => {
  const amount = decimalUnscaling(amountUnscaled, rcDecimals);
  return web3Promise(djed, "getPriceSellNReserveCoinsBC", amount.toString(10)).then(
    (value) => ({
      amountText: amountUnscaled,
      amountInt: amount,
      totalText: decimalScaling(value, rcDecimals),
      totalInt: value
    })
  );
};
export const buyRcTx = (djed, account, value) => {
  const data = djed.methods.buyReserveCoins().encodeABI();
  return buildTx(account, DJED_ADDRESS, value, data);
};

export const sellRcTx = (djed, account, amount) => {
  const data = djed.methods.sellReserveCoins(amount).encodeABI();
  return buildTx(account, DJED_ADDRESS, 0, data);
};

// stablecoin
export const tradeDataPriceBuySc = (djed, rcDecimals, amountUnscaled) => {
  const amount = decimalUnscaling(amountUnscaled, rcDecimals);
  return web3Promise(djed, "getPriceBuyNStableCoinsBC", amount.toString(10)).then(
    (value) => ({
      amountText: amountUnscaled,
      amountInt: amount,
      totalText: decimalScaling(value, rcDecimals),
      totalInt: value
    })
  );
};
export const tradeDataPriceSellSc = (djed, rcDecimals, amountUnscaled) => {
  const amount = decimalUnscaling(amountUnscaled, rcDecimals);
  return web3Promise(djed, "getPriceSellNStableCoinsBC", amount.toString(10)).then(
    (value) => ({
      amountText: amountUnscaled,
      amountInt: amount,
      totalText: decimalScaling(value, rcDecimals),
      totalInt: value
    })
  );
};

export const buyScTx = (djed, account, value) => {
  const data = djed.methods.buyStableCoins().encodeABI();
  return buildTx(account, DJED_ADDRESS, value, data);
};

export const sellScTx = (djed, account, amount) => {
  const data = djed.methods.sellStableCoins(amount).encodeABI();
  return buildTx(account, DJED_ADDRESS, 0, data);
};
