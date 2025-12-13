import React from "react";
import MetamaskConnectButton from "../components/molecules/MetamaskConnectButton/MetamaskConnectButton";
import CoinCard from "../components/molecules/CoinCard/CoinCard";
import OperationSelector from "../components/organisms/OperationSelector/OperationSelector";
import ModalTransaction from "../components/organisms/Modals/ModalTransaction";
import ModalPending from "../components/organisms/Modals/ModalPending";
import BuySellButton from "../components/molecules/BuySellButton/BuySellButton";

import "./_CoinSection.scss";
import { useAppProvider } from "../context/AppProvider";
import { TRANSACTION_VALIDITY } from "../utils/constants";
import {
  calculateBcUsdEquivalent,
  calculateRcUsdEquivalent,
  getRcUsdEquivalent
} from "../utils/helpers";
import {
  buyRcTx,
  sellRcTx,
  tradeDataPriceBuyRc,
  tradeDataPriceSellRc,
  checkBuyableRc,
  checkSellableRc,
  BC_DECIMALS
} from "../utils/ethereum";
// isWSCConnected is returned by useCoinTrade
import useCoinTrade from "./useCoinTrade";
import WSCButton from "./CoinWSCButton";

export default function ReserveCoin() {
  const {
    web3,
    isWalletConnected,
    isWrongChain,
    djedContract,
    coinsDetails,
    decimals,
    accountDetails,
    coinBudgets,
    account,
    signer,
    systemParams,
    isRatioBelowMax,
    isRatioAboveMin,
    coinContracts,
    getFutureScPrice
  } = useAppProvider();
  // isWSCConnected comes from the useCoinTrade hook

  const {
    tradeData,
    value,
    termsAccepted,
    txError,
    txStatus,
    buyValidity,
    sellValidity,
    txStatusPending,
    txStatusRejected,
    txStatusSuccess,
    buyFunction,
    sellFunction,
    tradeFxn,
    currentAmount,
    onChangeBuyInput,
    onChangeSellInput,
    onSubmit,
    transactionValidated,
    buttonDisabled,
    setValue,
    setTermsAccepted,
    setBuyOrSell,
    setBuyValidity,
    setSellValidity,
    isBuyActive,
    isWSCConnected
  } = useCoinTrade({
    createBuyOptions: {
      tradeDataPriceBuy: tradeDataPriceBuyRc,
      decimalsValue: decimals.rcDecimals,
      checkBuyable: checkBuyableRc,
      bcDecimals: BC_DECIMALS,
      amountForLimitFn: (amountScaled, data) =>
        calculateBcUsdEquivalent(coinsDetails, parseFloat(data.totalScaled.replaceAll(",", ""))).replaceAll(",", ""),
      isRatioOkFn: ({ totalScSupply, scPrice, reserveBc }) => isRatioBelowMax({ scPrice, reserveBc }),
      ratioFailState: TRANSACTION_VALIDITY.RESERVE_RATIO_HIGH,
      budgetUnscaled: coinBudgets?.unscaledBudgetRc,
      buyTx: buyRcTx
    },
    createSellOptions: {
      tradeDataPriceSell: tradeDataPriceSellRc,
      decimalsValue: decimals.rcDecimals,
      checkSellable: checkSellableRc,
      bcDecimals: decimals.rcDecimals,
      amountForLimitFn: (amountScaled, data) =>
        calculateRcUsdEquivalent(coinsDetails, parseFloat(data.amountScaled.replaceAll(",", ""))).replaceAll(",", ""),
      isRatioOkFn: ({ totalScSupply, scPrice, reserveBc }) => isRatioAboveMin({ totalScSupply, scPrice, reserveBc }),
      ratioFailState: TRANSACTION_VALIDITY.RESERVE_RATIO_LOW,
      sellTx: sellRcTx
    }
  });










  const rcFloat = parseFloat(coinsDetails?.scaledNumberRc.replaceAll(",", ""));
  const rcConverted = getRcUsdEquivalent(coinsDetails, rcFloat);

  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="StablecoinSection">
        <div className="Left">
          <h1>ReserveCoin {/*<strong>Name</strong>*/}</h1>
          <div className="DescriptionContainer">
            <p>
              A ReserveCoin represents a portion of the surplus of the underlying reserves
              of {process.env.REACT_APP_CHAIN_COIN} in the Djed protocol. As such,
              ReserveCoins have a leveraged volatile price that increases when the price
              of {process.env.REACT_APP_CHAIN_COIN} increases and decreases when the price
              of {process.env.REACT_APP_CHAIN_COIN} decreases. Furthermore, ReserveCoin
              holders ultimately benefit from fees paid to the Djed protocol, since most
              fees are accumulated into the reserve and hence contribute to the reserve
              surplus.
            </p>
            <p>
              You are allowed to buy ReserveCoins, as long as the reserve ratio remains
              below the maximum of {systemParams?.reserveRatioMax}. This prevents
              excessive dilution of previous ReserveCoin holders. This restriction only
              applies when the StableCoin supply is above 500000.
            </p>
            <p>
              You are allowed to sell ReserveCoins, as long as the reserve ratio remains
              above the minimum of {systemParams?.reserveRatioMin}. This aims to ensure
              that all StableCoins remain sufficiently backed.
            </p>
            <p>
              There is a limit of {process.env.REACT_APP_LIMIT_PER_TXN} USD worth of{" "}
              {process.env.REACT_APP_CHAIN_COIN} per transaction.
            </p>
            <p>
              ReserveCoins are implemented as a standard ERC-20 token contract and the
              contract's address is{" "}
              <a
                href={`${process.env.REACT_APP_EXPLORER}address/${coinContracts?.reserveCoin._address}`}
                target="_blank"
                rel="noreferrer"
              >
                {coinContracts?.reserveCoin._address}
              </a>
              .
            </p>
          </div>
          <CoinCard
            coinIcon="/coin-icon-two.png"
            coinName={`${process.env.REACT_APP_RC_NAME}`}
            priceAmount={coinsDetails?.scaledBuyPriceRc}
            sellPriceAmount={coinsDetails?.scaledSellPriceRc}
            circulatingAmount={coinsDetails?.scaledNumberRc} //"1,345,402.15"
            tokenName={`${process.env.REACT_APP_RC_SYMBOL}`}
            equivalence={rcConverted}
          />
        </div>
        <div className="Right">
          <h2 className="SubtTitle">
            <strong>
              Buy <>&amp;</> Sell
            </strong>{" "}
            {process.env.REACT_APP_RC_NAME}
          </h2>
          <form onSubmit={onSubmit}>
            <div className="PurchaseContainer">
              <OperationSelector
                coinName={`${process.env.REACT_APP_RC_SYMBOL}`}
                selectionCallback={() => {
                  setBuyOrSell();
                  setValue(null);
                  setBuyValidity(TRANSACTION_VALIDITY.ZERO_INPUT);
                  setSellValidity(TRANSACTION_VALIDITY.ZERO_INPUT);
                }}
                onChangeBuyInput={onChangeBuyInput}
                onChangeSellInput={onChangeSellInput}
                tradeData={tradeData}
                inputValue={value}
                inputValid={transactionValidated}
                scaledCoinBalance={accountDetails?.scaledBalanceRc}
                scaledBaseBalance={accountDetails?.scaledBalanceBc}
                fee={systemParams?.fee}
                treasuryFee={systemParams?.treasuryFee}
                buyValidity={buyValidity}
                sellValidity={sellValidity}
                isSellDisabled={Number(coinsDetails?.scaledNumberRc) === 0}
              />
            </div>
            <input
              type="checkbox"
              id="accept-terms"
              name="accept-terms"
              onChange={() => setTermsAccepted(!termsAccepted)}
              checked={termsAccepted}
              required
            />
            <label htmlFor="accept-terms" className="accept-terms">
              I agree to the{" "}
              <a href="/terms-of-use" target="_blank" rel="noreferrer">
                Terms of Use
              </a>
              .
            </label>

            <div className="ConnectWallet">
              <br />
              {isWalletConnected ? (
                <>
                  {/*value != null ? (
                  <p className="Disclaimer">
                    This transaction is expected to{" "}
                    {transactionValidated ? (
                      <strong>succeed.</strong>
                    ) : (
                      <strong>fail!</strong>
                    )}
                  </p>
                    ) : null*/}
                  {isWSCConnected ? (
                    <WSCButton
                      disabled={value === null || isWrongChain || !termsAccepted}
                      currentAmount={currentAmount}
                      stepTxDirection={isBuyActive ? "buy" : "sell"}
                      unwrapAmount={
                        isBuyActive ? tradeData.amountUnscaled : tradeData.totalBCUnscaled
                      }
                      evmTokenAddress={process.env.REACT_APP_EVM_RESERVECOIN_ADDRESS}
                      cardanoWrapTokenUnit={process.env.REACT_APP_CARDANO_RESERVECOIN_ADDRESS}
                      buyFunctionName="buyReserveCoins"
                      sellFunctionName="sellReserveCoins"
                      titleBuy="Buy RC with WSC"
                      titleSell="Sell RC with WSC"
                    />
                  ) : (
                    <BuySellButton
                      disabled={buttonDisabled}
                      buyOrSell={buyOrSell}
                      currencyName={`${process.env.REACT_APP_RC_SYMBOL}`}
                    />
                  )}
                </>
              ) : (
                <>
                  <p className="Disclaimer">
                    In order to interact, you need to connect your wallet.
                  </p>
                  <MetamaskConnectButton />
                </>
              )}
            </div>
          </form>

          {txStatusRejected && (
            <ModalTransaction
              transactionType="Failed Transaction"
              transactionStatus="/transaction-failed.svg"
              statusText="Failed transaction!"
              statusDescription={txError}
            />
          )}
          {txStatusPending ? (
            <ModalPending
              transactionType="Confirmation"
              transactionStatus="/transaction-success.svg"
              statusText="Pending for confirmation"
              statusDescription="This transaction can take a while, once the process finish you will see the transaction reflected in your wallet."
            />
          ) : txStatusSuccess ? (
            <ModalTransaction
              transactionType="Success Transaction"
              transactionStatus="/transaction-success.svg"
              statusText="Succesful transaction!"
              statusDescription=""
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}

// WSC button is now provided by src/routes/CoinWSCButton
