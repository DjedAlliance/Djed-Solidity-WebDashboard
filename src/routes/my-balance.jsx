import React from "react";
//import { ArrowRightOutlined } from "@ant-design/icons";
import TotalBalance from "../components/molecules/TotalBalance/TotalBalance";

import "./_MyBalance.scss";
import TransactionTable from "../components/organisms/TransactionTable/TransactionTable";
import { useAppProvider } from "../context/AppProvider";

export default function MyBalance() {
  const { accountDetails } = useAppProvider();
  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="MyBalanceSection">
        <div className="Top">
          <h1>My Balance</h1>
          <p>Here you will find your Metrics</p>
          <div className="Content">
            <TotalBalance
              coinIcon="/coin-icon-one.png"
              coinName="StableDjed"
              balanceAmount={accountDetails?.scaledBalanceSc}
            />
            <TotalBalance
              coinIcon="/coin-icon-two.png"
              coinName="ReserveDjed"
              balanceAmount={accountDetails?.scaledBalanceRc}
            />
            <TotalBalance
              coinIcon="/coin-icon-three.png"
              coinName="milktADA"
              balanceAmount={accountDetails?.scaledBalanceBc}
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
