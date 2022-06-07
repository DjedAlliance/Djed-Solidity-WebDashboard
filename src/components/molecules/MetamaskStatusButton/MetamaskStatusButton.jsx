import React from "react";
import CustomButton from "../../atoms/CustomButton/CustomButton";
import { WalletOutlined } from "@ant-design/icons";
import { ReactComponent as Metamask } from "../../../images/metamask.svg";
import { useAppProvider } from "../../../context/AppProvider";
import { truncateAddress } from "../../../utils/address";
import { useNavigate } from "react-router-dom";
import "./_MetamaskStatusButton.scss";

const MetamaskStatusButton = () => {
  const {
    isWalletInstalled,
    isWalletConnected,
    accounts,
    connectMetamask,
    redirectToMetamask
  } = useAppProvider();

  return isWalletConnected ? (
    <ConnectedWalletCard address={accounts[0]} />
  ) : (
    <CustomButton
      text={isWalletInstalled ? "Connect Wallet" : "Install Metamask"}
      onClick={isWalletInstalled ? connectMetamask : redirectToMetamask}
      iconWallet={<WalletOutlined />}
      variant="primary"
    />
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
  const { setAccounts } = useAppProvider();
  const handleDisconnect = () => {
    setAccounts([]);
    navigate("/");
  };

  return <CustomButton onClick={handleDisconnect} variant="tertiary" text="Disconnect" />;
};

export default MetamaskStatusButton;
