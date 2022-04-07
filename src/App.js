import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import { WalletOutlined } from "@ant-design/icons";

import CustomButton from "./components/atoms/CustomButton/CustomButton";

import { ReactComponent as Logo } from "./images/logoipsum.svg";
import { ReactComponent as Metamask } from "./images/metamask.svg";

import "antd/dist/antd.css";
import "./App.scss";

const { Header, Content, Footer } = Layout;

export default function App() {
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
            <CustomButton
              text="Set Wallet"
              theme="primary"
              iconWallet={<WalletOutlined />}
            />
            {/* Use this button once Metamask wallet is connected */}
            {/* <CustomButton
              text="0x2d7…3A49"
              theme="secondary"
              iconWallet={<Metamask />}
            /> */}
          </div>
        </Header>
        <Content style={{ padding: "0 50px" }}>
          <div className="site-layout-content">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </div>
  );
}
