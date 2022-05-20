//import Web3 from "web3";
//import { AbiItem } from "web3-utils";
import djedArtifact from "../artifacts/DjedProtocol.json";
import djedStableCoinArtifact from "../artifacts/DjedStableCoin.json";
import djedReserveCoinArtifact from "../artifacts/DjedReserveCoin.json";
import oracleArtifact from "../artifacts/AdaUsdSimpleOracle.json";
//import detectEthereumProvider from '@metamask/detect-provider';

const BC_DECIMALS = 18;
const SCALING_DECIMALS = 24;

function decimalScaling(scaledString, decimals) {
    if (scaledString.length <= decimals) {
        return "0." + "0".repeat(decimals - scaledString.length) + scaledString;
    } else {
        return scaledString.slice(0, -decimals) + "." + scaledString.slice(-decimals);
    }
}

function scaledPromise(promise, scaling) {
    return promise.then(value => decimalScaling(value, scaling));
}

function convertInt(promise) {
    return promise.then(value => parseInt(value));
}

function web3Promise(contract, method, ...args) {
    return contract.methods[method](...args).call();
}

function buildTx(from_, to_, value_, data_) {
    return {
        to: to_,
        from: from_,
        value: "0x" + value_.toString(16),
        data: data_,
    };
}

export class MinimalDjedWrapper {
    constructor(web3_, djedAddress_, oracleAddress_) {
        this.web3 = web3_;
        //this.chainId = chainId_;
        this.djedAddress = djedAddress_;
        this.oracleAddress = oracleAddress_;
        this.data = {};
        this.scalingFixed = SCALING_DECIMALS;
    }

    setMetamask(ethereum_, accounts_) {
        this.ethereum = ethereum_;
        this.accounts = accounts_;
    }

    // Must be called exactly once before using the web3 promises
    async initialize() {
        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask might be installed!');
        } else {
            console.log('MetaMask is not installed!');
        }

        this.djed = new this.web3.eth.Contract(
            djedArtifact.abi,
            this.djedAddress
        );
        this.oracle = new this.web3.eth.Contract(
            oracleArtifact.abi,
            this.oracleAddress
        );
        
        [
            this.stableCoinAddress,
            this.reserveCoinAddress
        ] = await Promise.all([
            this.promiseStableCoinAddress(),
            this.promiseReserveCoinAddress()
        ]);

        this.stableCoin = new this.web3.eth.Contract(
            djedStableCoinArtifact.abi,
            this.stableCoinAddress
        );
        this.reserveCoin = new this.web3.eth.Contract(
            djedReserveCoinArtifact.abi,
            this.reserveCoinAddress
        );

