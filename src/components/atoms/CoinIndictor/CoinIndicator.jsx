import React from "react";
import "./_CoinIndicator.scss";

const CoinIndicator = ({ coinIcon, coinName }) => (
  <div className="CoinIndicator">
    <p className="CoinTitle">{coinName}</p>
  </div>
);

export default CoinIndicator;
