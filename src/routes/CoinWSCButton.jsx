import React from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import djedArtifact from "../artifacts/Djed.json";
import { DJED_ADDRESS, FEE_UI_UNSCALED, UI } from "../utils/ethereum";
import { ConnectWSCButton, TransactionConfigWSCProvider } from "milkomeda-wsc-ui-test-beta";

const WSCButton = ({
  disabled,
  currentAmount,
  unwrapAmount,
  stepTxDirection,
  evmTokenAddress,
  cardanoWrapTokenUnit,
  buyFunctionName,
  sellFunctionName,
  titleBuy,
  titleSell
}) => {
  const { address: account } = useAccount();

  const buyOptions = {
    defaultWrapToken: {
      unit: "lovelace",
      amount: currentAmount // amountUnscaled
    },
    defaultUnwrapToken: {
      unit: evmTokenAddress,
      amount: unwrapAmount // amountUnscaled
    },
    titleModal: titleBuy,
    evmTokenAddress,
    evmContractRequest: {
      address: DJED_ADDRESS,
      abi: djedArtifact.abi,
      functionName: buyFunctionName,
      args: [account, FEE_UI_UNSCALED, UI],
      overrides: {
        value: ethers.BigNumber.from(currentAmount ?? "0")
      }
    }
  };

  const sellOptions = {
    defaultWrapToken: {
      unit: cardanoWrapTokenUnit,
      amount: currentAmount
    },
    defaultUnwrapToken: {
      unit: "",
      amount: unwrapAmount // totalBCUnscaled
    },
    titleModal: titleSell,
    evmTokenAddress,
    evmContractRequest: {
      address: DJED_ADDRESS,
      abi: djedArtifact.abi,
      functionName: sellFunctionName,
      args: [currentAmount, account, FEE_UI_UNSCALED, UI],
      overrides: {
        value: ethers.BigNumber.from("0")
      }
    }
  };

  return (
    <TransactionConfigWSCProvider options={stepTxDirection === "buy" ? buyOptions : sellOptions}>
      <ConnectWSCButton disabled={disabled} />
    </TransactionConfigWSCProvider>
  );
};

export default WSCButton;
