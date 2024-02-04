import React from "react";
import CoinIndicator from "../../atoms/CoinIndictor/CoinIndicator";
import "./_CoinCard.scss";
// import { decimalScaling } from "../../../utils/helpers";

const CHAIN_COIN = process.env.REACT_APP_CHAIN_COIN;

const CoinCard = ({
  coinIcon,
  coinName,
  priceAmount,
  sellPriceAmount,
  circulatingAmount,
  tokenName,
  equivalence
}) => {
  // const invPrice = 1e6 / parseFloat(priceAmount?.replaceAll(",", ""));
  // const invPriceScaled = decimalScaling(invPrice.toFixed(0).toString(10), 6);

  return (
    <div className="CoinCard">
      <CoinIndicator coinIcon={coinIcon} coinName={coinName} />
      <hr />
      {sellPriceAmount && priceAmount !== sellPriceAmount ? (
        <div className="PriceInfo">
          <span>Current Buy Price</span>
          <h3>{priceAmount} ${CHAIN_COIN}</h3>
          <span>Current Sell Price</span>
          <h3>{sellPriceAmount} ${CHAIN_COIN}</h3>
        </div>
      ) : (
        <div className="PriceInfo">
          <span>Current Price</span>
          <h3>{priceAmount} ${CHAIN_COIN}</h3>
        </div>
      )}
      <div className="AdditionalInfo">
        <div className="InfoItem">
          <span>Circulating Supply</span>
          <p>
            {circulatingAmount} {tokenName}
          </p>
          {equivalence ? <p>≈ {equivalence}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default CoinCard;
