import React from "react";
import { useAppProvider } from "../../../context/AppProvider";
import "./_FlintWSCContent.scss";
import { Skeleton, Tabs } from "antd";
import BigNumber from "bignumber.js";

import { MilkomedaConstants } from "milkomeda-wsc/build/MilkomedaConstants";

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
const network = "Cardano C1 Devnet";
const FlintWSCContent = () => {
  const { activeConnector } = useAppProvider();
  const [provider, setProvider] = React.useState(null);

  // const [originAddress, setOriginAddress] = React.useState(null);
  const [pendingTxs, setPendingTxs] = React.useState([]);
  const [address, setAddress] = React.useState(null);
  const [destinationBalance, setDestinationBalance] = React.useState(null);
  const [originBalance, setOriginBalance] = React.useState(null);
  const [originTokens, setOriginTokens] = React.useState([]);
  const [tokens, setTokens] = React.useState([]);
  const [originAddress, setOriginAddress] = React.useState(null);

  const [status, setStatus] = React.useState("idle");

  const wrapWrapper = async (destination, assetId, amount) => {
    return provider?.wrap(destination, assetId, amount.toNumber());
  };

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
    const destinationBalance = await provider?.eth_getBalance();
    setDestinationBalance(destinationBalance);

    const originBalance = await provider?.origin_getNativeBalance();
    setOriginBalance(originBalance);

    const pendingTxs = await provider?.getPendingTransactions();
    setPendingTxs(pendingTxs ?? []);

    const originTokens = await provider?.origin_getTokenBalances();
    setOriginTokens(originTokens ?? []);
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
  console.log(pendingTxs, "pendingTxs");
  return (
    <div className="content">
      <Tabs>
        <Tabs.TabPane tab="Cardano" key="cardano">
          <CardanoAssets
            tokens={originTokens}
            wrap={wrapWrapper}
            isLoading={isLoading}
            isSuccess={isSuccess}
            address={originAddress}
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

const CardanoAssets = ({ tokens = [], wrap, isLoading, isSuccess, address }) => {
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
    console.log("Moving token", token.unit, "with amount", tokenAmounts.get(token.unit));
    await wrap(undefined, token.unit, new BigNumber(tokenAmounts.get(token.unit) || "0"));
    updateTokenAmount(token.unit, "");
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
  address
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
              onClick={() => {
                const normalizedAda = normalizeAda(destinationBalance);
                console.log("normalizedAda", normalizedAda);
                const lovelace = new BigNumber(normalizedAda).multipliedBy(
                  new BigNumber(10).pow(6)
                );
                unwrap(undefined, undefined, lovelace);
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
                    style={{ backgroundColor: "blue", color: "white" }}
                    onClick={() =>
                      moveAssetsToL1(
                        token.contractAddress,
                        token.name,
                        new BigNumber(token.balance)
                      )
                    }
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
