import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("═══════════════════════════════════════════");
  console.log("   Deploy MeloDash na rede Monad");
  console.log("═══════════════════════════════════════════");
  console.log("Deployer:", deployer.address);
  console.log("Balance: ", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MON");

  // Preço da assinatura: 20 MON
  // Ajuste conforme o preço do MON em relação ao USD
  const SUBSCRIPTION_PRICE = ethers.parseEther("20");

  console.log("\n📦 Fazendo deploy do contrato MeloDash...");
  console.log("   Preço da assinatura:", ethers.formatEther(SUBSCRIPTION_PRICE), "MON");

  const MeloDash = await ethers.getContractFactory("MeloDash");
  const melodash = await MeloDash.deploy(SUBSCRIPTION_PRICE);

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
