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
  reserveRatioMin,
  reserveRatioMax,
  showCurrentReserveRatio
}) => (
  <div className="ReservesCard">
    <CoinIndicator coinIcon={coinIcon} coinName={coinName} />
    <hr />
    <div className="Content">
      <div className="BaseReserves">
        <span>BaseCoin (${CHAIN_COIN}) Reserves</span>
        <h3>{priceAmount} ${CHAIN_COIN}</h3>
        <p>≈ {equivalence}</p>
      </div>
      <div className="ReservesRatio">
        <NumberItem amount={reserveRatioMin} label="Minimum Reserve Ratio" />
        <NumberItem amount={reserveRatioMax} label="Maximum Reserve Ratio" />
        {showCurrentReserveRatio && (
          <NumberItem amount={reserveRatio} label="Current Reserve Ratio" />
        )}
      </div>
    </div>
  </div>
);

export default ReservesCard;
