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

const WalletConnectButton = () => {
  const {
    isFlintWalletInstalled,
    isMetamaskWalletInstalled,
    isWalletConnected,
    account,
    connectMetamask,
    connectFlintWallet,
    connectWSC,
    redirectToMetamask,
    redirectToFlint,
    activeConnector
  } = useAppProvider();

  const handleWrap = async () => {
    const provider = await activeConnector.getProvider();
    await provider.wrap();
    await provider.unwrap();
  };
  return (
    <div className="wrapper-connect-btn">
      {/*TODO: adapt UI on mobile*/}

      <Popover
        getPopupContainer={(trigger) => trigger.parentElement}
        content={
          isWalletConnected ? (
            <>
              {activeConnector?.id === "flint-wsc" && (
                <div className="content">
                  <p>What wrapped smart contract is</p>
                  <button onClick={handleWrap}>Wrap</button>
                  <button>Unwrap</button>
                </div>
              )}
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
                onClick={isFlintWalletInstalled ? connectWSC : redirectToFlint}
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
