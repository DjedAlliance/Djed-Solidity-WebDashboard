import React, { useEffect } from "react";
import { Modal, Steps, Icon, Spin, Select, message } from "antd";

import "./WSCButton.scss";
import { LoadingOutlined } from "@ant-design/icons";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { TxPendingStatus } from "milkomeda-wsc/build/WSCLibTypes";
import useInterval from "../../../utils/hooks/useInterval";
import { erc20ABI } from "@wagmi/core";
import { useSigner } from "wagmi";
import { useWSCProvider } from "../WSCProvider";

const { Step } = Steps;
const { Option } = Select;

const formatTokenAmount = (amount, decimals) => {
  if (decimals) {
    const divisor = new BigNumber(10).pow(decimals);
    return new BigNumber(amount).dividedBy(divisor).toString();
  }
  return amount;
};

const statusWrapFirstMessages = {
  init: "Staring wrapping your token...",
  pending: "Wrapping your tokens...",
  [TxPendingStatus.WaitingL1Confirmation]: "Waiting for L1 confirmation...",
  [TxPendingStatus.WaitingBridgeConfirmation]: "Waiting for bridge confirmation...",
  [TxPendingStatus.WaitingL2Confirmation]: "Waiting for L2 confirmation...",
  [TxPendingStatus.Confirmed]: "Your asset has been successfully moved! Go to Next Step!",
  error: "Ups something went wrong."
};
const statusUnwrapFirstMessages = {
  init: "Staring unwrapping your token...",
  pending: "Unwrapping your tokens...",
  [TxPendingStatus.WaitingL1Confirmation]: "Waiting for L1 confirmation...",
  [TxPendingStatus.WaitingBridgeConfirmation]: "Waiting for bridge confirmation...",
  [TxPendingStatus.WaitingL2Confirmation]: "Waiting for L2 confirmation...",
  [TxPendingStatus.Confirmed]: "Your asset has been successfully moved! Go to Next Step!",
  error: "Ups something went wrong."
};
const WrapContent = ({
  defaultAmountEth,
  token: defaultTokenUnit = "lovelace",
  selectedToken,
  setSelectedToken,
  amount,
  setAmount,
  goNextStep
}) => {
  const { wscProvider, originTokens } = useWSCProvider();
  const [formattedOriginTokens, setFormattedOriginTokens] = React.useState([]);

  const [txHash, setTxHash] = React.useState(null);

  const [txStatus, setTxStatus] = React.useState("idle");

  useInterval(
    async () => {
      if (!wscProvider || txHash == null) return;
      const response = await wscProvider.getTxStatus(txHash);
      setTxStatus(response);
      if (response === TxPendingStatus.Confirmed) {
        setTxHash(null);
        setTimeout(() => {
          goNextStep();
        }, 2000);
      }
    },
    txHash != null ? 4000 : null
  );

  const wrapToken = async () => {
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
      const token = originTokens.find((t) => t.unit === defaultTokenUnit);
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
      setFormattedOriginTokens(formattedTokens ?? []);
    };
    loadOriginTokens();
  }, [defaultAmountEth, defaultTokenUnit, originTokens, setSelectedToken]);

  if (!selectedToken) return <div>Loading...</div>;

  const isAmountValid = new BigNumber(amount).lte(selectedToken.quantity);

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
          {formattedOriginTokens.map((token) => (
            <Option key={token.unit} value={token.unit}>
              {token.assetName}
            </Option>
          ))}
        </Select>
      </div>
      <p>
        You'll be wrapping{" "}
        <strong>
          {amount} {selectedToken.assetName}
        </strong>
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
        {txStatus !== TxPendingStatus.Confirmed &&
          txStatus !== "idle" &&
          txStatus !== "error" && (
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          )}
        {txStatus !== "idle" && <p>{statusWrapFirstMessages[txStatus]}</p>}
      </div>
    </div>
  );
};

