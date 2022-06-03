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

export function reverseString(s) {
  return s.split("").reverse().join("");
}

function intersperseCommas(s) {
  let newString = s.replace(/(.{3})/g, "$1,");
  if (s.length % 3 === 0) {
    return newString.slice(0, newString.length - 1);
  } else {
    return newString;
  }
}

export function decimalScaling(unscaledString, decimals, show = 3) {
  if (decimals <= 0) {
    return unscaledString + "0".repeat(-decimals);
  }
  let prefix;
  let suffix;
  if (unscaledString.length <= decimals) {
    prefix = "0";
    suffix = "0".repeat(decimals - unscaledString.length) + unscaledString;
  } else {
    prefix = unscaledString.slice(0, -decimals);
    suffix = unscaledString.slice(-decimals);
  }
  suffix = suffix.slice(0, show);
  suffix = intersperseCommas(suffix);
  prefix = reverseString(intersperseCommas(reverseString(prefix)));
  return prefix + "." + suffix;
}

export function decimalUnscaling(scaledString, decimals) {
  scaledString = scaledString.replaceAll(",", "");
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

export function percentScaledPromise(promise, scaling) {
  return promise.then(
    (value) => decimalScaling(value.toString(10), scaling - 2, 2) + "%"
  );
}
