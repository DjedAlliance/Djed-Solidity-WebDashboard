import React from "react";
import { Tabs } from "antd";
import "./_OperationSelector.scss";
import BuySellCoin from "../../molecules/BuySellCoin/BuySellCoin";
import { BUY_SELL_OPTIONS } from "../../../utils/constants";

const { TabPane } = Tabs;

const OperationSelector = ({
  coinName,
  selectionCallback,
  onChangeBuyInput,
  onChangeSellInput,
  onMaxBuy,
  onMaxSell,
  tradeData,
  inputValue,
  scaledCoinBalance,
  scaledBaseBalance,
  fee,
  buyValidity,
  sellValidity
}) => (
  <div className="OperationSelector">
    <Tabs defaultActiveKey={BUY_SELL_OPTIONS.BUY} onChange={selectionCallback}>
      <TabPane
        tab={<div className="custom-tab tab-buy">Buy</div>}
        key={BUY_SELL_OPTIONS.BUY}
      >
        <BuySellCoin
          buyOrSell="Buy"
          coinName={coinName}
          priceAmount="0.000"
          fee={fee}
          totalAmount={tradeData.totalScaled}
          payOrReceive="receive"
          payOrGet="pay"
          onMaxClick={onMaxBuy}
          onChangeInput={onChangeBuyInput}
          inputValue={inputValue}
          scaledCoinBalance={scaledCoinBalance}
          scaledBaseBalance={scaledBaseBalance}
          validity={buyValidity}
        />
      </TabPane>
      <TabPane
        tab={<div className="custom-tab tab-sell">Sell</div>}
        key={BUY_SELL_OPTIONS.SELL}
      >
        <BuySellCoin
          buyOrSell="Sell"
          coinName={coinName}
          priceAmount="0.000"
          fee={fee}
          totalAmount={tradeData.totalScaled}
          onMaxClick={onMaxSell}
          payOrReceive="pay"
          payOrGet="get"
          onChangeInput={onChangeSellInput}
          inputValue={inputValue}
          scaledCoinBalance={scaledCoinBalance}
          scaledBaseBalance={scaledBaseBalance}
          validity={sellValidity}
        />
      </TabPane>
    </Tabs>
  </div>
);

export default OperationSelector;
