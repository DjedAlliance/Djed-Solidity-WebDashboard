export const BUY_SELL_OPTIONS = {
  BUY: "buy",
  SELL: "sell"
};

export const TRANSACTION_VALIDITY = {
  OK: "Transaction is valid.",
  WALLET_NOT_CONNECTED: "Wallet not connected",
  WRONG_NETWORK: "Walled connected to the wrong network",
  NONNUMERIC_INPUT: "Amount has to be a number",
  NEGATIVE_INPUT: "Amount cannot be negative",
  ZERO_INPUT: "Amount cannot be zero",
  INSUFFICIENT_BC: "Insufficient mADA balance",
  INSUFFICIENT_SC: "Insufficient Djed StableCoin balance",
  INSUFFICIENT_RC: "Insufficient Djed ReserveCoin balance",
  RESERVE_RATIO_LOW: "Reserve ratio too low",
  RESERVE_RATIO_HIGH: "Reserve ratio too high",
  TRANSACTION_LIMIT_REACHED: "Transaction limit is reached"
};

export const COIN_DETAILS_REQUEST_INTERVAL = 4000;
export const ACCOUNT_DETAILS_REQUEST_INTERVAL = 4000;
export const TRANSACTION_USD_LIMIT = 10000;
