// TODO: remove unused functions and remove unncessary promises

import { BN } from "web3-utils";

export function web3Promise(contract, method, ...args) {
  return contract.methods[method](...args).call();
}

export function buildTx(from_, to_, value_, data_) {
  return {
    to: to_,
    from: from_,
    value: "0x" + new BN(value_).toString(16),
    data: data_
  };
}

export function convertInt(promise) {
  return promise.then((value) => parseInt(value));
}

export function decimalScaling(scaledString, decimals) {
  var res;
  if (scaledString.length <= decimals) {
    res = "0." + "0".repeat(decimals - scaledString.length) + scaledString;
  } else {
    res = scaledString.slice(0, -decimals) + "." + scaledString.slice(-decimals);
  }
  console.log(`Scaled ${scaledString} with dec ${decimals} to ${res}.`);
  return res;
}

export function decimalUnscaling(scaledString, decimals) {
  let pos = scaledString.indexOf(".");
  if (pos < 0) {
    return scaledString + "0".repeat(decimals);
  }

  let s = scaledString.slice(0, pos) + scaledString.slice(pos + 1, pos + 1 + decimals);
  if (scaledString.length - pos - 1 < decimals) {
    s += "0".repeat(decimals - (scaledString.length - pos - 1));
  }
  return s;
}

export function scaledPromise(promise, scaling) {
  return promise.then((value) => decimalScaling(value.toString(10), scaling));
}

export function scaledUnscaledPromise(promise, scaling) {
  return promise.then((value) => [decimalScaling(value.toString(10), scaling), value]);
}
