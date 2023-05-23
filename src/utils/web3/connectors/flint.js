import { InjectedConnector } from "wagmi/connectors/injected";

export class FlintWalletConnector extends InjectedConnector {
  constructor(config) {
    super({
      ...config,
      options: {
        name: "Flint",
        getProvider: () =>
          typeof window !== "undefined" ? window?.evmproviders?.flint : undefined
      }
    });
  }
}
