import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Layout, Menu } from "antd";

//import CustomButton from "./components/atoms/CustomButton/CustomButton";
import MetamaskStatusButton from "./components/molecules/MetamaskStatusButton/MetamaskStatusButton";

import { ReactComponent as Logo } from "./images/logoipsum.svg";

import "antd/dist/antd.css";
import "./App.scss";

const { Header, Content } = Layout;

export default function MainLayout() {
  return (
    <div>
      <Layout className="layout">
        <Header>
          <div className="logo">
            <Logo />
          </div>
          <Menu mode="horizontal">
            <Menu.Item key="1">
              <Link to="/protocol">Protocol</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/stablecoin">Stablecoin</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/reservecoin">Reservecoin</Link>
            </Menu.Item>
            <Menu.Item key="4">
              <Link to="/my-balance">My Balance</Link>
            </Menu.Item>
          </Menu>
          <div className="WalletConfig">
            <MetamaskStatusButton />
            {/*<CustomButton
              text="Set Wallet"
              variant="primary"
              iconWallet={<WalletOutlined />}
            />*/}
            {/* Use this button once Metamask wallet is connected */}
            {/* <CustomButton
              text="0x2d7…3A49"
              variant="secondary"
              iconWallet={<Metamask />}
            /> */}
          </div>
        </Header>
        <Content>
          <div className="site-layout-content">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </div>
  );
}
