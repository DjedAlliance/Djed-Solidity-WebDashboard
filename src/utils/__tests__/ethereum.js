import { BigNumber } from "@ethersproject/bignumber";
import {
  appendFees,
  BC_DECIMALS,
  calculateTxFees,
  deductFees,
  convertToBC,
  SCALING_DECIMALS
} from "../ethereum";
import { decimalScaling, decimalUnscaling, percentageScale } from "../helpers";

//Fetched from the contract SC price
const scPrice = "10000000000000000000";
//Fetched SC decimals
const scDecimals = "6";
//Fetched from the contract RC price
const rcPrice = "1718894511290670509";
//Fetched SC decimals
const rcDecimals = "6";
//Fetched from contract fee 1%
const fee = "10000000000000000000000";
//Fetched from contract treasury fee 0.24%
const treasuryFee = "2499999999995133547184";
//Fixed feeUI
const feeUI = "0.2";
//Scaled fee expressed in % (e.g. 1)
const percentageScaleFee = percentageScale(fee, SCALING_DECIMALS);
//Scaled treasury fee expressed in % (e.g. 0.24)
const percentageScaleTreasuryFee = percentageScale(treasuryFee, SCALING_DECIMALS);

//TODO refactor append fees to receive unscaled amounts and BigNumber
it("Append fees to the BC amount", () => {
  //Amount of base coin: 100
  const amountBC = "100";
  //Fetched from contract fee 10%
  const f = "10";
  //Fetched from contract treasury fee 5%
  const f_t = "5";
  //Fetched from contract fee UI 5%
  const f_ui = "5";
  //Expected appended fees result
  const expectedResult = "125";

  expect(appendFees(amountBC, f_t, f, f_ui)).toEqual(
    decimalUnscaling(expectedResult, BC_DECIMALS)
  );
});

it("Deduct fees from the BC amount", () => {
  //Amount of base coin: 10
  const amountBC = "10000000000000000000"; //10 * 10^18
  //Expected deductFeesResult
  const expectedResult = "9855000000000048665";

  expect(deductFees(amountBC, fee, treasuryFee)).toEqual(BigNumber.from(expectedResult));
});

it("Calculate transaction fees", () => {
  //Amount of base coin 10
  const amountBC = "10000000000000000000"; //10 * 10^18

  expect(calculateTxFees(amountBC, fee, treasuryFee)).toEqual({
    f: BigNumber.from("100000000000000000"),
    f_ui: BigNumber.from("20000000000000000"),
    f_t: BigNumber.from("24999999999951335")
  });
});

describe("Convert SC/RC to BC", () => {
  /**
   * Function that simulates convertToBC function
   * @param {*} amount Amount of SC or RC to convert
   * @param {*} expectedResult Expected converted result
   * @returns
   */
  const testConvertToBCAmount = (amount, expectedResult, price, decimals) =>
    expect(convertToBC(decimalUnscaling(amount, scDecimals), price, decimals)).toEqual(
      BigNumber.from(expectedResult)
    );

  it("Convert SC amount to base coin amount", () => {
    const amount = "1";
    const expectedResult = "10000000000000000000";
    testConvertToBCAmount(amount, expectedResult, scPrice, scDecimals);
  });

  it("Convert RC amount to base coin amount", () => {
    const amount = "1";
    const expectedResult = "1718894511290670509";
    testConvertToBCAmount(amount, expectedResult, rcPrice, rcDecimals);
  });
});

