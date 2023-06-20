import React, { useEffect } from "react";
import { Modal, Steps, Icon, Spin, Select, message } from "antd";
import { useAppProvider } from "../../../context/AppProvider";
import "./WSCButton.scss";
import { LoadingOutlined } from "@ant-design/icons";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { TxPendingStatus } from "milkomeda-wsc/build/WSCLibTypes";
import useInterval from "../../../utils/hooks/useInterval";
import { erc20ABI } from "@wagmi/core";
import { useSigner } from "wagmi";

const { Step } = Steps;
const { Option } = Select;

const formatTokenAmount = (amount, decimals) => {
  if (decimals) {
    const divisor = new BigNumber(10).pow(decimals);
    return new BigNumber(amount).dividedBy(divisor).toString();
  }
  return amount;
};

const statusMessages = {
  init: "Staring wrapping your token...",
  pending: "Wrapping your tokens...",
  [TxPendingStatus.WaitingL1Confirmation]: "Waiting for L1 confirmation...",
  [TxPendingStatus.WaitingBridgeConfirmation]: "Waiting for bridge confirmation...",
  [TxPendingStatus.WaitingL2Confirmation]: "Waiting for L2 confirmation...",
  [TxPendingStatus.Confirmed]: "Your asset has been successfully moved! Go to Next Step!",
  error: "Ups something went wrong."
};
const WrapContent = ({
  wscProvider,
  amount: defaultAmountEth,
  token: defaultTokenUnit = "lovelace",
  selectedToken,
  setSelectedToken
}) => {
  const [amount, setAmount] = React.useState(null);
  const [originTokens, setOriginTokens] = React.useState([]);

  const [txHash, setTxHash] = React.useState(null);

  const [txStatus, setTxStatus] = React.useState("idle");

  useInterval(
    async () => {
      if (!wscProvider || txHash == null) return;
      const response = await wscProvider.getTxStatus(txHash);
      setTxStatus(response);
      if (response === TxPendingStatus.Confirmed) {
        setTxHash(null);
      }
    },
    txHash != null ? 4000 : null
  );

  const wrapToken = async () => {
    console.log("wrapping it", selectedToken, amount);
    setTxStatus("init");
    try {
      const txHash = await wscProvider?.wrap(
        undefined,
        selectedToken.unit,
        new BigNumber(amount ?? "0")
      );
      setTxHash(txHash);
      setTxStatus("pending");
    } catch (err) {
      console.error(err);
      setTxStatus("error");
    }
  };

  const handleTokenChange = (tokenUnit) => {
    const token = originTokens.find((t) => t.unit === tokenUnit);
    setSelectedToken(token);
  };
  const onMaxToken = () => {
    setAmount(selectedToken.quantity);
  };

  useEffect(() => {
    const loadOriginTokens = async () => {
      const originTokens = await wscProvider.origin_getTokenBalances();
      const token = originTokens.find((t) => t.unit === defaultTokenUnit);
      console.log(defaultAmountEth, "defaultAmountEth", token);
      const defaultToken = {
        ...token,
        quantity: defaultAmountEth ?? token.quantity
      };
      setSelectedToken(defaultToken);
      setAmount(defaultToken.quantity);
      const formattedTokens = originTokens.map((token) => ({
        ...token,
        quantity: formatTokenAmount(token.quantity, token.decimals)
      }));
      console.log("originTokens", originTokens);
      setOriginTokens(formattedTokens ?? []);
    };
    loadOriginTokens();
  }, [defaultAmountEth, defaultTokenUnit, wscProvider]);

  if (!selectedToken) return <div>Loading...</div>;

  const isAmountValid = new BigNumber(amount).lte(selectedToken.quantity);
  console.log(selectedToken, "selectedToken");
  return (
    <div className="step-1-content">
      <h1>Wrapping</h1>
      <div style={{ display: "flex", gap: 10 }}>
        <div>
          <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button onClick={onMaxToken}>MAX</button>
        </div>
        <Select
          defaultValue={selectedToken.unit}
          style={{ width: 120 }}
          onChange={handleTokenChange}
        >
          {originTokens.map((token) => (
            <Option value={token.unit}>{token.assetName}</Option>
          ))}
        </Select>
      </div>
      <p>
        You'll be wrapping {amount} <strong>{selectedToken.assetName}</strong>
      </p>
      <div style={{ color: "red" }}>
        {!selectedToken?.bridgeAllowed && "bridge doesnt allow this token"}
        {!isAmountValid && "Amount exceeds your current balance"}
      </div>
      <button
        disabled={!isAmountValid || !selectedToken?.bridgeAllowed}
        onClick={wrapToken}
      >
        Wrap it now
      </button>
      {txStatus}
      <div>
        {txStatus !== TxPendingStatus.Confirmed && txStatus !== "idle" && (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        )}
        {txStatus !== "idle" && <p>{statusMessages[txStatus]}</p>}
      </div>
    </div>
  );
};

const TokenAllowanceContent = ({ wscProvider, selectedToken }) => {
  const { data: signer } = useSigner();
  const onTokenAllowance = async () => {
    if (selectedToken.unit === "lovelace") return;

    // console.log(selectedToken, "erc20Contract", wscProvider);
    // const erc20Contract = new ethers.Contract(
    //   `0x${selectedToken.unit}`,
    //   erc20ABI,
    //   signer
    // );
    // const tx = await erc20Contract.approve(wscProvider?.bridgeAddress, "10000000");
  };
  return (
    <div className="step-2-content">
      <h1>Token Allowance</h1>
      <div>
        <p>
          Here's a description of what's going on in this step. Lorem ipsum dolor sit
          amet, consectetur adipiscing elit. Nullam
        </p>
      </div>
      <button onClick={onTokenAllowance}>Token allowance</button>
    </div>
  );
};

