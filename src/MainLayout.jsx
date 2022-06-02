import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Layout, Menu, Dropdown } from "antd";
import MetamaskStatusButton from "./components/molecules/MetamaskStatusButton/MetamaskStatusButton";

import { ReactComponent as Logo } from "./images/logoipsum.svg";

import "antd/dist/antd.css";
import "./App.scss";
import { useAppProvider } from "./context/AppProvider";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;

export default function MainLayout() {
  const { isWalletConnected } = useAppProvider();
  return (
    <div>
      <Layout className="layout">
        <Header className="header-desktop">
          <div className="logo">
            <Logo />
          </div>
          <Menu mode="horizontal">
            <Menu.Item key="1">
              <Link to="/protocol">Protocol</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/stabledjed">StableDjed</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/reservedjed">ReserveDjed</Link>
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
        <HeaderMobileMenu isWalletConnected={isWalletConnected} />
        <Content>
          <div className="site-layout-content">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </div>
  );
}

const HeaderMobileMenu = ({ isWalletConnected }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const MenuIcon = isMenuOpen ? CloseOutlined : MenuOutlined;
  const handleVisibleChange = (flag) => {
    setMenuOpen(flag);
  };

  return (
    <div className="header-mobile">
      <div className="logo">
        <Logo />
      </div>
      <Dropdown
        overlayClassName="menu-mobile-dropdown"
        visible={isMenuOpen}
        onVisibleChange={handleVisibleChange}
        overlay={
          <Menu mode="vertical" onClick={() => setMenuOpen(false)}>
            <Menu.Item key="1">
              <Link to="/protocol">Protocol</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/stabledjed">StableDjed</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/reservedjed">ReserveDjed</Link>
            </Menu.Item>
            {isWalletConnected ? (
              <Menu.Item key="4">
                <Link to="/my-balance">My Balance</Link>
              </Menu.Item>
            ) : null}
            <div className="WalletConfig">
              <MetamaskStatusButton />
            </div>
          </Menu>
        }
        placement="topLeft"
      >
        <MenuIcon
          style={{ fontSize: 22 }}
          className="menu-mobile-icon"
          onClick={() => setMenuOpen(!isMenuOpen)}
        />
      </Dropdown>
    </div>
  );
};
