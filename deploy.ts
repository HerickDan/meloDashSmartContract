import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();
  const [deployer] = await ethers.getSigners();

  console.log("═══════════════════════════════════════════");
  console.log("   Deploy MeloDash na rede Monad");
  console.log("═══════════════════════════════════════════");
  console.log("Deployer:", deployer.address);
  console.log("Balance: ", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MON");

  // Preço da assinatura: 20 MON
  // Ajuste conforme o preço do MON em relação ao USD
  const SUBSCRIPTION_PRICE = ethers.parseEther("20");

  // Carteiras fixas (do .env)
  const PLATFORM_WALLET = process.env.PLATFORM_WALLET || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  const ARTIST_WALLET = process.env.ARTIST_WALLET || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

  console.log("\n📦 Fazendo deploy do contrato MeloDash...");
  console.log("   Preço da assinatura:", ethers.formatEther(SUBSCRIPTION_PRICE), "MON");
  console.log("   Plataforma:", PLATFORM_WALLET);
  console.log("   Artista:", ARTIST_WALLET);

  const MeloDash = await ethers.getContractFactory("MeloDash");
  const melodash = await MeloDash.deploy(SUBSCRIPTION_PRICE, PLATFORM_WALLET, ARTIST_WALLET);

  await melodash.waitForDeployment();

  const address = await melodash.getAddress();

  console.log("\n✅ Contrato deployado com sucesso!");
  console.log("   Endereço:", address);
  console.log("\n─────────────────────────────────────────────");
  console.log("📋 Resumo para integração com o frontend:");
  console.log("─────────────────────────────────────────────");
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log(`SUBSCRIPTION_PRICE=${SUBSCRIPTION_PRICE.toString()}`);
  console.log("─────────────────────────────────────────────");
  console.log("\n🔗 Verificar no explorer:");
  console.log(`   https://testnet.monadexplorer.com/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  });
