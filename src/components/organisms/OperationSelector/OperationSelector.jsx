import React from "react";
import { Tabs } from "antd";
import "./_OperationSelector.scss";
import BuySellCoin from "../../molecules/BuySellCoin/BuySellCoin";
import { BUY_SELL_OPTIONS } from "../../../utils/constants";

const { TabPane } = Tabs;

const OperationSelector = ({
  coinName,
  selectionCallback,
  changeCallback,
  tradeData
}) => (
  <div className="OperationSelector">
    <Tabs defaultActiveKey={BUY_SELL_OPTIONS.BUY} onChange={selectionCallback}>
      <TabPane tab="Buy" key={BUY_SELL_OPTIONS.BUY}>
        <BuySellCoin
          buyOrSell="Buy"
          coinName={coinName}
          priceAmount="0.000"
          feeAmount="0.000"
          totalAmount={tradeData.totalScaled}
          payOrGet="pay"
          changeFxn={changeCallback}
        />
      </TabPane>
      <TabPane tab="Sell" key={BUY_SELL_OPTIONS.SELL}>
        <BuySellCoin
          buyOrSell="Sell"
          coinName={coinName}
          priceAmount="0.000"
          feeAmount="0.000"
          totalAmount={tradeData.totalScaled}
          payOrGet="get"
          changeFxn={changeCallback}
        />
      </TabPane>
    </Tabs>
  </div>
);

export default OperationSelector;
