import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║       DelegateFlow — Sepolia Deployment          ║");
  console.log("╚══════════════════════════════════════════════════╝\n");
  console.log("Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");

  if (balance < ethers.parseEther("0.05")) {
    throw new Error("Insufficient Sepolia ETH. Get some from https://sepoliafaucet.com");
  }

  const addresses = {};

  // ── 1. ZKMembershipVerifier ──────────────────────────────────────
  console.log("1/6  Deploying ZKMembershipVerifier...");
  const ZKVerifier = await ethers.getContractFactory("ZKMembershipVerifier");
  const zkVerifier = await ZKVerifier.deploy();
  await zkVerifier.waitForDeployment();
  addresses.ZKMembershipVerifier = await zkVerifier.getAddress();
  console.log("     ✅", addresses.ZKMembershipVerifier);

  // ── 2. NativeTokenTransferAmountEnforcer ─────────────────────────
  console.log("2/6  Deploying NativeTokenTransferAmountEnforcer...");
  const NativeEnforcer = await ethers.getContractFactory("NativeTokenTransferAmountEnforcer");
  const nativeEnforcer = await NativeEnforcer.deploy();
  await nativeEnforcer.waitForDeployment();
  addresses.NativeTokenTransferAmountEnforcer = await nativeEnforcer.getAddress();
  console.log("     ✅", addresses.NativeTokenTransferAmountEnforcer);

  // ── 3. TimeBoundEnforcer ─────────────────────────────────────────
  console.log("3/6  Deploying TimeBoundEnforcer...");
  const TimeEnforcer = await ethers.getContractFactory("TimeBoundEnforcer");
  const timeEnforcer = await TimeEnforcer.deploy();
  await timeEnforcer.waitForDeployment();
  addresses.TimeBoundEnforcer = await timeEnforcer.getAddress();
  console.log("     ✅", addresses.TimeBoundEnforcer);

  // ── 4. AgentBudgetEnforcer ───────────────────────────────────────
  console.log("4/6  Deploying AgentBudgetEnforcer...");
  const BudgetEnforcer = await ethers.getContractFactory("AgentBudgetEnforcer");
  const budgetEnforcer = await BudgetEnforcer.deploy();
  await budgetEnforcer.waitForDeployment();
  addresses.AgentBudgetEnforcer = await budgetEnforcer.getAddress();
  console.log("     ✅", addresses.AgentBudgetEnforcer);

  // ── 5. DelegationManager ─────────────────────────────────────────
  console.log("5/6  Deploying DelegationManager (core)...");
  const DelegationManager = await ethers.getContractFactory("DelegationManager");
  const delegationManager = await DelegationManager.deploy();
  await delegationManager.waitForDeployment();
  addresses.DelegationManager = await delegationManager.getAddress();
  console.log("     ✅", addresses.DelegationManager);

  // ── 6. ZKGatedDelegationEnforcer ─────────────────────────────────
  console.log("6/6  Deploying ZKGatedDelegationEnforcer...");
  const ZKGated = await ethers.getContractFactory("ZKGatedDelegationEnforcer");
  const zkGated = await ZKGated.deploy(addresses.ZKMembershipVerifier);
  await zkGated.waitForDeployment();
  addresses.ZKGatedDelegationEnforcer = await zkGated.getAddress();
  console.log("     ✅", addresses.ZKGatedDelegationEnforcer);

  // ── Create a real demo delegation on-chain ────────────────────────
  console.log("\nCreating demo delegation on-chain...");
  const salt = ethers.hexlify(ethers.randomBytes(32));
  const tx = await delegationManager.createDelegation(
    deployer.address,
    deployer.address,
    ethers.ZeroHash,
    [],
    salt,
    Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
  );
  const receipt = await tx.wait();
  addresses.demoDelegationTxHash = receipt.hash;
  console.log("     ✅ Tx Hash:", addresses.demoDelegationTxHash);

  // ── Save to JSON ─────────────────────────────────────────────────
  const outputPath = path.join(__dirname, "..", "deployed-addresses.json");
  const output = {
    network: "sepolia",
    chainId: 11155111,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: addresses,
    etherscanBase: "https://sepolia.etherscan.io"
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY!         ║");
  console.log("╚══════════════════════════════════════════════════╝\n");
  
  for (const [name, addr] of Object.entries(addresses)) {
    if (name === "demoDelegationTxHash") {
      console.log(`  ${name}:\n  https://sepolia.etherscan.io/tx/${addr}\n`);
    } else {
      console.log(`  ${name}:\n  https://sepolia.etherscan.io/address/${addr}\n`);
    }
  }

  console.log("Addresses saved to: deployed-addresses.json");
  console.log("Run: npm run update-readme   (next step)");
}

main().catch((error) => {
  console.error("\n❌ Deployment failed:", error.message);
  process.exit(1);
});
