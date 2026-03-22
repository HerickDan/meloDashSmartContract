import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // ─── Monad Testnet ───────────────────────────────────────────────
    monadTestnet: {
      url: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
    },
    // ─── Monad Mainnet ───────────────────────────────────────────────
    monadMainnet: {
      url: "https://rpc.monad.xyz",
      chainId: 143,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
    },
    // ─── Local (testes) ──────────────────────────────────────────────
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      monadTestnet: "no-api-key-needed",
      monadMainnet: "no-api-key-needed",
    },
    customChains: [
      {
        network: "monadTestnet",
        chainId: 10143,
        urls: {
          apiURL: "https://testnet.monadexplorer.com/api",
          browserURL: "https://testnet.monadexplorer.com",
        },
      },
      {
        network: "monadMainnet",
        chainId: 143,
        urls: {
          apiURL: "https://monadexplorer.com/api",
          browserURL: "https://monadexplorer.com",
        },
      },
    ],
  },
  paths: {
    sources:   "./contracts",
    tests:     "./test",
    cache:     "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
