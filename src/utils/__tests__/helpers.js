import { TRANSACTION_VALIDITY } from "../constants";
import { SCALING_DECIMALS } from "../ethereum";
import {
  calculateBcUsdEquivalent,
  calculateRcUsdEquivalent,
  decimalScaling,
  decimalUnscaling,
  getScAdaEquivalent,
  percentageScale,
  reverseString,
  validatePositiveNumber
} from "../helpers";

describe("Scaling functions", () => {
  const decimals = 18;

  it("Scale dacimal amount", () => {
    //Unscaled amount 0.023 * 10^18
    const amount = "23000000000000000";
    expect(decimalScaling(amount, decimals)).toEqual("0.023");
  });

  it("Scale thousand amount", () => {
    //Unscaled amount 230000 * 10^18
    const amount = "230000000000000000000000";
    expect(decimalScaling(amount, decimals)).toEqual("230,000.000");
  });

  it("Scale million amount", () => {
    //Unscaled amount 230,000,000 * 10^18
    const amount = "230000000000000000000000000";
    expect(decimalScaling(amount, decimals)).toEqual("230,000,000.000");
  });
});

describe("Unscaling functions", () => {
  const decimals = 18;

  it("Unscale amount", () => {
    const amount = "0.023";
    expect(decimalUnscaling(amount, decimals)).toEqual("0023000000000000000");
  });

  it("Unscale thousand amount", () => {
    const amount = "230,000.000";
    expect(decimalUnscaling(amount, decimals)).toEqual("230000000000000000000000");
  });

  it("Unscale million amount", () => {
    const amount = "230000000";
    expect(decimalUnscaling(amount, decimals)).toEqual("230000000000000000000000000");
  });
});

describe("Percentage scale", () => {
  it("Percentage scale 1%", () => {
    const amount = "1";
    const decimals = SCALING_DECIMALS;
    const expectedResult = "1.00";

    const amountUnscaled = decimalUnscaling(amount, decimals - 2);
    expect(percentageScale(amountUnscaled, decimals)).toEqual(expectedResult);
  });

  it("Percentage scale 0.1%", () => {
    const amount = "0.1";
    const decimals = SCALING_DECIMALS;
    const expectedResult = "0.10";

    const amountUnscaled = decimalUnscaling(amount, decimals - 2);
    expect(percentageScale(amountUnscaled, decimals)).toEqual(expectedResult);
  });

  it("Percentage scale 100%", () => {
    const amount = "100";
    const decimals = SCALING_DECIMALS;
    const expectedResult = "100.00";

    const amountUnscaled = decimalUnscaling(amount, decimals - 2);
    expect(percentageScale(amountUnscaled, decimals)).toEqual(expectedResult);
  });
});

describe("Currency conversions", () => {
  const coinsDetails = {
    scaledNumberSc: "3.802",
    unscaledNumberSc: "3802822",
    scaledPriceSc: "10.000",
    scaledNumberRc: "12.602",
    scaledReserveBc: "59.691",
    percentReserveRatio: "0.00%",
    scaledBuyPriceRc: "1.718",
    scaledSellPriceRc: "1.718",
    scaledScExchangeRate: "10.000"
  };

  it("Calculate base coin to USD equivalent", () => {
    const amount = 1.554;
    expect(calculateBcUsdEquivalent(coinsDetails, amount)).toEqual("0.155");
  });

  it("Calculate reserve coin to USD equivalent", () => {
    const amount = 4.538;
    expect(calculateRcUsdEquivalent(coinsDetails, amount)).toEqual("0.779");
  });

  it("Calculate stable coin to USD equivalent", () => {
    const amount = 1.734;
    expect(getScAdaEquivalent(coinsDetails, amount)).toEqual("17.340 mADA");
  });
});

describe("Validate positive number", () => {
  it("Validate negative input", () => {
    const amount = -1.234;
    expect(validatePositiveNumber(amount.toString())).toEqual(
      TRANSACTION_VALIDITY.NEGATIVE_INPUT
    );
  });

  it("Validate zero input", () => {
    const amount = 0;
    expect(validatePositiveNumber(amount.toString())).toEqual(
      TRANSACTION_VALIDITY.ZERO_INPUT
    );
  });

  it("Validate positive input", () => {
    const amount = 1.234;
    expect(validatePositiveNumber(amount.toString())).toEqual(TRANSACTION_VALIDITY.OK);
  });
});

describe("Reverse string", () => {
  it("Reverse string", () => {
    const string = "example";
    expect(reverseString(string)).toEqual("elpmaxe");
  });

  it("Reverse string with spaces", () => {
    const string = "some example string";
    expect(reverseString(string)).toEqual("gnirts elpmaxe emos");
  });
});
