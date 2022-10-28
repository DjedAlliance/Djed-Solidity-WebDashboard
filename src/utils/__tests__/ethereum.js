import { appendFees, BC_DECIMALS } from "../ethereum";
import { decimalUnscaling } from "../helpers";

it("Append fees to the BC amount", () => {
  const unscaledResult = decimalUnscaling("125", BC_DECIMALS);
  expect(appendFees(100, "5", "10", "5")).toEqual(unscaledResult);
});
