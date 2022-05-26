import React from "react";
import CoinIndicator from "../../atoms/CoinIndictor/CoinIndicator";
import "./_CoinCard.scss";

const CoinCard = ({ coinIcon, coinName, priceAmount, circulatingAmount, tokenName }) => (
  <div className="CoinCard">
    <CoinIndicator coinIcon={coinIcon} coinName={coinName} />
    <hr />
    <span>Current Price</span>
    <h3>milkADA {priceAmount}</h3>
    <div className="AdditionalInfo">
      <div className="InfoItem">
        <span>Circulating Supply</span>
        <p>
          {circulatingAmount} {tokenName}
        </p>
      </div>
      <div className="InfoItem">
        <span>Current Ratio</span>
        <p>
          1 milkADA = {1 / parseFloat(priceAmount)} {tokenName}
        </p>
      </div>
    </div>
  </div>
);

export default CoinCard;
