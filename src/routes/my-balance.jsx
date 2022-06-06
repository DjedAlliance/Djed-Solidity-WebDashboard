import React from "react";
//import { ArrowRightOutlined } from "@ant-design/icons";
import TotalBalance from "../components/molecules/TotalBalance/TotalBalance";

import "./_MyBalance.scss";
//import TransactionTable from "../components/organisms/TransactionTable/TransactionTable";
import { useAppProvider } from "../context/AppProvider";
import {
  getBcUsdEquivalent,
  getRcUsdEquivalent,
  getScAdaEquivalent
} from "../utils/helpers";

export default function MyBalance() {
  const { coinsDetails, accountDetails } = useAppProvider();

  const scFloat = parseFloat(accountDetails?.scaledBalanceSc.replaceAll(",", ""));
  const scConverted = getScAdaEquivalent(coinsDetails, scFloat);

  const rcFloat = parseFloat(accountDetails?.scaledBalanceRc.replaceAll(",", ""));
  const rcConverted = getRcUsdEquivalent(coinsDetails, rcFloat);

  const bcFloat = parseFloat(accountDetails?.scaledBalanceBc.replaceAll(",", ""));
  const bcConverted = getBcUsdEquivalent(coinsDetails, bcFloat);

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
              balanceEquivalent={scConverted}
            />
            <TotalBalance
              coinIcon="/coin-icon-two.png"
              coinName="ReserveDjed"
              balanceAmount={accountDetails?.scaledBalanceRc}
              balanceEquivalent={rcConverted}
            />
            <TotalBalance
              coinIcon="/coin-icon-three.png"
              coinName="milktADA"
              balanceAmount={accountDetails?.scaledBalanceBc}
              balanceEquivalent={bcConverted}
            />
          </div>
        </div>
        {/*<div className="Bottom">
          <TransactionTable />
        </div>*/}
      </div>
    </main>
  );
}
