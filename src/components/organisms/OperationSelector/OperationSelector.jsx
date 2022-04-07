import React from "react";
import { Tabs } from "antd";
import "./_OperationSelector.scss";
import BuySellCoin from "../../molecules/BuySellCoin/BuySellCoin";

const { TabPane } = Tabs;

function callback(key) {
  console.log(key);
}

const OperationSelector = ({ coinName }) => (
  <div className="OperationSelector">
    <Tabs defaultActiveKey="1" onChange={callback}>
      <TabPane tab="Buy" key="1">
        <BuySellCoin
          buyOrSell="Buy"
          coinName={coinName}
          priceAmount="0.000"
          feeAmount="0.000"
          totalAmount="0.000"
          payOrGet="You will pay"
        />
      </TabPane>
      <TabPane tab="Sell" key="2">
        <BuySellCoin
          buyOrSell="Sell"
          coinName={coinName}
          priceAmount="0.000"
          feeAmount="0.000"
          totalAmount="0.000"
          payOrGet="You will get"
        />
      </TabPane>
    </Tabs>
  </div>
);

export default OperationSelector;
