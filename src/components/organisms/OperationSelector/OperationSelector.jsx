import React from "react";
import { Tabs } from "antd";
import "./_OperationSelector.scss";
import BuySellCoin from "../../molecules/BuySellCoin/BuySellCoin";
import { BUY_SELL_OPTIONS } from "../../../utils/constants";

const { TabPane } = Tabs;

const OperationSelector = ({
  coinName,
  selectionCallback,
  onChangeInput,
  onChangeBuyInput,
  onChangeSellInput,
  onMaxBuy,
  onMaxSell,
  tradeData,
  inputValue,
  isWalletConnected,
  scaledCoinBalance,
  scaledBaseBalance,
  fee
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
          payOrGet="pay"
          onMaxClick={onMaxBuy}
          onChangeInput={onChangeBuyInput}
          inputValue={inputValue}
          isWalletConnected={isWalletConnected}
          scaledCoinBalance={scaledCoinBalance}
          scaledBaseBalance={scaledBaseBalance}
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
          payOrGet="get"
          onChangeInput={onChangeSellInput}
          inputValue={inputValue}
          isWalletConnected={isWalletConnected}
          scaledCoinBalance={scaledCoinBalance}
          scaledBaseBalance={scaledBaseBalance}
        />
      </TabPane>
    </Tabs>
  </div>
);

export default OperationSelector;
