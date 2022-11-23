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
  const unscaledResult = decimalUnscaling("125", BC_DECIMALS);
  expect(appendFees(100, "5", "10", "5")).toEqual(unscaledResult);
});

it("Deduct fees from the BC amount", () => {
  const amountBC = "10000000000000000000";
  const f = "100000000000000000";
  const f_t = "24999999999951335";
  const f_ui = "2000000000000000000";
  expect(
    deductFees(amountBC, BigNumber.from(f), BigNumber.from(f_ui), BigNumber.from(f_t))
  ).toEqual(BigNumber.from("7875000000000048665"));
});

it("Calculate transaction fees", () => {
  const amountBC = "10000000000000000000";
  const fee = "10000000000000000000000";
  const treasuryFee = "2499999999995133547184";
  expect(calculateTxFees(amountBC, fee, treasuryFee)).toEqual({
    f: BigNumber.from("100000000000000000"),
    f_ui: BigNumber.from("2000000000000000000"),
    f_t: BigNumber.from("24999999999951335")
  });
});

it("Converts coin amount to base coin amount", () => {
  const amount = "1000000";
  const decimals = 6;
  const price = "10000000000000000000";
  expect(convertToBC(amount, price, decimals)).toEqual(
    BigNumber.from("10000000000000000000")
  );
});
