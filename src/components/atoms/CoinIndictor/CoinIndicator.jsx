import React from "react";
import "./_CoinIndicator.scss";

const CoinIndicator = ({ coinIcon, coinName }) => (
  <div className="CoinIndicator" role="heading" aria-level="3">
    {coinIcon && (
      <img
        src={coinIcon}
        alt={`${coinName} token icon`}
        className="CoinIcon"
        width="24"
        height="24"
        loading="lazy"
      />
    )}
    <p className="CoinTitle" itemProp="name">{coinName}</p>
  </div>
);

export default CoinIndicator;

