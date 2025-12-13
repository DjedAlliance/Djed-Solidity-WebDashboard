import React from "react";
import CoinIndicator from "../../atoms/CoinIndictor/CoinIndicator";
import "./_CoinCard.scss";

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
  return (
    <article
      className="CoinCard"
      aria-label={`${coinName} statistics`}
      itemScope
      itemType="https://schema.org/Product"
    >
      <CoinIndicator coinIcon={coinIcon} coinName={coinName} />
      <hr aria-hidden="true" />
      {sellPriceAmount && priceAmount !== sellPriceAmount ? (
        <div className="PriceInfo" itemProp="offers" itemScope itemType="https://schema.org/AggregateOffer">
          <span id={`${tokenName}-buy-label`}>Current Buy Price</span>
          <h3 aria-labelledby={`${tokenName}-buy-label`} itemProp="highPrice">
            {priceAmount} {CHAIN_COIN}
          </h3>
          <span id={`${tokenName}-sell-label`}>Current Sell Price</span>
          <h3 aria-labelledby={`${tokenName}-sell-label`} itemProp="lowPrice">
            {sellPriceAmount} {CHAIN_COIN}
          </h3>
          <meta itemProp="priceCurrency" content="USD" />
        </div>
      ) : (
        <div className="PriceInfo" itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <span id={`${tokenName}-price-label`}>Current Price</span>
          <h3 aria-labelledby={`${tokenName}-price-label`} itemProp="price">
            {priceAmount} {CHAIN_COIN}
          </h3>
          <meta itemProp="priceCurrency" content="USD" />
        </div>
      )}
      <div className="AdditionalInfo">
        <div className="InfoItem">
          <span id={`${tokenName}-supply-label`}>Circulating Supply</span>
          <p aria-labelledby={`${tokenName}-supply-label`}>
            {circulatingAmount} {tokenName}
          </p>
          {equivalence ? <p aria-label="USD equivalent value">≈ {equivalence}</p> : null}
        </div>
      </div>
      <meta itemProp="name" content={coinName} />
    </article>
  );
};

export default CoinCard;

