import React from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { ReactComponent as Metamask } from "../images/metamask.svg";
import CustomButton from "../components/atoms/CustomButton/CustomButton";
import CoinCard from "../components/molecules/CoinCard/CoinCard";

import "./_protocol.scss";
import ReservesCard from "../components/molecules/ReservesCard/ReservesCard";

export default function Protocol() {
  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="ProtocolSection">
        <div className="Left">
          <h1>
            <strong>Protocol Name</strong> presentation goes here
          </h1>
          <div className="DescriptionContainer">
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book.
            </p>
            <p>
              It has survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged.
            </p>
          </div>
          <CustomButton
            type="primary"
            htmlType="submit"
            text="Connect with Metamask"
            theme="primary"
            iconWallet={<Metamask />}
            icon={<ArrowRightOutlined />}
          />
        </div>
        <div className="Right">
          <h2 className="SubtTitle">
            <strong>Protocol Coins</strong> Detail
          </h2>
          <div className="CoinsContainer">
            <CoinCard
              coinIcon="/coin-icon-one.png"
              coinName="Stablecoin Name"
              priceAmount="0.31152640"
              circulatingAmount="1,345,402.15"
              ratioAmount="1 milkADA ≈ 3.21 Token"
            />
            <CoinCard
              coinIcon="/coin-icon-two.png"
              coinName="Reservecoin Name"
              priceAmount="0.31152640"
              circulatingAmount="1,345,402.15"
              ratioAmount="1 milkADA ≈ 3.21 Token"
            />
            <ReservesCard
              priceAmount="1,453,338"
              equivalence="≈ 4.51M StabeCoin"
              coinIcon="/coin-icon-three.png"
              coinName="Reserves"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
