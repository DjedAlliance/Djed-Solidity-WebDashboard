import {
  ConnectWSCButton,
  TransactionConfigWSCProvider
} from "milkomeda-wsc-ui-test-beta";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import djedArtifact from "../artifacts/Djed.json";
import { DJED_ADDRESS, FEE_UI_UNSCALED, UI } from "../utils/ethereum";

export default function WSCTradeButton({
  disabled,
  currentAmount,
  unwrapAmount,
  stepTxDirection,
  buyFunctionName,
  sellFunctionName,
  titleBuy,
  titleSell,
  evmTokenAddress,
  wrapUnitBuy,
  wrapUnitSell
}) {
  const { address: account } = useAccount();


  if (!account) {
    return <ConnectWSCButton disabled={true} />;
  }

  const buyOptions = {
    defaultWrapToken: {
      unit: wrapUnitBuy,
      amount: currentAmount
    },
    defaultUnwrapToken: {
      unit: evmTokenAddress,
      amount: unwrapAmount
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
      unit: wrapUnitSell,
      amount: currentAmount
    },
    defaultUnwrapToken: {
      unit: "",
      amount: unwrapAmount
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
    <TransactionConfigWSCProvider
      options={stepTxDirection === "buy" ? buyOptions : sellOptions}
    >
      <ConnectWSCButton disabled={disabled} />
    </TransactionConfigWSCProvider>
  );
}