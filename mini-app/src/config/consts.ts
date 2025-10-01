// Contract addresses
export const CONTRACT_ADDRESS = "EQDlmDFhvy9n2UlkYYQwLcwEjE5DgQSZC7SdjOETq2iaGn3A";//"kQC1FkVI8tL5b3PFQfHPKCxoIXaXHfmbIbamyXnyC3ICFERh";

// Network configuration
// Set to 'testnet' for testnet or 'mainnet' for mainnet
export const NETWORK: "testnet" | "mainnet" = "testnet"; // Change this based on where your contract is deployed

// TON Center API endpoints with alternatives for rate limiting
export const TON_CENTER_ENDPOINTS = {
  mainnet: "https://toncenter.com/api/v2/jsonRPC",
  testnet: "https://ton-testnet.api.onfinality.io/public"
} as const;

// Alternative endpoints (in case of rate limiting)
export const ALTERNATIVE_ENDPOINTS = {
  mainnet: [
    "https://toncenter.com/api/v2/jsonRPC",
    "https://go.getblock.io/your-api-key", // Replace with your GetBlock API key if needed
  ],
  testnet: [
    "https://testnet.toncenter.com/api/v2/jsonRPC",
    "https://testnet.tonapi.io/v2", // Alternative testnet endpoint
  ]
} as const;

// Rate limiting configuration
export const API_CONFIG = {
  RATE_LIMIT_DELAY: 7000, // 5 seconds between requests
  MAX_RETRIES: 22,
  RETRY_DELAY: 15000, // 15 seconds base retry delay
  POLLING_INTERVAL: 120000, // 120 seconds between automatic refreshes
} as const;
