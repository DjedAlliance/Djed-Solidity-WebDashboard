export const BUY_SELL_OPTIONS = {
  BUY: "buy",
  SELL: "sell"
};

export const TRANSACTION_VALIDITY = {
  OK: "Transaction is valid.",
  WALLET_NOT_CONNECTED: "Wallet not connected",
  WRONG_NETWORK: "Wallet connected to the wrong network",
  NONNUMERIC_INPUT: "Amount has to be a number",
  NEGATIVE_INPUT: "Amount cannot be negative",
  ZERO_INPUT: "Amount cannot be zero",
  INSUFFICIENT_BC: "Insufficient balance",
  INSUFFICIENT_SC: "Insufficient StableCoin balance",
  INSUFFICIENT_RC: "Insufficient ReserveCoin balance",
  RESERVE_RATIO_LOW: "Reserve ratio would drop below the minimum",
  RESERVE_RATIO_HIGH: "Reserve ratio would rise above the maximum",
  TRANSACTION_LIMIT_REACHED: "Transaction limit reached"
};

export const COIN_DETAILS_REQUEST_INTERVAL = 4000;
export const ACCOUNT_DETAILS_REQUEST_INTERVAL = 4000;
export const TRANSACTION_USD_LIMIT = 10000;
export const BC_TOKEN_DECIMALS = 18;
export const HIGH_PRECISION_DECIMALS = 24;
export const REFRESH_PERIOD_MS = 4000;
