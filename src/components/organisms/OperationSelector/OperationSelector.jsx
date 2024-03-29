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
  tradeData,
  inputValue,
  scaledCoinBalance,
  scaledBaseBalance,
  fee,
  treasuryFee,
  buyValidity,
  sellValidity,
  isSellDisabled
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
          treasuryFee={treasuryFee}
          totalAmount={tradeData.totalBCScaled}
          payOrReceive="receive"
          payOrGet="pay"
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
        disabled={isSellDisabled}
      >
        <BuySellCoin
          buyOrSell="Sell"
          coinName={coinName}
          priceAmount="0.000"
          fee={fee}
          treasuryFee={treasuryFee}
          totalAmount={tradeData.totalBCScaled}
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
