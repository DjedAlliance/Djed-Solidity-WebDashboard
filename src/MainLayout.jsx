import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import MetamaskStatusButton from "./components/molecules/MetamaskStatusButton/MetamaskStatusButton";

import { ReactComponent as Logo } from "./images/logoipsum.svg";

import "antd/dist/antd.css";
import "./App.scss";
import { useAppProvider } from "./context/AppProvider";

const { Header, Content } = Layout;

export default function MainLayout() {
  const { isWalletConnected } = useAppProvider();
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
              <Link to="/stablecoin">StableDjed</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/reservecoin">ReserveDjed</Link>
            </Menu.Item>
            {isWalletConnected ? (
              <Menu.Item key="4">
                <Link to="/my-balance">My Balance</Link>
              </Menu.Item>
            ) : null}
          </Menu>
          <div className="WalletConfig">
            <MetamaskStatusButton />
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
