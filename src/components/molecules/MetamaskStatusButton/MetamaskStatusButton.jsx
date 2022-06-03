import React from "react";
import CustomButton from "../../atoms/CustomButton/CustomButton";
import { WalletOutlined } from "@ant-design/icons";
import { ReactComponent as Metamask } from "../../../images/metamask.svg";
import { useAppProvider } from "../../../context/AppProvider";
import { truncateAddress } from "../../../utils/address";

const MetamaskStatusButton = () => {
  const {
    isWalletInstalled,
    isWalletConnected,
    accounts,
    connectMetamask,
    redirectToMetamask
  } = useAppProvider();
  return (
    <CustomButton
      text={
        isWalletInstalled
          ? isWalletConnected
            ? truncateAddress(accounts[0])
            : "Connect Wallet"
          : "Install Metamask"
      }
      onClick={
        isWalletInstalled
          ? isWalletConnected
            ? () => {}
            : connectMetamask
          : redirectToMetamask
      }
      iconWallet={isWalletConnected ? <Metamask /> : <WalletOutlined />}
      variant={isWalletConnected ? "secondary" : "primary"}
    />
  );
};

export default MetamaskStatusButton;
