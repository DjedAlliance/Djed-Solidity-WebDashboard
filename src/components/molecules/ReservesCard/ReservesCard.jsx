import React from "react";
import CoinIndicator from "../../atoms/CoinIndictor/CoinIndicator";
import NumberItem from "../../atoms/NumberItem/NumberItem";
import "./_ReservesCard.scss";

const ReservesCard = ({ coinIcon, coinName, priceAmount, equivalence, reserveRatio }) => (
  <div className="ReservesCard">
    <CoinIndicator coinIcon={coinIcon} coinName={coinName} />
    <hr />
    <div className="Content">
      <div className="BaseReserves">
        <span>Base Reserves</span>
        <h3>{priceAmount} milkADA</h3>
        <p>{equivalence}</p>
      </div>
      <div className="ReservesRatio">
        <NumberItem amount="2.8%" label="Reserve %" />
        <NumberItem amount={reserveRatio} label="Reserve Ratio" />
      </div>
    </div>
  </div>
);

export default ReservesCard;
