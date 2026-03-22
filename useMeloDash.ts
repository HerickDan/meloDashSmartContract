// useMeloDash.ts
// Hook de integração frontend com o contrato MeloDash usando viem
// Compatível com React + wagmi ou uso direto

import { createPublicClient, createWalletClient, http, parseEther, formatEther, custom } from "viem";
import { MELODASH_ABI, MELODASH_ADDRESS, MONAD_TESTNET_CHAIN_ID } from "./melodash.abi";

// ─── Configuração da chain Monad Testnet ─────────────────────────────────────
const monadTestnet = {
  id: MONAD_TESTNET_CHAIN_ID,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "Monad Explorer", url: "https://testnet.monadexplorer.com" },
  },
};

// ─── Cliente público (leitura) ────────────────────────────────────────────────
const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

// ─── LEITURA: verificar se usuário é assinante ────────────────────────────────
export async function checkSubscription(userAddress: `0x${string}`): Promise<boolean> {
  return await publicClient.readContract({
    address: MELODASH_ADDRESS,
    abi: MELODASH_ABI,
    functionName: "isSubscribed",
    args: [userAddress],
  });
}

// ─── LEITURA: buscar info do assinante ───────────────────────────────────────
export async function getSubscriberInfo(userAddress: `0x${string}`) {
  const [expiry, cashbackBalance, pendingCashback] = await publicClient.readContract({
    address: MELODASH_ADDRESS,
    abi: MELODASH_ABI,
    functionName: "getSubscriberInfo",
    args: [userAddress],
  });

  return {
    expiry: new Date(Number(expiry) * 1000).toLocaleDateString("pt-BR"),
    cashbackBalance: formatEther(cashbackBalance) + " MON",
    pendingCashback: formatEther(pendingCashback) + " MON",
  };
}

// ─── LEITURA: preço da assinatura ────────────────────────────────────────────
export async function getSubscriptionPrice(): Promise<string> {
  const price = await publicClient.readContract({
    address: MELODASH_ADDRESS,
    abi: MELODASH_ABI,
    functionName: "subscriptionPrice",
  });
  return formatEther(price);
}

// ─── ESCRITA: assinar a plataforma ───────────────────────────────────────────
export async function subscribe(priceInMON: string) {
  // Requer window.ethereum (MetaMask / carteira web3)
  const walletClient = createWalletClient({
    chain: monadTestnet,
    transport: custom(window.ethereum),
  });

  const [account] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    address: MELODASH_ADDRESS,
    abi: MELODASH_ABI,
    functionName: "subscribe",
    account,
    value: parseEther(priceInMON),
  });

  console.log("✅ Assinatura enviada! Tx:", hash);
  return hash;
}

// ─── ESCRITA: renovar assinatura ─────────────────────────────────────────────
export async function renew(priceInMON: string) {
  const walletClient = createWalletClient({
    chain: monadTestnet,
    transport: custom(window.ethereum),
  });

  const [account] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    address: MELODASH_ADDRESS,
    abi: MELODASH_ABI,
    functionName: "renew",
    account,
    value: parseEther(priceInMON),
  });

  console.log("✅ Renovação enviada! Tx:", hash);
  return hash;
}

// ─── ESCRITA: sacar cashback ──────────────────────────────────────────────────
export async function withdrawCashback() {
  const walletClient = createWalletClient({
    chain: monadTestnet,
    transport: custom(window.ethereum),
  });

  const [account] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    address: MELODASH_ADDRESS,
    abi: MELODASH_ABI,
    functionName: "withdrawCashback",
    account,
  });

  console.log("✅ Saque de cashback enviado! Tx:", hash);
  return hash;
}

// ─── BACKEND: fechar mês (apenas owner) ──────────────────────────────────────
export async function closeMonth(ownerPrivateKey: `0x${string}`) {
  const { privateKeyToAccount } = await import("viem/accounts");
  const account = privateKeyToAccount(ownerPrivateKey);

  const walletClient = createWalletClient({
    chain: monadTestnet,
    transport: http(),
    account,
  });

  const hash = await walletClient.writeContract({
    address: MELODASH_ADDRESS,
    abi: MELODASH_ABI,
    functionName: "closeMonth",
    account,
  });

  console.log("✅ Mês fechado! Tx:", hash);
  return hash;
}
