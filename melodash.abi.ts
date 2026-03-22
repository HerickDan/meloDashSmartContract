// melodash.abi.ts
// ABI do contrato MeloDash para integração com frontend (viem / ethers.js)

export const MELODASH_ABI = [
  // ─── WRITE ────────────────────────────────────────────────────────────────
  {
    "name": "subscribe",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [],
    "outputs": []
  },
  {
    "name": "renew",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [],
    "outputs": []
  },
  {
    "name": "withdrawCashback",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [],
    "outputs": []
  },
  {
    "name": "withdrawArtist",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [],
    "outputs": []
  },
  {
    "name": "withdrawPlatform",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [],
    "outputs": []
  },
  {
    "name": "closeMonth",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [],
    "outputs": []
  },
  {
    "name": "registerArtist",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "artist", "type": "address" }],
    "outputs": []
  },
  {
    "name": "removeArtist",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "artist", "type": "address" }],
    "outputs": []
  },
  {
    "name": "recordListening",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "user",    "type": "address" },
      { "name": "artist",  "type": "address" },
      { "name": "minutes_","type": "uint256" }
    ],
    "outputs": []
  },
  {
    "name": "updateSubscriptionPrice",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "newPrice", "type": "uint256" }],
    "outputs": []
  },

  // ─── READ ─────────────────────────────────────────────────────────────────
  {
    "name": "isSubscribed",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "name": "getSubscriberInfo",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [
      { "name": "expiry",          "type": "uint256" },
      { "name": "cashbackBalance", "type": "uint256" },
      { "name": "pendingCashback", "type": "uint256" }
    ]
  },
  {
    "name": "getArtistInfo",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "name": "artist", "type": "address" }],
    "outputs": [
      { "name": "registered",   "type": "bool"    },
      { "name": "balance",      "type": "uint256" },
      { "name": "totalMinutes", "type": "uint256" }
    ]
  },
  {
    "name": "subscriptionPrice",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "name": "currentMonth",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "name": "owner",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }]
  },

  // ─── EVENTS ───────────────────────────────────────────────────────────────
  {
    "name": "Subscribed",
    "type": "event",
    "inputs": [
      { "name": "user",   "type": "address", "indexed": true },
      { "name": "expiry", "type": "uint256", "indexed": false }
    ]
  },
  {
    "name": "Renewed",
    "type": "event",
    "inputs": [
      { "name": "user",   "type": "address", "indexed": true },
      { "name": "expiry", "type": "uint256", "indexed": false }
    ]
  },
  {
    "name": "MonthClosed",
    "type": "event",
    "inputs": [
      { "name": "month",         "type": "uint256", "indexed": true  },
      { "name": "totalPool",     "type": "uint256", "indexed": false },
      { "name": "artistPool",    "type": "uint256", "indexed": false },
      { "name": "platformPool",  "type": "uint256", "indexed": false },
      { "name": "cashbackPool",  "type": "uint256", "indexed": false }
    ]
  },
  {
    "name": "UserCashbackWithdrew",
    "type": "event",
    "inputs": [
      { "name": "user",   "type": "address", "indexed": true  },
      { "name": "amount", "type": "uint256", "indexed": false }
    ]
  },
  {
    "name": "ArtistWithdrew",
    "type": "event",
    "inputs": [
      { "name": "artist", "type": "address", "indexed": true  },
      { "name": "amount", "type": "uint256", "indexed": false }
    ]
  }
] as const;

// ─── Endereço do contrato (preencher após o deploy) ──────────────────────────
export const MELODASH_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

// ─── Chain IDs Monad ─────────────────────────────────────────────────────────
export const MONAD_TESTNET_CHAIN_ID = 10143;
export const MONAD_MAINNET_CHAIN_ID = 143;
