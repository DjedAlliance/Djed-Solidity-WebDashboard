import React from "react";
//import { ArrowRightOutlined, PropertySafetyFilled } from "@ant-design/icons";
//import { ReactComponent as Metamask } from "../images/metamask.svg";
//import CustomButton from "../components/atoms/CustomButton/CustomButton";
import MetamaskConnectButton from "../components/molecules/MetamaskConnectButton/MetamaskConnectButton";
import CoinCard from "../components/molecules/CoinCard/CoinCard";

import "./_protocol.scss";
import ReservesCard from "../components/molecules/ReservesCard/ReservesCard";
import { useAppProvider } from "../context/AppProvider";
import { decimalScaling } from "../utils/helpers";

export default function Protocol() {
  const { coinsDetails, systemParams } = useAppProvider();
  const scPriceFloat = parseFloat(coinsDetails?.scaledPriceSc.replaceAll(",", ""));
  const reservesFloat = parseFloat(coinsDetails?.scaledReserveBc.replaceAll(",", ""));
  const eqPrice = 1e6 * scPriceFloat * reservesFloat;
  //console.log(eqPrice, "=", scPriceFloat, "*", reservesFloat);
  const eqPriceScaled = decimalScaling(eqPrice.toFixed(0).toString(10), 6);
  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="ProtocolSection">
        <div className="Left">
          <h1>
            <strong>Protocol Name</strong> presentation goes here
          </h1>
          <div className="DescriptionContainer">
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's standard dummy text ever since the
              1500s, when an unknown printer took a galley of type and scrambled it to
              make a type specimen book.
            </p>
            <p>
              It has survived not only five centuries, but also the leap into electronic
              typesetting, remaining essentially unchanged.
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
            />
            <CoinCard
              coinIcon="/coin-icon-two.png"
              coinName="ReserveDjed"
              priceAmount={coinsDetails?.scaledBuyPriceRc} //"0.31152640"
              sellPriceAmount={coinsDetails?.scaledSellPriceRc}
              circulatingAmount={coinsDetails?.scaledNumberRc} //"1,345,402.15"
              tokenName="ReserveDjed"
            />
            <ReservesCard
              priceAmount={coinsDetails?.scaledReserveBc}
              equivalence={eqPriceScaled}
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
