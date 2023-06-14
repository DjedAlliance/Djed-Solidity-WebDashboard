import React from "react";
import { useAppProvider } from "../../../context/AppProvider";
import "./_FlintWSCContent.scss";
import { Skeleton, Spin, Tabs, message } from "antd";
import BigNumber from "bignumber.js";

import { MilkomedaConstants } from "milkomeda-wsc/build/MilkomedaConstants";

import { TxPendingStatus } from "milkomeda-wsc/build/WSCLibTypes";

const useInterval = (callback, delay) => {
  const savedCallback = React.useRef(undefined);

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

function SuccessIcon(props) {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 20 20"
      aria-hidden="true"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
function IdleIcon(props) {
  return (
    <svg
      stroke="#a0a0ac"
      fill="#a0a0ac"
      strokeWidth="0"
      viewBox="0 0 20 20"
      aria-hidden="true"
      height="0.7em"
      width="0.7em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

function ReadyIcon() {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5"></path>
      <path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5"></path>
      <path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5"></path>
      <path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7l-.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47"></path>
      <path d="M5 3l-1 -1"></path>
      <path d="M4 7h-1"></path>
      <path d="M14 3l1 -1"></path>
      <path d="M15 6h1"></path>
    </svg>
  );
}
const CONNECTION_STATUS = {
  idle: "idle",
  success: "success",
  ready: "ready"
};
const statusIcon = {
  [CONNECTION_STATUS.idle]: <IdleIcon />,
  [CONNECTION_STATUS.success]: <SuccessIcon />,
  [CONNECTION_STATUS.ready]: <ReadyIcon />
};
const Step = ({ title, status, caption, isLast }) => {
  return (
    <>
      <div className="step">
        <div className={`step-icon ${CONNECTION_STATUS[status]}`}>
          {statusIcon[status]}
        </div>
        <div>
          <div className="step-label">{title}</div>
          {caption ? <div className="step-caption">{caption}</div> : null}
        </div>
      </div>
      {isLast ? null : (
        <svg
          className="connection-item"
          stroke="#c7803a"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="2em"
          width="2em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M21 17l-18 0"></path>
          <path d="M6 10l-3 -3l3 -3"></path>
          <path d="M3 7l18 0"></path>
          <path d="M18 20l3 -3l-3 -3"></path>
        </svg>
      )}
    </>
  );
};

const network = "Cardano C1 Devnet";
const FlintWSCContent = () => {
  const { activeConnector } = useAppProvider();
  const [provider, setProvider] = React.useState(null);

  const [pendingTxs, setPendingTxs] = React.useState([]);
  const [address, setAddress] = React.useState(null);
  const [destinationBalance, setDestinationBalance] = React.useState(null);
  const [originBalance, setOriginBalance] = React.useState(null);
  const [originTokens, setOriginTokens] = React.useState([]);
  const [tokens, setTokens] = React.useState([]);
  const [originAddress, setOriginAddress] = React.useState(null);
  const [currentSentTxs, setCurrentSentTxs] = React.useState({});

  const [status, setStatus] = React.useState("idle");

  const wrapWrapper = async (destination, assetId, amount) => {
    return provider?.wrap(destination, assetId, amount.toNumber());
  };

  useInterval(
    async () => {
      if (!provider || Object.keys(currentSentTxs).length === 0) return;

      for (const txHash of Object.keys(currentSentTxs)) {
        const response = await provider.getTxStatus(txHash);

        if (response === TxPendingStatus.WaitingL1Confirmation) {
          message.loading({
            content: `Waiting L1 confirmation for your ${currentSentTxs[txHash]} asset...`,
            key: txHash,
            duration: 0
          });
        }
        if (response === TxPendingStatus.WaitingBridgeConfirmation) {
          message.loading({
            content: `Waiting Bridge confirmation for your ${currentSentTxs[txHash]} asset (~3m)...`,
            key: txHash,
            duration: 0
          });
        }
        if (response === TxPendingStatus.WaitingL2Confirmation) {
          message.loading({
            content: `Waiting L2 confirmation for your ${currentSentTxs[txHash]} asset...`,
            key: txHash,
            duration: 0
          });
        }
        if (response === TxPendingStatus.Confirmed) {
          message.success({
            content: `Your ${currentSentTxs[txHash]} asset has been successfully moved!`,
            key: txHash,
            duration: 3
          });
          const newCurrentSentTxs = { ...currentSentTxs };
          delete newCurrentSentTxs[txHash];
          setCurrentSentTxs(newCurrentSentTxs);
        }
      }
    },
    Object.keys(currentSentTxs).length === 0 ? 4000 : null
  );

  const areTokensAllowed = async (assetIds) => {
    return await provider?.areTokensAllowed(assetIds);
  };

  const unwrapWrapper = async (destination, assetId, amount) => {
    return provider?.unwrap(destination, assetId, amount);
  };

  const moveAssetsToL1 = async (tokenId, tokenName, amount) => {
    await provider?.unwrap(undefined, tokenId, amount);
  };

  const updateWalletData = React.useCallback(async () => {
    if (!provider) return;
    const destinationBalance = await provider.eth_getBalance();
    setDestinationBalance(destinationBalance);

    const originBalance = await provider.origin_getNativeBalance();
    setOriginBalance(originBalance);

    const pendingTxs = await provider.getPendingTransactions();
    setPendingTxs(pendingTxs ?? []);

    const originTokens = await provider.origin_getTokenBalances();
    setOriginTokens(originTokens ?? []);

    const tokenBalances = await provider.getTokenBalances();
    setTokens(tokenBalances ?? []);
  }, [provider]);

  useInterval(() => {
    updateWalletData();
  }, 5000);

  React.useEffect(() => {
    const init = async () => {
      setStatus("pending");
      try {
        const provider = await activeConnector.getProvider();
        if (!provider) return;
        const address = await provider.eth_getAccount();
        const tokenBalances = await provider.getTokenBalances();
        const originAddress = await provider.origin_getAddress();
        setOriginAddress(originAddress);

        setTokens(tokenBalances ?? []);
        await updateWalletData();
        setProvider(provider);
        setAddress(address);
        setStatus("success");
      } catch (error) {
        setStatus("rejected");
        console.error(error);
      }
    };
    init();
  }, [activeConnector, updateWalletData]);

  const isLoading = status === "pending" || status === "idle";
  const isError = status === "rejected";
  const isSuccess = status === "success";

  const connectionStatus = React.useMemo(() => {
    const isOriginBalanceNotZero = originBalance != null && originBalance !== 0;
    const isDestinationBalanceNotZero =
      destinationBalance != null && destinationBalance !== 0;
    return [
      {
        label: "Cardano",
        status: isOriginBalanceNotZero ? "success" : "idle"
      },
      {
        label: "WSC",
        status: isDestinationBalanceNotZero ? "success" : "idle"
      },
      {
        label: "Dapp",
        caption: "(Ready to Go)",
        status: isOriginBalanceNotZero && isDestinationBalanceNotZero ? "ready" : "idle"
      }
    ];
  }, [originBalance, destinationBalance]);

  return (
    <div className="content">
      <div className="header">
        {connectionStatus.map((item, index, arr) => {
          return (
            <Step
              key={index}
              title={item.label}
              caption={item.caption}
              status={item.status}
              isLast={arr.length - 1 === index}
            />
          );
        })}
      </div>
      <Tabs>
        <Tabs.TabPane tab="About" key="about">
          <WSCAbout />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Cardano" key="cardano">
          <CardanoAssets
            tokens={originTokens}
            wrap={wrapWrapper}
            isLoading={isLoading}
            isSuccess={isSuccess}
            address={originAddress}
            currentSentTxs={currentSentTxs}
            setCurrentSentTxs={setCurrentSentTxs}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Pending" key="pending">
          <h2>List of pending transactions between Cardano and Milkomeda</h2>
          <ul>
            {isLoading && (
              <>
                <Skeleton.Avatar active size="large" shape="square" />
                <Skeleton.Avatar active size="large" shape="square" />
                <Skeleton.Avatar active size="large" shape="square" />
                <Skeleton.Avatar active size="large" shape="square" />
              </>
            )}
            {isSuccess && pendingTxs?.length === 0 && (
              <p className="not-found">No pending transaction found.</p>
            )}
            {isSuccess &&
              pendingTxs?.length > 0 &&
              pendingTxs.map((tx, index) => {
                const localDateTime = new Date(tx.timestamp * 1000).toLocaleString();
                const shortHash = `${tx.hash.slice(0, 10)}...${tx.hash.slice(-10)}`;
                return (
                  <li key={index}>
                    <div>
                      <span>Hash:</span>
                      <a
                        href={tx.explorer}
                        className="value"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {shortHash}
                      </a>
                    </div>
                    <div>
                      <span>Timestamp:</span>
                      <span className="value">{localDateTime}</span>
                    </div>
                    <div>
                      <span>Type:</span>
                      <span>
                        {tx.type === "Wrap" ? "Moving to Milkomeda" : "Moving to L1"}
                      </span>
                    </div>
                  </li>
                );
              })}
          </ul>
        </Tabs.TabPane>

        <Tabs.TabPane tab="WSC Wallet" key="wsc-wallet">
          <WSCAssets
            address={address}
            destinationBalance={destinationBalance}
            network={network}
            tokens={tokens}
            moveAssetsToL1={moveAssetsToL1}
            areTokensAllowed={areTokensAllowed}
            unwrap={unwrapWrapper}
            isLoading={isLoading}
            isSuccess={isSuccess}
            currentSentTxs={currentSentTxs}
            setCurrentSentTxs={setCurrentSentTxs}
          />
        </Tabs.TabPane>
      </Tabs>
      {isError && (
        <div className="error">
          <h2>Something went wrong</h2>
          <p>Please try again later</p>
        </div>
      )}
    </div>
  );
};

export default FlintWSCContent;

const CardanoAssets = ({
  tokens = [],
  wrap,
  isLoading,
  isSuccess,
  address,
  currentSentTxs,
  setCurrentSentTxs
}) => {
  const [tokenAmounts, setTokenAmounts] = React.useState(new Map());
  const [amounts, setAmounts] = React.useState([]);

  React.useEffect(() => {
    setAmounts(
      tokens.map((token) => {
        if (token.decimals) {
          const quantity = new BigNumber(token.quantity);
          const divisor = new BigNumber(10).pow(token.decimals);
          return quantity.dividedBy(divisor).toString();
        }
        return token.quantity;
      })
    );
  }, [tokens]);

  const updateTokenAmount = (tokenUnit, amount) => {
    const newTokenAmounts = new Map(tokenAmounts);
    newTokenAmounts.set(tokenUnit, amount);
    setTokenAmounts(newTokenAmounts);
  };

  const moveToken = async (token) => {
    message.loading({
      content: `Starting ${token.assetName} asset moving...`,
      key: "moving-asset-L2",
      duration: 0
    });
    try {
      const txHash = await wrap(
        undefined,
        token.unit,
        new BigNumber(tokenAmounts.get(token.unit) || "0")
      );
      const transactions = { ...currentSentTxs };
      transactions[txHash] = token.assetName;
      setCurrentSentTxs(transactions);

      message.destroy("moving-asset-L2");
      message.loading({
        content: `Moving your ${token.assetName} asset...`,
        key: txHash,
        duration: 0
      });

      updateTokenAmount(token.unit, "");
    } catch (err) {
      console.error(err);
      message.error({
        content: `Something went wrong. ${err.message ? `Error: ${err.message}` : ""}`,
        key: "moving-asset-L2"
      });
    }
  };

  const setMaxAmount = (token) => {
    const amount = new BigNumber(token.quantity);
    const decimals = token.decimals ? new BigNumber(token.decimals) : new BigNumber(0);
    const adjustedAmount = amount.dividedBy(new BigNumber(10).pow(decimals));
    updateTokenAmount(token.unit, adjustedAmount.toString());
  };

  return (
    <div>
      <h2>Assets in Your Cardano Wallet</h2>
      {address ? (
        <p className="address">
          Origin Address <span> {address}</span>
        </p>
      ) : null}
      <ul>
        {isLoading && (
          <>
            <Skeleton.Avatar active size="large" shape="square" />
            <Skeleton.Avatar active size="large" shape="square" />
            <Skeleton.Avatar active size="large" shape="square" />
            <Skeleton.Avatar active size="large" shape="square" />
          </>
        )}

        {isSuccess &&
          tokens.map((token, index) => (
            <li key={index}>
              <div>
                <span>Token</span>
                <span className="value">{token.assetName}</span>
              </div>
              <div>
                <span>Amount</span>
                <span className="value">{amounts[index]}</span>
              </div>
              {token.bridgeAllowed && (
                <>
                  <div className="actions">
                    <span>Move Amount:</span>
                    <input
                      type="text"
                      value={tokenAmounts.get(token.unit) || ""}
                      onChange={(e) => updateTokenAmount(token.unit, e.target.value)}
                      placeholder="Enter amount"
                    />
                    <button
                      className="button-primary-small"
                      onClick={() => moveToken(token)}
                    >
                      Move to L2
                    </button>
                    <button
                      className="button-primary-small"
                      onClick={() => setMaxAmount(token)}
                    >
                      All
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

const WSCAssets = ({
  destinationBalance,
  network,
  tokens,
  unwrap,
  moveAssetsToL1,
  areTokensAllowed,
  isLoading,
  isSuccess,
  address,
  currentSentTxs,
  setCurrentSentTxs
}) => {
  const [allowedTokensMap, setAllowedTokensMap] = React.useState({});

  React.useEffect(() => {
    const assetIds = tokens.map((token) => token.contractAddress);
    areTokensAllowed(assetIds).then(setAllowedTokensMap);
  }, [tokens, areTokensAllowed]);

  const normalizeAda = (amount) => {
    const maxDecimalPlaces = 6;
    const decimalIndex = amount.indexOf(".");
    return decimalIndex === -1
      ? destinationBalance
      : destinationBalance.slice(0, decimalIndex + maxDecimalPlaces + 1);
  };

  return (
    <div>
      <h2>Assets in Your Wrapped Smart Contract Wallet</h2>
      {address ? (
        <p className="address">
          Connected WSC Address <span>{address}</span>
        </p>
      ) : null}
      <WSCWalletLink />
      <ul>
        {isLoading && (
          <>
            <Skeleton.Avatar active size="large" shape="square" />
            <Skeleton.Avatar active size="large" shape="square" />
            <Skeleton.Avatar active size="large" shape="square" />
            <Skeleton.Avatar active size="large" shape="square" />
          </>
        )}
        {isSuccess && destinationBalance && (
          <li>
            <div>
              <span>Token</span>
              <span>ADA</span>
            </div>
            <div>
              <span>Amount:</span>
              <span className="value">{destinationBalance}</span>
            </div>
            <div>
              <span>Contract Address</span>
              <a
                href={`${MilkomedaConstants.getEVMExplorerUrl(
                  network
                )}/address/0x319f10d19e21188ecF58b9a146Ab0b2bfC894648`}
                target="_blank"
                rel="noreferrer"
              >
                0x319f...4648
              </a>
            </div>
            <button
              className="button-primary-small"
              onClick={async () => {
                try {
                  message.loading({
                    content: `Starting ADA asset moving...`,
                    key: "moving-asset-L1",
                    duration: 0
                  });
                  const normalizedAda = normalizeAda(destinationBalance);
                  console.log("normalizedAda", normalizedAda);
                  const lovelace = new BigNumber(normalizedAda).multipliedBy(
                    new BigNumber(10).pow(6)
                  );
                  const txHash = await unwrap(undefined, undefined, lovelace);
                  const transactions = { ...currentSentTxs };
                  transactions[txHash] = "ADA"; // token name
                  setCurrentSentTxs(transactions);
                  message.destroy("moving-asset-L1");
                  message.loading({
                    content: `Moving your ADA asset...`,
                    key: txHash,
                    duration: 0
                  });
                } catch (err) {
                  message.error({
                    content: `Something went wrong. ${
                      err.message ? `Error: ${err.message}` : ""
                    }`,
                    key: "moving-asset-L1"
                  });
                }
              }}
            >
              Move all to L1
            </button>
          </li>
        )}
        {isSuccess &&
          tokens?.map((token, index) => {
            const balance = new BigNumber(token.balance);
            const decimals = new BigNumber(token.decimals);
            const adjustedBalance = balance.dividedBy(new BigNumber(10).pow(decimals));
            const shortAddress = `${token.contractAddress.slice(
              0,
              6
            )}...${token.contractAddress.slice(-4)}`;

            return (
              <li key={index}>
                <div>
                  <span>Token</span>
                  <span>
                    {token.name} ({token.symbol.toUpperCase()})
                  </span>
                </div>
                <div>
                  <span>Amount:</span>
                  <span className="value">{adjustedBalance.toString()}</span>
                </div>
                <div>
                  <span>Contract Address</span>
                  <a
                    href={`${MilkomedaConstants.getEVMExplorerUrl(network)}/address/${
                      token.contractAddress
                    }`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {shortAddress}
                  </a>
                </div>
                {allowedTokensMap[token.contractAddress] ? (
                  <button
                    className="button-primary-small"
                    onClick={async () => {
                      try {
                        message.loading({
                          content: `Starting ${token.assetName} asset moving...`,
                          key: "moving-asset-L1-asset",
                          duration: 0
                        });
                        const txHash = await moveAssetsToL1(
                          token.contractAddress,
                          token.name,
                          new BigNumber(token.balance)
                        );
                        const transactions = { ...currentSentTxs };
                        transactions[txHash] = token.name; // token name
                        setCurrentSentTxs(transactions);
                        message.destroy("moving-asset-L1-asset");

                        message.loading({
                          content: `Moving your ${token.name} asset...`,
                          key: txHash,
                          duration: 0
                        });
                      } catch (err) {
                        message.error({
                          content: `Something went wrong. ${
                            err.message ? `Error: ${err.message}` : ""
                          }`,
                          key: "moving-asset-L1-asset"
                        });
                      }
                    }}
                  >
                    Move all to L1
                  </button>
                ) : (
                  "Not Allowed in Bridge"
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export const WSCWalletLink = () => {
  return (
    <a
      className="external-link"
      target="_button"
      href="https://wsc-wallet-dev.milkomeda.com/"
    >
      <span>Go to WSC Wallet Page</span>
      <svg
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    </a>
  );
};

export const WSCAbout = () => {
  const title = "What are Wrapped Smart Contracts?";
  const content =
    "Wrapped Smart Contracts are a new concept aimed at facilitating interaction with smart contracts on sidechains or Layer 2 (L2) solutions without the need for users to directly migrate to these new ecosystems.<br/><br/> The Layer 1 (L1) blockchain acts as a robust coordination layer, allowing users to execute smart contracts on sidechains or L2 while remaining on the L1 blockchain. This provides a user-friendly experience, as users can interact with various systems without changing wallets or needing a deep understanding of the underlying processes.";
  const secondTitle = "How it works";
  const secondContent =
    "Every single step requires user interaction in the form of a transaction.";
  const bulletContent = [
    "User Action: The user initiates an action on a dApp while on the main blockchain. This request is translated into specific parameters for a proxy smart contract.",
    "Proxy Deployment and Execution: A proxy smart contract, reflecting the user's intent, is deployed on the sidechain. The proxy contract then interacts with the appropriate smart contract on the sidechain to execute the desired action.",
    "Result Processing: The outcome from the sidechain smart contract execution is relayed back to the user on the main blockchain. The user's state is updated, and they see the results of their action on the dApp, all while staying on the main blockchain."
  ];
  const link = "http://example.com/my-article-link";
  const secondLink = "http://example.com/my-article-link";

  return (
    <div>
      <h2>{title}</h2>
      <p dangerouslySetInnerHTML={{ __html: content }} />
      <div style={{ textAlign: "right" }}>
        <a href={link}>Read more</a>
      </div>
      <h2>{secondTitle}</h2>
      <p dangerouslySetInnerHTML={{ __html: secondContent }} />
      <ul>
        {bulletContent.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <div style={{ textAlign: "right" }}>
        <a href={secondLink}>Read more</a>
      </div>
    </div>
  );
};
