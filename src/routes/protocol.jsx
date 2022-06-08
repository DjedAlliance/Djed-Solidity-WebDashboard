import React from "react";
//import { ArrowRightOutlined, PropertySafetyFilled } from "@ant-design/icons";
//import { ReactComponent as Metamask } from "../images/metamask.svg";
//import CustomButton from "../components/atoms/CustomButton/CustomButton";
import MetamaskConnectButton from "../components/molecules/MetamaskConnectButton/MetamaskConnectButton";
import CoinCard from "../components/molecules/CoinCard/CoinCard";

import "./_protocol.scss";
import ReservesCard from "../components/molecules/ReservesCard/ReservesCard";
import { useAppProvider } from "../context/AppProvider";
import {
  getBcUsdEquivalent,
  getRcUsdEquivalent,
  getScAdaEquivalent
} from "../utils/helpers";

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
      <div className="ProtocolSection">
        <div className="Left">
          <h1>
            <strong>Milkomeda Djed</strong>
          </h1>
          <div className="DescriptionContainer">
            <p>
              Milkomeda Djed is an implementation of Minimal Djed on the Milkomeda C1
              Testnet. Djed is a novel collateral-backed stablecoin protocol which has
              garnered attention since the release of its{" "}
              <a
                href="https://iohk.io/en/research/library/papers/djeda-formally-verified-crypto-backed-pegged-algorithmic-stablecoin/"
                target="_blank"
                rel="noopener noreferrer"
              >
                whitepaper
              </a>{" "}
              in August 2021.
            </p>
            <p>
              Milkomeda Djed is the very first publicly accessible implementation of Djed,
              thereby providing users the perfect opportunity to get a new taste of the
              latest and greatest in DeFi, however without any of the risk. All assets are
              100% testnet assets, meaning that users can learn the risks and upsides of
              the protocol in practice but with no real money on the line.
            </p>
            <p>
              You can learn more about the Milkomeda Djed implementation{" "}
              <a
                href="https://medium.com/@milkomedafoundation/djed-stablecoin-live-on-milkomeda-c1-testnet-ff93710b0881"
                target="_blank"
                rel="noopener noreferrer"
              >
                in this blog post
              </a>{" "}
              or{" "}
              <a
                href="https://medium.com/@milkomedafoundation/getting-started-with-milkomeda-djed-on-c1-testnet-d335ebf65305"
                target="_blank"
                rel="noopener noreferrer"
              >
                follow this guide
              </a>{" "}
              to get started testing the dApp immediately.
            </p>
          </div>
          <MetamaskConnectButton />
        </div>
        <div className="Right">
          <h2 className="SubtTitle">
            <strong>Protocol Coins</strong> Detail
          </h2>
          <div className="CoinsContainer">
            <CoinCard
              coinIcon="/coin-icon-one.png"
              coinName="StableDjed"
              priceAmount={coinsDetails?.scaledPriceSc} //"0.31152640"
              circulatingAmount={coinsDetails?.scaledNumberSc} //"1,345,402.15"
              tokenName="StableDjed"
              equivalence={scConverted}
            />
            <CoinCard
              coinIcon="/coin-icon-two.png"
              coinName="ReserveDjed"
              priceAmount={coinsDetails?.scaledBuyPriceRc} //"0.31152640"
              sellPriceAmount={coinsDetails?.scaledSellPriceRc}
              circulatingAmount={coinsDetails?.scaledNumberRc} //"1,345,402.15"
              tokenName="ReserveDjed"
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
            />
          </div>
        </div>
      </div>
    </main>
  );
}
