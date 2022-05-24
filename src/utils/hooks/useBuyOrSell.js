import { useState } from "react";
import { BUY_SELL_OPTIONS } from "../constants";

const useBuyOrSell = () => {
  const [buyOrSell, setBuySell] = useState(BUY_SELL_OPTIONS.BUY);

  const isBuyActive = buyOrSell === BUY_SELL_OPTIONS.BUY;
  const isSellActive = buyOrSell === BUY_SELL_OPTIONS.SELL;

  const setBuyOrSell = () => {
    setBuySell(isBuyActive ? BUY_SELL_OPTIONS.SELL : BUY_SELL_OPTIONS.BUY);
  };

  return {
    buyOrSell,
    isBuyActive,
    isSellActive,
    setBuyOrSell: setBuyOrSell
  };
};
export default useBuyOrSell;
