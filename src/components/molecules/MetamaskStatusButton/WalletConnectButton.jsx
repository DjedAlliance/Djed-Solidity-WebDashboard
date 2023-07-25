import React from "react";
import CustomButton from "../../atoms/CustomButton/CustomButton";
import { WalletOutlined } from "@ant-design/icons";
import { ReactComponent as Metamask } from "../../../images/metamask.svg";
import { useAppProvider } from "../../../context/AppProvider";
import { truncateAddress } from "../../../utils/address";
import { useNavigate } from "react-router-dom";
import "./_MetamaskStatusButton.scss";
import { useDisconnect } from "wagmi";
import { Button, Popover } from "antd";
import { WSCInterface } from "milkomeda-wsc-ui-test-beta";

const WalletConnectButton = () => {
  const {
    isFlintWalletInstalled,
    isEternlWalletInstalled,
    isMetamaskWalletInstalled,
    isWalletConnected,
    account,
    connectMetamask,
    connectFlintWallet,
    connectToFlintWSC,
    connectToEternlWSC,
    redirectToMetamask,
    redirectToFlint,
    redirectToEternl,
    activeConnector
  } = useAppProvider();

  return (
    <div className="wrapper-connect-btn">
      <Popover
        getPopupContainer={(trigger) => trigger.parentElement}
        content={
          isWalletConnected ? (
            <>
              {activeConnector?.id?.includes("wsc") && (
                <div className="only-desktop">
                  <WSCInterface />
                </div>
              )}
              <div className="only-mobile">
                <a
                  className="external-link"
                  rel="noopener noreferrer"
                  target="_blank"
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
              </div>
              <DisconnectButton />
            </>
          ) : (
            <>
              <CustomButton
                text={isMetamaskWalletInstalled ? "MetaMask Wallet" : "Install Metamask"}
                onClick={isMetamaskWalletInstalled ? connectMetamask : redirectToMetamask}
                iconWallet={<WalletOutlined />}
                variant="primary"
              />
              <CustomButton
                text={isFlintWalletInstalled ? "Flint Wallet" : "Install Flint"}
                onClick={isFlintWalletInstalled ? connectFlintWallet : redirectToFlint}
                iconWallet={<WalletOutlined />}
                variant="primary"
              />
              <CustomButton
                text={isFlintWalletInstalled ? "Flint WSC" : "Install Flint"}
                onClick={isFlintWalletInstalled ? connectToFlintWSC : redirectToFlint}
                iconWallet={<WalletOutlined />}
                variant="primary"
              />
              <CustomButton
                text={isEternlWalletInstalled ? "Eternl WSC" : "Install Eternl"}
                onClick={isEternlWalletInstalled ? connectToEternlWSC : redirectToEternl}
                iconWallet={<WalletOutlined />}
                variant="primary"
              />
            </>
          )
        }
        trigger="click"
        placement={"bottomRight"}
      >
        <Button>
          {isWalletConnected ? (
            <ConnectedWalletCard address={account} />
          ) : (
            "Connect your wallet"
          )}
        </Button>
      </Popover>
    </div>
  );
};

export const ConnectedWalletCard = ({ address }) => {
  return (
    <div className="custom-connect-card">
      <Metamask />
      <span>{truncateAddress(address)}</span>
    </div>
  );
};

export const DisconnectButton = () => {
  let navigate = useNavigate();
  const { disconnect } = useDisconnect();
  // const { setAccounts, setStoredAccounts } = useAppProvider();
  const handleDisconnect = () => {
    disconnect();
    navigate("/");
  };

  return <CustomButton onClick={handleDisconnect} variant="tertiary" text="Disconnect" />;
};

export default WalletConnectButton;
