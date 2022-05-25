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
  if (scaledString.length <= decimals) {
    return "0." + "0".repeat(decimals - scaledString.length) + scaledString;
  } else {
    return scaledString.slice(0, -decimals) + "." + scaledString.slice(-decimals);
  }
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
  return promise.then((value) => decimalScaling(value, scaling));
}

function duoScaledPromise(promise, scaling) {
  return promise.then((value) => ({
    raw: value,
    scaled: decimalScaling(value, scaling)
  }));
}
