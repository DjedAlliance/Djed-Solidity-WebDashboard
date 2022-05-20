import React from "react";
import { render } from "react-dom";
import WrappedApp from "./WrappedApp";

import Web3 from "web3";
import { MinimalDjedWrapper } from "./wrapper/wrapper";

const BLOCKCHAIN_URI = "https://rpc-devnet-cardano-evm.c1.milkomeda.com/";
//const CHAIN_ID = 200101;
const DJED_ADDRESS = "0xa5D1ae7052785801f4681De9a9aA13294F1e8D3d";
const ORACLE_ADDRESS = "0xf1E16aC91dC04a9583E45Dc95ef1C41d485eBd84";
  
const web3 = new Web3(BLOCKCHAIN_URI);

let wrapper = new MinimalDjedWrapper(
  web3,
  //CHAIN_ID,
  DJED_ADDRESS,
  ORACLE_ADDRESS
);

wrapper.initialize().then(() => wrapper.getData());

const rootElement = document.getElementById("root");
render(
  <WrappedApp wrapper={wrapper}/>,
  rootElement
);
