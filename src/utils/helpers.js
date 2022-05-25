// TODO: remove unused functions and remove unncessary promises

export function web3Promise(contract, method, ...args) {
  return contract.methods[method](...args).call();
}

export function buildTx(from_, to_, value_, data_) {
  return {
    to: to_,
    from: from_,
    value: "0x" + value_.toString(16),
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
export function decimalUnscaling(normalizedString, decimals) {
  let pos = normalizedString.indexOf(".");
  if (pos < 0) {
    return parseInt(normalizedString) * 10 ** decimals;
  }

  let s =
    normalizedString.slice(0, pos) + normalizedString.slice(pos + 1, pos + 1 + decimals);
  if (normalizedString.length - pos - 1 < decimals) {
    s += "0".repeat(decimals - (normalizedString.length - pos - 1));
  }
  return parseInt(s);
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
