import React from "react";
import { Tabs } from "antd";
import "./_OperationSelector.scss";
import BuySellCoin from "../../molecules/BuySellCoin/BuySellCoin";

const { TabPane } = Tabs;

//function callback(key) {
//  console.log(key);
//}

const OperationSelector = ({ coinName, selectionCallback, changeCallback, tradeData }) => (
  <div className="OperationSelector">
    <Tabs defaultActiveKey="1" onChange={selectionCallback}>
      <TabPane tab="Buy" key="1">
        <BuySellCoin
          buyOrSell="Buy"
          coinName={coinName}
          priceAmount="0.000"
          feeAmount="0.000"
          totalAmount={tradeData.totalText}//"0.000"
          payOrGet="pay"
          changeFxn={changeCallback}
        />
      </TabPane>
      <TabPane tab="Sell" key="2">
        <BuySellCoin
          buyOrSell="Sell"
          coinName={coinName}
          priceAmount="0.000"
          feeAmount="0.000"
          totalAmount={tradeData.totalText}//"0.000"
          payOrGet="get"
          changeFxn={changeCallback}
        />
      </TabPane>
    </Tabs>
  </div>
);

export default OperationSelector;
