import Web3 from "web3";
import djedArtifact from "../artifacts/DjedProtocol.json";
import oracleArtifact from "../artifacts/AdaUsdSimpleOracle.json";
import { BN } from "web3-utils";

import djedStableCoinArtifact from "../artifacts/DjedStableCoin.json";
import djedReserveCoinArtifact from "../artifacts/DjedReserveCoin.json";
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

const BLOCKCHAIN_URI = "https://rpc-devnet-algorand-rollup.a1.milkomeda.com/";
export const CHAIN_ID = 200202;
const DJED_ADDRESS = "0xDB82328B50FF8DeF36e996Eb0DA211D4FD079Cce"; // djedAddress
//export const ORACLE_ADDRESS = "0x5A8E0B0B666A60Cf4f00E56A7C6C73FcE77eAaD6"; // oracleAddress
const BC_DECIMALS = 18;
const ORACLE_DECIMALS = 6;
const SCALING_DECIMALS = 24; // scalingFixed

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
    scaledPromise(web3Promise(djed, "getStableCoinWholeTargetPriceBC"), BC_DECIMALS), //oracle, "exchangeRate"), BC_DECIMALS),
    scaledPromise(web3Promise(reserveCoin, "totalSupply"), rcDecimals),
    scaledPromise(web3Promise(djed, "reserveBC"), BC_DECIMALS),
    percentScaledPromise(web3Promise(djed, "getReserveRatio"), SCALING_DECIMALS) /*.then(
      (value) => (parseFloat(value) * 100).toFixed(4) + "%"
    )*/,
    scaledPromise(web3Promise(djed, "getReserveCoinWholeBuyPriceBC"), BC_DECIMALS),
    scaledPromise(web3Promise(djed, "getReserveCoinWholeSellPriceBC"), BC_DECIMALS),
    scaledPromise(web3Promise(oracle, "exchangeRate"), ORACLE_DECIMALS)
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
  const [reserveRatioMin, reserveRatioMax, fee, thresholdNumberSc] = await Promise.all([
    percentScaledPromise(web3Promise(djed, "reserveRatioMin"), SCALING_DECIMALS),
    percentScaledPromise(web3Promise(djed, "reserveRatioMax"), SCALING_DECIMALS),
    percentScaledPromise(web3Promise(djed, "fee"), SCALING_DECIMALS),
    web3Promise(djed, "thresholdNumberSC")
  ]);

  return {
    reserveRatioMin,
    reserveRatioMax,
    fee,
    thresholdNumberSc
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
  const [[scaledBudgetSc, unscaledBudgetSc], [scaledBudgetRc, unscaledBudgetRc]] =
    await Promise.all([
      scaledUnscaledPromise(
        web3Promise(djed, "getAmountForValueBuyStableCoins", unscaledBalanceBc),
        scDecimals
      ),
      scaledUnscaledPromise(
        web3Promise(djed, "getAmountForValueBuyReserveCoins", unscaledBalanceBc),
        rcDecimals
      )
    ]);

  return {
    scaledBudgetSc,
    unscaledBudgetSc,
    scaledBudgetRc,
    unscaledBudgetRc
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
export const tradeDataPriceBuyRc = (djed, rcDecimals, amountScaled) =>
  tradeDataPriceCore(djed, "getPriceBuyNReserveCoinsBC", rcDecimals, amountScaled);

export const tradeDataPriceSellRc = (djed, rcDecimals, amountScaled) =>
  tradeDataPriceCore(djed, "getPriceSellNReserveCoinsBC", rcDecimals, amountScaled);

export const buyRcTx = (djed, account, value) => {
  const data = djed.methods.buyReserveCoins().encodeABI();
  return buildTx(account, DJED_ADDRESS, value, data);
};

export const sellRcTx = (djed, account, amount) => {
  const data = djed.methods.sellReserveCoins(amount).encodeABI();
  return buildTx(account, DJED_ADDRESS, 0, data);
};

export const checkBuyableRc = (djed, unscaledAmountRc, unscaledBudgetRc) => {
  if (new BN(unscaledAmountRc).gt(new BN(unscaledBudgetRc))) {
    return new Promise((r) => r(TRANSACTION_VALIDITY.INSUFFICIENT_BC));
  }
  return web3Promise(djed, "checkBuyableNReserveCoins", unscaledAmountRc).then(
    (buyable) =>
      buyable ? TRANSACTION_VALIDITY.OK : TRANSACTION_VALIDITY.RESERVE_RATIO_HIGH
  );
};

export const checkSellableRc = (djed, unscaledAmountRc, unscaledBalanceRc) => {
  if (new BN(unscaledAmountRc).gt(new BN(unscaledBalanceRc))) {
    return new Promise((r) => r(TRANSACTION_VALIDITY.INSUFFICIENT_RC));
  }
  return web3Promise(djed, "checkSellableNReserveCoins", unscaledAmountRc).then(
    (sellable) =>
      sellable ? TRANSACTION_VALIDITY.OK : TRANSACTION_VALIDITY.RESERVE_RATIO_LOW
  );
};

export const getMaxBuyRc = (
  djed,
  rcDecimals,
  unscaledNumberSc,
  thresholdNumberSc,
  unscaledBudgetRc
) => {
  if (new BN(unscaledNumberSc).lt(new BN(thresholdNumberSc))) {
    return new Promise((r) => r(decimalScaling(unscaledBudgetRc, rcDecimals)));
  }
  return scaledPromise(
    web3Promise(djed, "getMaxBuyableReserveCoins").then((protocolMax) =>
      BN.min(new BN(protocolMax), new BN(unscaledBudgetRc))
    ),
    rcDecimals
  );
};

export const getMaxSellRc = (djed, rcDecimals, unscaledBalanceRc) => {
  return scaledPromise(
    web3Promise(djed, "getMaxSellableReserveCoins").then((unscaledMax) =>
      BN.min(new BN(unscaledBalanceRc), new BN(unscaledMax))
    ),
    rcDecimals
  );
};

// stablecoin
export const tradeDataPriceBuySc = (djed, scDecimals, amountScaled) =>
  tradeDataPriceCore(djed, "getPriceBuyNStableCoinsBC", scDecimals, amountScaled);

export const tradeDataPriceSellSc = (djed, scDecimals, amountScaled) =>
  tradeDataPriceCore(djed, "getPriceSellNStableCoinsBC", scDecimals, amountScaled);

export const buyScTx = (djed, account, value) => {
  const data = djed.methods.buyStableCoins().encodeABI();
  return buildTx(account, DJED_ADDRESS, value, data);
};

export const sellScTx = (djed, account, amount) => {
  const data = djed.methods.sellStableCoins(amount).encodeABI();
  return buildTx(account, DJED_ADDRESS, 0, data);
};

export const checkBuyableSc = (djed, unscaledAmountSc, unscaledBudgetSc) => {
  if (new BN(unscaledAmountSc).gt(new BN(unscaledBudgetSc))) {
    return new Promise((r) => r(TRANSACTION_VALIDITY.INSUFFICIENT_BC));
  }
  return web3Promise(djed, "checkBuyableNStableCoins", unscaledAmountSc).then((buyable) =>
    buyable ? TRANSACTION_VALIDITY.OK : TRANSACTION_VALIDITY.RESERVE_RATIO_LOW
  );
};

export const checkSellableSc = (unscaledAmountSc, unscaledBalanceSc) =>
  new Promise((r) =>
    r(
      new BN(unscaledAmountSc).gt(new BN(unscaledBalanceSc))
        ? TRANSACTION_VALIDITY.INSUFFICIENT_SC
        : TRANSACTION_VALIDITY.OK
    )
  );

export const getMaxBuySc = (djed, scDecimals, unscaledBudgetSc) => {
  return scaledPromise(
    web3Promise(djed, "getMaxBuyableStableCoins").then((protocolMax) =>
      BN.min(new BN(protocolMax), new BN(unscaledBudgetSc))
    ),
    scDecimals
  );
};

// maxSellSc is just the current account balance, no additional protocol limits:
export const getMaxSellSc = (scaledBalanceSc) => new Promise((r) => r(scaledBalanceSc));
