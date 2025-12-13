import React from "react";
import CoinIndicator from "../../atoms/CoinIndictor/CoinIndicator";
import NumberItem from "../../atoms/NumberItem/NumberItem";
import "./_ReservesCard.scss";

const CHAIN_COIN = process.env.REACT_APP_CHAIN_COIN;

const ReservesCard = ({
  coinIcon,
  coinName,
  priceAmount,
  equivalence,
  reserveRatio,
  showCurrentReserveRatio,
  isShu
}) => (
  <div className="ReservesCard">
    <CoinIndicator coinIcon={coinIcon} coinName={coinName} />
    <hr />
    <div className="Content">
      <div className="BaseReserves">
        <span>BaseCoin ({CHAIN_COIN}) Reserves</span>
        <h3>
          {priceAmount} {CHAIN_COIN}
        </h3>
        <p>≈ {equivalence}</p>
      </div>
      <div className="ReservesRatio">
        {showCurrentReserveRatio && (
          <NumberItem
            amount={isShu ? `[${reserveRatio[0]} -- ${reserveRatio[1]}]` : reserveRatio}
            label="Current Reserve Ratio"
          />
        )}
      </div>
    </div>
  </div>
);

export default ReservesCard;