const ActionExecutionContent = ({ wscProvider, onWSCAction }) => {
  console.log(onWSCAction, "ac");
  return (
    <div className="step-3-content">
      <h1>Action Execution</h1>
      <div>
        <p>
          Here's a description of what's going on in this step. Lorem ipsum dolor sit
          amet, consectetur adipiscing elit. Nullam
        </p>
      </div>
      <button onClick={onWSCAction}>Perform Action</button>
    </div>
  );
};
const UnwrapContent = ({ wscProvider }) => {
  const [txHash, setTxHash] = React.useState(null);
  const [destinationBalance, setDestinationBalance] = React.useState(null);
  const normalizeAda = (amount) => {
    const maxDecimalPlaces = 6;
    const decimalIndex = amount.indexOf(".");
    const truncatedDestinationBalance =
      decimalIndex === -1
        ? destinationBalance
        : destinationBalance.slice(0, decimalIndex + maxDecimalPlaces + 1);

    return truncatedDestinationBalance;
  };
  const unwrapToken = async (destination, assetId, amount) => {
    const normalizedAda = normalizeAda(destinationBalance);
    console.log(normalizedAda, "normalizedAda");
    // const lovelace = new BigNumber(normalizedAda).multipliedBy(new BigNumber(10).pow(6));
    // // only ADA
    // const txHash = await wscProvider?.unwrap(undefined, undefined, lovelace);
    // setTxHash(txHash);
    // console.log(txHash, "txHash");
  };

  useEffect(() => {
    if (!wscProvider) return;
    const loadDestinationBalance = async () => {
      const destinationBalance = await wscProvider.eth_getBalance();
      setDestinationBalance(destinationBalance);
    };
    loadDestinationBalance();
  }, []);
  return (
    <div className="step-4-content">
      <h1>Unwrapping</h1>
      <div>
        <p>
          Here's a description of what's going on in this step. Lorem ipsum dolor sit
          amet, consectetur adipiscing elit. Nullam
        </p>
      </div>
      <button onClick={unwrapToken}>Unwrapping</button>
    </div>
  );
};

const directions = {
  WRAP: "wrap",
  UNWRAP: "unwrap"
};
const WSCButton = ({
  onWSCAction,
  type,
  className,
  disabled,
  children,
  currentAmountWei,
  direction
}) => {
  const { activeConnector } = useAppProvider();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);

  const [wscProvider, setWscProvider] = React.useState(null);
  const [selectedToken, setSelectedToken] = React.useState(null);

  const showModal = () => {
    console.log("test!");
    setIsModalOpen(true);
  };

  const handleNextStep = () => {
    const nextStepIdx = currentStep + 1;
    setCurrentStep(nextStepIdx);
  };
  const handlePrevStep = () => {
    const prevStepIdx = currentStep - 1;
    setCurrentStep(prevStepIdx);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const loadWscProvider = async () => {
      try {
        const provider = await activeConnector.getProvider();
        if (!provider) return;
        setWscProvider(provider);
      } catch (e) {
        console.log(e);
      }
    };
    loadWscProvider();
  }, [activeConnector]);

  if (!activeConnector?.id?.includes("wsc")) {
    return <></>;
  }
  console.log(currentAmountWei, "currentAmountWei");

  const steps =
    direction === directions.WRAP
      ? [
          {
            title: "Cardano - Wrapping",
            content: (
              <WrapContent
                setSelectedToken={setSelectedToken}
                selectedToken={selectedToken}
                wscProvider={wscProvider}
                amount={
                  currentAmountWei
                    ? ethers.utils.formatEther(new BigNumber(currentAmountWei).toString())
                    : "0"
                }
              />
            )
          },

          {
            title: "Action Execution",
            content: (
              <ActionExecutionContent
                wscProvider={wscProvider}
                onWSCAction={onWSCAction}
              />
            )
          },
          {
            title: "Token Allowance",
            content: (
              <TokenAllowanceContent
                wscProvider={wscProvider}
                selectedToken={selectedToken}
              />
            )
          },
          {
            title: "Milkomeda - Unwrapping",
            content: <UnwrapContent wscProvider={wscProvider} />
          }
        ]
      : // TODO: unwrap first
        [
          { title: "Milkomeda - Unwrapping" },
          { title: "Token Allowance" },
          { title: "Action Execution" },
          { title: "Cardano - wrap" }
        ];

  const currentContent = steps[currentStep].content;

  return (
    <>
      <button type={type} className={className} onClick={showModal} disabled={disabled}>
        {children}
      </button>

      <Modal
        className="custom"
        title="Wrapped Smart Contract"
        visible={isModalOpen}
        width={800}
        onCancel={handleCancel}
        footer={[
          <button key="back" onClick={handlePrevStep} disabled={currentStep === 0}>
            Prev
          </button>,
          <button key="submit" type="primary" onClick={handleNextStep}>
            Next
          </button>
        ]}
      >
        <Steps current={currentStep}>
          {steps.map((item, idx) => (
            <Step key={idx} title={item.title} progressDot={item.progressDot} />
          ))}
        </Steps>
        <div className="steps-content">{currentContent}</div>
      </Modal>
    </>
  );
};

export default WSCButton;
