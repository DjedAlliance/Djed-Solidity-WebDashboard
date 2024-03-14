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
    //isFlintWalletInstalled,
    //isEternlWalletInstalled,
    isMetamaskWalletInstalled,
    //isNufiWalletInstalled,
    //isNamiWalletInstalled,
    isWalletConnected,
    account,
    connectMetamask,
    /*connectFlintWallet,
    connectToFlintWSC,
    connectToEternlWSC,
    connectToNamiWSC,
    connectToNufiWSC,*/
    redirectToMetamask,
    /*redirectToFlint,
    redirectToEternl,
    redirectToNami,
    redirectToNufi*/
  } = useAppProvider();

  return (
    <div className="wrapper-connect-btn">
      <Popover
        getPopupContainer={(trigger) => trigger.parentElement}
        content={
          isWalletConnected ? (
            <DisconnectButton />
          ) : (
            <>
              <CustomButton
                text={isMetamaskWalletInstalled ? "MetaMask Wallet" : "Install Metamask"}
                onClick={isMetamaskWalletInstalled ? connectMetamask : redirectToMetamask}
                iconWallet={<WalletOutlined />}
                variant="primary"
              />
              {/* <CustomButton
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
              <CustomButton
                text={isNamiWalletInstalled ? "Nami WSC" : "Install Nami"}
                onClick={isNamiWalletInstalled ? connectToNamiWSC : redirectToNami}
                iconWallet={<WalletOutlined />}
                variant="primary"
              />
              <CustomButton
                text={isNufiWalletInstalled ? "NuFi WSC" : "Install NuFi"}
                onClick={isNufiWalletInstalled ? connectToNufiWSC : redirectToNufi}
                iconWallet={<WalletOutlined />}
                variant="primary"
              /> */}
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