        [
            this.scDecimals,
            this.rcDecimals
        ] = await Promise.all([
            this.promiseDecimalsSc(),
            this.promiseDecimalsRc()
        ]);
    }

    async getData() {    
        [
            this.data.scaledNumberSc,
            this.data.scaledPriceSc,
            this.data.scaledNumberRc,
            this.data.scaledReserveBc,
            this.data.percentReserveRatio,
            this.data.scaledPriceRc
        ] = await Promise.all([
            this.promiseScaledNumberSc(),
            this.promiseScaledExchangeRate(),
            this.promiseScaledNumberRc(),
            this.promiseScaledReserveBc(),
            this.promisePercentReserveRatio(),
            this.promiseScaledBalanceRc("0x1867Cd64DE4F9aEcfbC14846bc736cd7008dca40")
        ]);
    }

    testBuy() {
      console.log("Test buying rc...")
      this.promiseBuyRc(this.accounts[0], 1000000)
      .then(console.log)
      .catch(console.err);
    };

    promiseTx(tx) {
        if (this.accounts.length === 0) {
            return Promise.reject(new Error("Metamask not connected!"));
        }
        return this.ethereum.request({
            method: 'eth_sendTransaction',
            params: [tx]
        });
    }

    promiseBuySc(account, value) {
        return this.promiseTx(this.buyScTx(account, value));
    }

    promiseSellSc(account, amount) {
        return this.promiseTx(this.sellScTx(account, amount));
    }

    promiseBuyRc(account, value) {
        return this.promiseTx(this.buyRcTx(account, value));
    }

    promiseSellRc(account, amount) {
        return this.promiseTx(this.sellRcTx(account, amount));
    }

    buyScaledRc(scaledValue) {
        let value = scaledValue;
        this.promiseBuySc(this.accounts[0], value)
        .then(console.log)
        .catch(console.err);
    }

    sellScaledRc(scaledAmount) {
        let amount = scaledAmount;
        this.promiseSellSc(this.accounts[0], amount)
        .then(console.log)
        .catch(console.err);
    }

    /*
    sendTransaction(tx, onSuccess = console.log, onError = console.err) {
        this.promiseTx(tx)
        .then(onSuccess)
        .catch(onError);
    }*/

    sendBuySc(value, account = this.accounts[0], onSuccess = console.log, onError = console.err) {
        this.promiseBuySc(account, value)
        .then(onSuccess)
        .catch(onError);
    }


    // Transaction building methods:

    buyScTx(account, value) {
        const data = this.djed.methods.buyStableCoins().encodeABI();
        return buildTx(account, this.djedAddress, value, data);
    }

    sellScTx(account, amount) {
        const data = this.djed.methods.sellStableCoins(amount).encodeABI();
        return buildTx(account, this.djedAddress, 0, data);
    }

    buyRcTx(account, value) {
        const data = this.djed.methods.buyReserveCoins().encodeABI();
        return buildTx(account, this.djedAddress, value, data);
    }

    sellRcTx(account, amount) {
        const data = this.djed.methods.sellReserveCoins(amount).encodeABI();
        return buildTx(account, this.djedAddress, 0, data);
    }

    // Scaling helper methods:

    scaleFixed(promise) {
        return scaledPromise(promise, this.scalingFixed);
    }

    scaleSc(promise) {
        return scaledPromise(promise, this.scDecimals);
    }

    scaleRc(promise) {
        return scaledPromise(promise, this.rcDecimals);
    }

    scaleBc(promise) {
        return scaledPromise(promise, BC_DECIMALS);
    }

    // StableCoin web3 promises:

    promiseNumberSc() {
        return web3Promise(this.stableCoin, "totalSupply");
    }

    promiseBalanceSc(account) {
        return web3Promise(this.stableCoin, "balanceOf", account);
    }

    promiseRawDecimalsSc() {
        return web3Promise(this.stableCoin, "decimals");
    }

    promiseScaledNumberSc() {
        return this.scaleSc(this.promiseNumberSc());
    }

    promiseScaledBalanceSc(account) {
        return this.scaleSc(this.promiseBalanceSc(account))
    }

    promiseDecimalsSc() {
        return convertInt(this.promiseRawDecimalsSc());
    }

    // ReserveCoin web3 promises:

    promiseNumberRc() {
        return web3Promise(this.reserveCoin, "totalSupply");
    }

    promiseBalanceRc(account) {
        return web3Promise(this.reserveCoin, "balanceOf", account);
    }

    promiseRawDecimalsRc() {
        return web3Promise(this.reserveCoin, "decimals");
    }

    promiseScaledNumberRc() {
        return this.scaleRc(this.promiseNumberRc());
    }

    promiseScaledBalanceRc(account) {
        return this.scaleRc(this.promiseBalanceRc(account))
    }

    promiseDecimalsRc() {
        return convertInt(this.promiseRawDecimalsRc());
    }

    // Oracle web3 promises:

    promiseExchangeRate() {
        return web3Promise(this.oracle, "exchangeRate");
    }

    promiseScaledExchangeRate() {
        return this.scaleBc(this.promiseExchangeRate());
    }

    // Djed web3 promises:

    promiseStableCoinAddress() {
        return web3Promise(this.djed, "stableCoin");
    }

    promiseReserveCoinAddress() {
        return web3Promise(this.djed, "reserveCoin");
    }

    promiseReserveRatio() {
        return web3Promise(this.djed, "getReserveRatio");
    }

    promiseReserveBc() {
        return web3Promise(this.djed, "reserveBC");
    }

    promisePriceBuySc(amount) {
        return web3Promise(this.djed, "getPriceBuyNStableCoinsBC", amount.toString(10));
    }

    promisePriceSellSc(amount) {
        return web3Promise(this.djed, "getPriceSellNStableCoinsBC", amount.toString(10));
    }

    promisePriceBuyRc(amount) {
        return web3Promise(this.djed, "getPriceBuyNReserveCoinsBC", amount.toString(10));
    }

    promisePriceSellRc(amount) {
        return web3Promise(this.djed, "getPriceSellNReserveCoinsBC", amount.toString(10));
    }

    promiseScaledReserveRatio() {
        return this.scaleFixed(this.promiseReserveRatio());
    }

    promisePercentReserveRatio() {
        return this.promiseScaledReserveRatio()
            .then(value => (parseFloat(value) * 100).toString(10) + "%");
    }

    promiseScaledReserveBc() {
        return this.scaleBc(this.promiseReserveBc());
    }

    promiseScaledPriceBuySc(amount) {
        return this.scaleBc(this.promisePriceBuySc);
    }
}