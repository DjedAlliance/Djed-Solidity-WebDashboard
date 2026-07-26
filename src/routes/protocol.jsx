import React from "react";
import CoinCard from "../components/molecules/CoinCard/CoinCard";
import ReservesCard from "../components/molecules/ReservesCard/ReservesCard";
import { Helmet } from "react-helmet";
import { useAppProvider } from "../context/AppProvider";
import {
  getBcUsdEquivalent,
  getRcUsdEquivalent,
  getScAdaEquivalent
} from "../utils/helpers";

import "./_protocol.scss";

export default function Protocol() {
  const { coinsDetails, systemParams } = useAppProvider();

  const scFloat = parseFloat(coinsDetails?.scaledNumberSc.replaceAll(",", ""));
  const scConverted = getScAdaEquivalent(coinsDetails, scFloat);

  const rcFloat = parseFloat(coinsDetails?.scaledNumberRc.replaceAll(",", ""));
  const rcConverted = getRcUsdEquivalent(coinsDetails, rcFloat);

  const bcFloat = parseFloat(coinsDetails?.scaledReserveBc.replaceAll(",", ""));
  const bcConverted = getBcUsdEquivalent(coinsDetails, bcFloat);

  return (
    <main style={{ padding: "1rem 0" }}>
      {/* SEO tags */}
      <Helmet>
        <title>Djed – Cardano’s Autonomous Stablecoin Protocol</title>
        <meta
          name="description"
          content="Djed is a formally verified, autonomous, crypto-backed stablecoin protocol on Cardano. Learn how the Djed protocol powers StableCoins and ReserveCoins."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Djed",
            "url": "https://djed.one",
            "description": "Djed is a formally verified, autonomous stablecoin protocol on Cardano.",
            "sameAs": [
              "https://twitter.com/DjedProtocol",
              "https://github.com/DjedAlliance"
            ]
          })}
        </script>
      </Helmet>

      <div className="ProtocolSection">
        <div className="Left">
          <h1>Djed – Cardano’s Autonomous Stablecoin Protocol</h1>

          <div className="DescriptionContainer">
            <h2>What is Djed?</h2>
            <p>
              Djed is a formally verified crypto-backed autonomous stablecoin protocol. It
              has been researched since Q2 2020, its whitepaper was released in August 2021,
              and it has multiple{" "}
              <a href="https://github.com/DjedAlliance" target="_blank" rel="noreferrer">
                implementations
              </a>{" "}
              and{" "}
              <a
                href="https://docs.djed.one/implementations-and-deployments/deployments"
                target="_blank"
                rel="noreferrer"
              >
                deployments
              </a>
              . You can interact with a{" "}
              <a
                href={`${process.env.REACT_APP_EXPLORER}/address/${process.env.REACT_APP_DJED_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
              >
                deployment
              </a>{" "}
              that uses{" "}
              <a
                href="https://github.com/DjedAlliance/Djed-Solidity/commits/Belus"
                target="_blank"
                rel="noreferrer"
              >
                these smart contracts
              </a>{" "}
              on {process.env.REACT_APP_BC}.
            </p>

            <h2>How Djed Works</h2>
            <p>
              {process.env.REACT_APP_PROTOCOL_CHAIN_DESCRIPTION}. This asset is used by
              the Djed protocol to back <a href="/sc">StableCoins</a> and{" "}
              <a href="/rc">ReserveCoins</a>. It is needed to buy these coins and pay
              transaction fees on {process.env.REACT_APP_BC}.
            </p>

            <h2>Fully Autonomous & Immutable</h2>
            <p>
              This deployment is immutable, unstoppable, fully autonomous, and zero-governance.
              No one can change the deployed code or parameters. No one operates it or controls your funds.
              Treat it as a self-sovereign autonomous monetary authority whose currency follows a self-driving monetary policy.
            </p>
          </div>
        </div>

        <div className="Right">
          <h2 className="SubtTitle">
            <strong>Protocol Status</strong>
          </h2>
          <div className="CoinsContainer">
            <CoinCard
              coinIcon="/coin-icon-one.png"
              coinName={`${process.env.REACT_APP_SC_NAME}`}
              priceAmount={coinsDetails?.scaledPriceSc}
              circulatingAmount={coinsDetails?.scaledNumberSc}
              tokenName={`${process.env.REACT_APP_SC_SYMBOL}`}
              equivalence={`${scConverted} ${process.env.REACT_APP_CHAIN_COIN}`}
            />
            <CoinCard
              coinIcon="/coin-icon-two.png"
              coinName={`${process.env.REACT_APP_RC_NAME}`}
              priceAmount={coinsDetails?.scaledBuyPriceRc}
              sellPriceAmount={coinsDetails?.scaledSellPriceRc}
              circulatingAmount={coinsDetails?.scaledNumberRc}
              tokenName={`${process.env.REACT_APP_RC_SYMBOL}`}
              equivalence={rcConverted}
            />
            <ReservesCard
              priceAmount={coinsDetails?.scaledReserveBc}
              equivalence={bcConverted}
              coinIcon="/coin-icon-three.png"
              coinName="Reserves"
              reserveRatio={coinsDetails?.percentReserveRatio}
              reserveRatioMin={systemParams?.reserveRatioMin}
              reserveRatioMax={systemParams?.reserveRatioMax}
              showCurrentReserveRatio={Number(coinsDetails?.unscaledNumberSc) > 0}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
