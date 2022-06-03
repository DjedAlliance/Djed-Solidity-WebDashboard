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
            <strong>Milkomeda Djed</strong>
          </h1>
          <div className="DescriptionContainer">
            <p>
              Milkomeda Djed is an implementation of Minimal Djed on the Milkomeda C1 Testnet. Djed is a novel collateral-backed stablecoin protocol
              which has garnered attention since the release of its <a href="https://iohk.io/en/research/library/papers/djeda-formally-verified-crypto-backed-pegged-algorithmic-stablecoin/">whitepaper</a>
              in August 2021.
            </p>
            <p>
              Milkomeda Djed is the very first publicly accessible implementation of Djed, thereby providing users the perfect opportunity to get a new taste of
              the latest and greatest in DeFi, however without any of the risk. All assets are 100% testnet assets, meaning that users can learn the risks and upsides of the protocol 
              in practice but with no real money on the line. 
            </p>
            <p>
              You can learn more about the Milkomeda Djed implementation <a href="">in this blog post</a> or <a href="">follow this guide</a> to get started testing the dApp immediately.
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
