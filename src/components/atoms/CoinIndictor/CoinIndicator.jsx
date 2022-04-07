import React from "react";
import "./_CoinIndicator.scss";

const CoinIndicator = ({ coinIcon, coinName }) => (
  <div className="CoinIndicator">
    <img className="CoinIcon" src={coinIcon} alt="" />
    <p className="CoinTitle">{coinName}</p>
  </div>
);

export default CoinIndicator;
