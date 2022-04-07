import React from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import TotalBalance from "../components/molecules/TotalBalance/TotalBalance";

import "./_MyBalance.scss";
import TransactionTable from "../components/organisms/TransactionTable/TransactionTable";

export default function MyBalance() {
  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="MyBalanceSection">
        <div className="Top">
          <h1>My Balance</h1>
          <p>Here you will find your Metrics</p>
          <div className="Content">
            <TotalBalance
              coinIcon="/coin-icon-one.png"
              coinName="Stablecoin"
              balanceAmount="0.0054567890"
            />
            <TotalBalance
              coinIcon="/coin-icon-two.png"
              coinName="ReserveCoin"
              balanceAmount="0.0054567890"
            />
            <TotalBalance
              coinIcon="/coin-icon-three.png"
              coinName="Basecoin"
              balanceAmount="0.0054567890"
            />
          </div>
        </div>
        <div className="Bottom">
          <TransactionTable />
        </div>
      </div>
    </main>
  );
}