const TokenAllowanceContent = ({ contractAddress, goNextStep }) => {
  const { data: signer } = useSigner();
  const { wscProvider, tokens } = useWSCProvider();
  const [approvalStatus, setApprovalStatus] = React.useState("idle");

  const onTokenAllowance = async () => {
    const selectedToken = tokens.find((t) => t.contractAddress === contractAddress);
    if (!selectedToken) return;

    const convertAmountBN = ethers.utils.parseUnits(
      selectedToken.balance,
      selectedToken?.decimals
    );

    try {
      setApprovalStatus("pending");
      const erc20Contract = new ethers.Contract(
        selectedToken.contractAddress,
        erc20ABI,
        signer
      );
      const bridgeAddress = "0x319f10d19e21188ecF58b9a146Ab0b2bfC894648";
      const approvalTx = await erc20Contract.functions.approve(
        bridgeAddress,
        convertAmountBN,
        { gasLimit: 500000 }
      );
      const approvalReceipt = await approvalTx.wait();
      console.log(approvalReceipt, "approvalReceipt");
      setApprovalStatus("success");
      setTimeout(() => {
        goNextStep();
      }, 2000);
    } catch (err) {
      setApprovalStatus("error");
      console.error(err);
    }
  };

  const isLoading = approvalStatus === "pending";
  const isSuccess = approvalStatus === "success";
  const isError = approvalStatus === "error";

  return (
    <div className="step-2-content">
      <h1>Token Allowance</h1>
      <div>
        <p>
          Here's a description of what's going on in this step. Lorem ipsum dolor sit
          amet, consectetur adipiscing elit. Nullam
        </p>
      </div>
      <div>
        {isLoading && (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        )}
        {isError && <p style={{ color: "red" }}>Try again, something went wrong</p>}
        {isSuccess && (
          <p>You've successfully approved the bridge to spend your tokens. Go Next!</p>
        )}
      </div>
      <button onClick={onTokenAllowance}>Token allowance</button>
    </div>
  );
};

const ActionExecutionContent = ({ wscProvider, onWSCAction, amount }) => {
  // TODO: need to find a way to know if everything went well
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
const UnwrapContent = ({
  contractAddress = "0x66c34c454f8089820c44e0785ee9635c425c9128"
}) => {
  const { wscProvider, tokens } = useWSCProvider();
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

  const unwrapToken = async () => {
    const selectedToken = tokens.find((t) => t.contractAddress === contractAddress);
    if (!selectedToken) return;

    setTxStatus("init");

    try {
      const txHash = await wscProvider.unwrap(
        undefined,
        selectedToken.contractAddress,
        new BigNumber(selectedToken.balance)
      );
      setTxHash(txHash);
      setTxStatus("pending");
    } catch (err) {
      console.error(err);
      setTxStatus("error");
    }
  };

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
      <div>{txStatus}</div>
      <div>
        {txStatus !== TxPendingStatus.Confirmed &&
          txStatus !== "idle" &&
          txStatus !== "error" && (
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          )}
        {txStatus !== "idle" && <p>{statusUnwrapFirstMessages[txStatus]}</p>}
      </div>
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
  direction,
  contractAddress = "0x66c34c454f8089820c44e0785ee9635c425c9128"
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [amount, setAmount] = React.useState(null);

  const [selectedToken, setSelectedToken] = React.useState(null);

  const showModal = () => {
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

  const steps =
    direction === directions.WRAP
      ? [
          {
            title: "Cardano - Wrapping",
            content: (
              <WrapContent
                setSelectedToken={setSelectedToken}
                selectedToken={selectedToken}
                amount={amount}
                setAmount={setAmount}
                defaultAmountEth={
                  currentAmountWei
                    ? ethers.utils.formatEther(new BigNumber(currentAmountWei).toString())
                    : "0"
                }
                goNextStep={handleNextStep}
              />
            )
          },

          {
            title: "Action Execution",
            content: <ActionExecutionContent onWSCAction={onWSCAction} />
          },
          {
            title: "Token Allowance",
            content: (
              <TokenAllowanceContent
                contractAddress={contractAddress}
                amount={amount}
                selectedToken={selectedToken}
                goNextStep={handleNextStep}
              />
            )
          },
          {
            title: "Milkomeda - Unwrapping",
            content: <UnwrapContent amount={amount} />
          }
        ]
      : // TODO: verify steps when selling and adjust logic
        [
          { title: "Milkomeda - Unwrapping", content: <UnwrapContent amount={amount} /> },
          {
            title: "Token Allowance",
            content: (
              <TokenAllowanceContent
                contractAddress={contractAddress}
                amount={amount}
                selectedToken={selectedToken}
              />
            )
          },
          {
            title: "Action Execution",
            content: <ActionExecutionContent onWSCAction={onWSCAction} />
          },
          {
            title: "Cardano - wrap",
            content: (
              <WrapContent
                setSelectedToken={setSelectedToken}
                selectedToken={selectedToken}
                amount={amount}
                setAmount={setAmount}
                defaultAmountEth={
                  currentAmountWei
                    ? ethers.utils.formatEther(new BigNumber(currentAmountWei).toString())
                    : "0"
                }
              />
            )
          }
        ];

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
        <Steps current={currentStep} labelPlacement="vertical">
          {steps.map((item, idx) => (
            <Step key={idx} title={item.title} />
          ))}
        </Steps>
        <div className="steps-content">{steps[currentStep].content}</div>
      </Modal>
    </>
  );
};

export default WSCButton;