describe("Calculate BUY SC", () => {
  /**
   * Function that simulates buy SC feature
   * @param {*} amountRC Amount of SC to buy
   * @param {*} expectedResult Amount expressed in BC with calculated fees
   */
  const testBuySC = (amountSC, expectedResult) => {
    const amountBC = convertToBC(
      decimalUnscaling(amountSC, scDecimals),
      scPrice,
      scDecimals
    ).toString();

    expect(
      appendFees(
        decimalScaling(amountBC, BC_DECIMALS).replaceAll(",", ""),
        percentageScaleTreasuryFee,
        percentageScaleFee,
        feeUI
      )
    ).toEqual(expectedResult);
  };

  it("Buy 1 SC", () => {
    const amountSC = "1";
    const expectedResult = "10146103896103895000";
    testBuySC(amountSC, expectedResult);
  });

  it("Buy 1.12345 SC", () => {
    const amountSC = "1.12345";
    const expectedResult = "11398133116883116000";
    testBuySC(amountSC, expectedResult);
  });

  it("Buy 1000 SC", () => {
    const amountSC = "1000";
    const expectedResult = "10146103896103896000000";
    testBuySC(amountSC, expectedResult);
  });
});

describe("Calculate SELL SC", () => {
  /**
   * Function that simulates sell SC feature
   * @param {*} amountRC Amount of SC to sell
   * @param {*} expectedResult Amount expressed in BC with calculated fees
   */
  const testSellSC = (amountSC, expectedResult) => {
    const amountBC = convertToBC(
      decimalUnscaling(amountSC, scDecimals),
      scPrice,
      scDecimals
    ).toString();

    expect(deductFees(amountBC, fee, treasuryFee).toString()).toEqual(expectedResult);
  };

  it("Sell 1 SC", () => {
    const amountSC = "1";
    const expectedResult = "9855000000000048665";
    testSellSC(amountSC, expectedResult);
  });

  it("Sell 1.12345 SC", () => {
    const amountSC = "1.12345";
    const expectedResult = "11071599750000054673";
    testSellSC(amountSC, expectedResult);
  });

  it("Sell 1000 SC", () => {
    const amountSC = "1000";
    const expectedResult = "9855000000000048664529";
    testSellSC(amountSC, expectedResult);
  });
});

describe("Calculate BUY RC", () => {
  /**
   * Function that simulates buy RC feature
   * @param {*} amountRC Amount of RC to buy
   * @param {*} expectedResult Amount expressed in BC with calculated fees
   */
  const testBuyRC = (amountRC, expectedResult) => {
    const amountBC = convertToBC(
      decimalUnscaling(amountRC, rcDecimals),
      rcPrice,
      rcDecimals
    ).toString();

    expect(
      appendFees(
        decimalScaling(amountBC, BC_DECIMALS).replaceAll(",", ""),
        percentageScaleTreasuryFee,
        percentageScaleFee,
        feeUI
      )
    ).toEqual(expectedResult);
  };

  it("Buy 1 RC", () => {
    const amountRC = "1";
    const expectedResult = "1743100649350649300";
    testBuyRC(amountRC, expectedResult);
  });

  it("Buy 1.12345 RC", () => {
    const amountRC = "1.12345";
    const expectedResult = "1959212662337662200";
    testBuyRC(amountRC, expectedResult);
  });

  it("Buy 1000 RC", () => {
    const amountRC = "1000";
    const expectedResult = "1744007711038961000000";
    testBuyRC(amountRC, expectedResult);
  });
});

describe("Calculate SELL RC", () => {
  /**
   * Function that simulates sell RC feature
   * @param {*} amountRC  Amount of RC to sell
   * @param {*} expectedResult Amount expressed in BC with calculated fees
   */

  const testSellRC = (amountRC, expectedResult) => {
    const amountBC = convertToBC(
      decimalUnscaling(amountRC, rcDecimals),
      rcPrice,
      rcDecimals
    ).toString();

    expect(deductFees(amountBC, fee, treasuryFee).toString()).toEqual(expectedResult);
  };

  it("Sell 1 RC", () => {
    const amountRC = "1";
    const expectedResult = "1693970540876964152";
    testSellRC(amountRC, expectedResult);
  });

  it("Sell 1.12345 RC", () => {
    const amountRC = "1.12345";
    const expectedResult = "1903091204148225378";
    testSellRC(amountRC, expectedResult);
  });

  it("Sell 1000 RC", () => {
    const amountRC = "1000";
    const expectedResult = "1693970540876964151539";
    testSellRC(amountRC, expectedResult);
  });
});
