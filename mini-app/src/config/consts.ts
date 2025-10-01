// Contract addresses
export const CONTRACT_ADDRESS = "kQC1FkVI8tL5b3PFQfHPKCxoIXaXHfmbIbamyXnyC3ICFERh";

// Network configuration
// Set to 'testnet' for testnet or 'mainnet' for mainnet
export const NETWORK: "testnet" | "mainnet" = "testnet"; // Change this based on where your contract is deployed

// TON Center API endpoints
export const TON_CENTER_ENDPOINTS = {
  mainnet: "https://toncenter.com/api/v2/jsonRPC",
  testnet: "https://testnet.toncenter.com/api/v2/jsonRPC"
} as const;
