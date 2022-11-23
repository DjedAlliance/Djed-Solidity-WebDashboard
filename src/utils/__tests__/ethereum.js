import { BigNumber } from "@ethersproject/bignumber";
import {
  appendFees,
  BC_DECIMALS,
  calculateTxFees,
  deductFees,
  convertToBC
} from "../ethereum";
import { decimalUnscaling } from "../helpers";

it("Append fees to the BC amount", () => {
  //Amount of base coin: 100
  const amountBC = 100;
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
  //Calculated 1% fee from amountBC via calculateTxFees function
  const f = "100000000000000000";
  //Calculated 0.24% treasury fee from amountBC via calculateTxFees function
  const f_t = "24999999999951335";
  //Calculated 0.2% fee UI from amountBC via calculateTxFees function
  const f_ui = "2000000000000000000";
  //Expected deductFeesResult
  const expectedResult = "7875000000000048665";

  expect(
    deductFees(amountBC, BigNumber.from(f), BigNumber.from(f_ui), BigNumber.from(f_t))
  ).toEqual(BigNumber.from(expectedResult));
});

it("Calculate transaction fees", () => {
  //Amount of base coin 10
  const amountBC = "10000000000000000000"; //10 * 10^18
  //Fetched from contract fee 1%
  const fee = "10000000000000000000000";
  //Fetched from contract treasury fee 0.24%
  const treasuryFee = "2499999999995133547184";

  expect(calculateTxFees(amountBC, fee, treasuryFee)).toEqual({
    f: BigNumber.from("100000000000000000"),
    f_ui: BigNumber.from("2000000000000000000"),
    f_t: BigNumber.from("24999999999951335")
  });
});

it("Converts coin amount to base coin amount", () => {
  //SC or RC amount 1
  const amount = "1000000"; //1 * 10^6
  //SC or RC decimals
  const decimals = 6;
  //SC or RC price: 10
  const price = "10000000000000000000"; //10 * 10^18
  //Expected converted result
  const expectedResult = "10000000000000000000";

  expect(convertToBC(amount, price, decimals)).toEqual(BigNumber.from(expectedResult));
});
