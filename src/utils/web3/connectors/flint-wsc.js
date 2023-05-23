import { WSCLib } from "milkomeda-wsc";
import { MilkomedaNetworkName, UserWallet } from "milkomeda-wsc";
import { Connector, ConnectorNotFoundError } from "wagmi";
import { normalizeChainId } from "@wagmi/core";

/**
 * Connector for [Flint WSC]
 */
export class FlintWSCConnector extends Connector {
  id = "flint-wsc";
  name = "Flint WSC";
  #provider;
  #sdk;

  shimDisconnectKey = `${this.id}.shimDisconnect`;

  constructor({ chains, options: options_ }) {
    const options = {
      shimDisconnect: false,
      ...options_
    };
    super({ chains, options });

    this.#sdk = new WSCLib(MilkomedaNetworkName.C1Devnet, UserWallet.Flint, {
      oracleUrl: null,
      blockfrostKey: "preprodliMqEQ9cvQgAFuV7b6dhA4lkjTX1eBLb",
      jsonRpcProviderUrl: null
    });
  }

  async connect() {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();

    if (provider.on) {
      provider.on("accountsChanged", this.onAccountsChanged);
      provider.on("chainChanged", this.onChainChanged);
      provider.on("disconnect", this.onDisconnect);
    }

    this.emit("message", { type: "connecting" });

    const account = await this.getAccount();
    const id = await this.getChainId();

    // Add shim to storage signalling wallet is connected
    if (this.options.shimDisconnect) this.storage?.setItem(this.shimDisconnectKey, true);

    return {
      account,
      chain: { id, unsupported: this.isChainUnsupported(id) }
    };
  }

  async disconnect() {
    const provider = await this.getProvider();
    if (!provider?.removeListener) return;

    provider.removeListener("accountsChanged", this.onAccountsChanged);
    provider.removeListener("chainChanged", this.onChainChanged);
    provider.removeListener("disconnect", this.onDisconnect);

    // Remove shim signalling wallet is disconnected
    if (this.options.shimDisconnect) this.storage?.removeItem(this.shimDisconnectKey);
  }

  async getAccount() {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    const account = await this.#provider.eth_getAccount();
    return account;
  }

  async getChainId() {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    return normalizeChainId(200101); // TODO: didn't find the network id from provider
  }

  async getProvider() {
    if (!this.#provider) {
      const wsc = await this.#sdk.inject();
      if (!wsc) throw new Error("Could not load WSC information");
      this.#provider = wsc;
    }
    console.log(this?.#provider, "this.#provider");
    return this.#provider;
  }

  async getSigner() {
    const provider = await this.getProvider();
    return (await provider.getEthersProvider()).getSigner();
  }

  async isAuthorized() {
    try {
      if (
        this.options.shimDisconnect &&
        // If shim does not exist in storage, wallet is disconnected
        !this.storage?.getItem(this.shimDisconnectKey)
      )
        return false;

      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }

  onAccountsChanged(_accounts) {
    // TODO:
  }

  onChainChanged(_chainId) {
    // TODO:
  }

  onDisconnect() {
    this.emit("disconnect");
  }
}
