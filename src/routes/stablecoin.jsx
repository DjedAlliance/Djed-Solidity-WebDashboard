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
import { getScAdaEquivalent } from "../utils/helpers";
import {
  buyScTx,
  sellScTx,
  tradeDataPriceBuySc,
  tradeDataPriceSellSc,
  checkBuyableSc,
  checkSellableSc,
  BC_DECIMALS
} from "../utils/ethereum";
import WSCButton from "./CoinWSCButton";
import { useWSCProvider } from "milkomeda-wsc-ui-test-beta";
import useCoinTrade from "./useCoinTrade";

export default function Stablecoin() {
  const {
    web3,
    isWalletConnected,
    isWrongChain,
    coinsDetails,
    djedContract,
    decimals,
    accountDetails,
    coinBudgets,
    account,
    signer,
    systemParams,
    isRatioAboveMin,
    coinContracts,
    getFutureScPrice
  } = useAppProvider();

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
      tradeDataPriceBuy: tradeDataPriceBuySc,
      decimalsValue: decimals.scDecimals,
      checkBuyable: checkBuyableSc,
      bcDecimals: BC_DECIMALS,
      amountForLimitFn: (amountScaled) => amountScaled,
      isRatioOkFn: ({ totalScSupply, scPrice, reserveBc }) =>
        isRatioAboveMin({ totalScSupply, scPrice, reserveBc }),
      budgetUnscaled: coinBudgets?.unscaledBudgetSc,
      buyTx: buyScTx
    },
    createSellOptions: {
      tradeDataPriceSell: tradeDataPriceSellSc,
      decimalsValue: decimals.scDecimals,
      checkSellable: checkSellableSc,
      bcDecimals: decimals.scDecimals,
      amountForLimitFn: (amountScaled) => amountScaled,
      isRatioOkFn: ({ totalScSupply, scPrice, reserveBc }) =>
        isRatioAboveMin({ totalScSupply, scPrice, reserveBc }),
      sellTx: sellScTx
    }
  });

  const scFloat = parseFloat(coinsDetails?.scaledNumberSc.replaceAll(",", ""));
  const scConverted = getScAdaEquivalent(coinsDetails, scFloat);

  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="StablecoinSection">
        <div className="Left">
          <h1>StableCoin {/*<strong>Name</strong>*/}</h1>
          <div className="DescriptionContainer">
            <p>
              The StableCoin of this Djed deployment is called{" "}
              <strong>{process.env.REACT_APP_SC_NAME}</strong>. It is pegged to the USD,
              similarly to various{" "}
              <a
                href="https://en.wikipedia.org/wiki/List_of_circulating_fixed_exchange_rate_currencies"
                target="_blank"
                rel="noreferrer"
              >
                fixed exchange rate national currencies
              </a>
              , at a ratio of 1 to 1. One Djed Stablecoin is nominally worth 1 USD. The
              peg is maintained through a reserve of {process.env.REACT_APP_CHAIN_COIN}.
              The Djed protocol aims to maintain a reserve ratio between{" "}
              {systemParams?.reserveRatioMin} and {systemParams?.reserveRatioMax}. This
              means that, when the reserve ratio is in this range, every StableCoin is
              backed by an amount of {process.env.REACT_APP_CHAIN_COIN} worth at least 4
              USD and is able to tolerate an instantaneous{" "}
              {process.env.REACT_APP_CHAIN_COIN} price crash of at least 75%.
            </p>
            <p>
              You are always allowed to sell back StableCoins to Djed. Djed pays 1 USD
              worth of {process.env.REACT_APP_CHAIN_COIN} per StableCoin if the reserve
              ratio is above 100% or R/S per StableCoin otherwise, where R is Djed's total{" "}
              {process.env.REACT_APP_CHAIN_COIN} reserve and S is the StableCoin supply.
            </p>
            <p>
              You are allowed to buy StableCoins from Djed for a price of 1 USD worth of
              {process.env.REACT_APP_CHAIN_COIN} per StableCoin, whenever the reserve
              ratio is above {systemParams?.reserveRatioMin}. When the reserve ratio is
              below {systemParams?.reserveRatioMin}, the purchase of StableCoins from Djed
              is disallowed, because it would reduce the reserve ratio further.
            </p>
            <p>
              There is a limit of {process.env.REACT_APP_LIMIT_PER_TXN} USD worth of{" "}
              {process.env.REACT_APP_CHAIN_COIN} per transaction.
            </p>
            <p>
              StableCoins are implemented as a standard ERC-20 token contract and the
              contract's address is{" "}
              <a
                href={`${process.env.REACT_APP_EXPLORER}address/${coinContracts?.stableCoin._address}`}
                target="_blank"
                rel="noreferrer"
              >
                {coinContracts?.stableCoin._address}
              </a>
              .
            </p>
          </div>
          <CoinCard
            coinIcon="/coin-icon-one.png"
            coinName={`${process.env.REACT_APP_SC_NAME}`}
            priceAmount={coinsDetails?.scaledPriceSc} //"0.31152640"
            circulatingAmount={coinsDetails?.scaledNumberSc} //"1,345,402.15"
            tokenName="SC"
            equivalence={scConverted}
          />
        </div>
        <div className="Right">
          <h2 className="SubtTitle">
            <strong>
              Buy <>&amp;</> Sell
            </strong>{" "}
            {process.env.REACT_APP_SC_NAME}
          </h2>
          <form onSubmit={onSubmit}>
            <div className="PurchaseContainer">
              <OperationSelector
                coinName={`${process.env.REACT_APP_SC_SYMBOL}`}
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
                scaledCoinBalance={accountDetails?.scaledBalanceSc}
                scaledBaseBalance={accountDetails?.scaledBalanceBc}
                fee={systemParams?.fee}
                treasuryFee={systemParams?.treasuryFee}
                buyValidity={buyValidity}
                sellValidity={sellValidity}
                isSellDisabled={Number(coinsDetails?.unscaledNumberSc) === 0}
              />
            </div>
            <input
              type="checkbox"
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
                      evmTokenAddress={process.env.REACT_APP_EVM_STABLECOIN_ADDRESS}
                      cardanoWrapTokenUnit={process.env.REACT_APP_CARDANO_STABLECOIN_ADDRESS}
                      buyFunctionName="buyStableCoins"
                      sellFunctionName="sellStableCoins"
                      titleBuy="Buy SC with WSC"
                      titleSell="Sell SC with WSC"
                    />
                  ) : (
                    <BuySellButton
                      disabled={buttonDisabled}
                      buyOrSell={buyOrSell}
                      currencyName={`${process.env.REACT_APP_SC_NAME}`}
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
