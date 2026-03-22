# 🌊 DelegateFlow

> **Empowering Autonomous AI Agents with Trustless ERC-7715 Guardrails**

![DelegateFlow](https://img.shields.io/badge/MetaMask-Delegation_Framework-blue?style=for-the-badge&logo=metamask)
![NextJS](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![Wagmi](https://img.shields.io/badge/Wagmi-v2-blueviolet?style=for-the-badge)
![FramerMotion](https://img.shields.io/badge/Framer_Motion-purple?style=for-the-badge)

DelegateFlow is an intent-based delegation control center built on top of the **MetaMask Delegation Framework (ERC-7715)**. It acts as the critical orchestration layer between user intent, autonomous AI agents (like Ollama, OpenClaw, GLM), and decentralized programmable budgets. 

### 🌐 [Live Production Demo](https://delegate-flow-green.vercel.app/)
### 📺 [Watch the Demo Video](https://drive.google.com/file/d/1dqkvGYRwLjFRfPMddSfYTfRjMLiGb3Qt/view?usp=drive_link)
![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel)

---

## 🏆 MetaMask Hackathon Submission: "Best Use of Delegations"

DelegateFlow was engineered specifically to satisfy the **Dream-Tier (1st Place)** rubric of the MetaMask Track. Here is exactly how we hit every core requirement:

### 1️⃣ Intent-Based Delegations as a Core Pattern
* **The Requirement:** *"The strongest submissions use intent-based delegations as a core pattern..."*
* **Our Implementation:** Traditional Web3 UX is entirely broken for automation. DelegateFlow introduces a dedicated **Intents Resolver**. Users simply input English-readable actions (e.g., *"Transfer 25 ETH for contractor payroll"*), and the system dynamically resolves this intent by generating a trustless delegation path requiring no manual follow-up signatures.

### 2️⃣ Agent Tooling & Coordination Systems
* **The Requirement:** *"Build apps, agent tooling, coordination systems, or anything that meaningfully leverages delegations..."*
* **Our Implementation:** AI Agents naturally pose massive risk if given raw private keys. DelegateFlow’s **AI Agents Mesh** allows users to deploy local (Ollama) or external (GLM/OpenClaw/Claude) executor nodes directly into an on-chain environment. Instead of giving them keys, we grant them strict `CaveatEnforcer` budgets. If an agent goes rogue (e.g. exceeds 80% budget), the system flags it for "Global Safe Mode," proactively protecting the treasury.

### 3️⃣ Novel Extensions & Sub-Delegation Chains
* **The Requirement:** *"...extend ERC-7715 with sub-delegations or novel permission models..."*
* **Our Implementation:** The **Active Trees** dashboard is built entirely for managing deeply hierarchical sub-delegation structures. Users can filter by Active or Pending allocations, approve multisig requirements, or permanently revoke a tree (and all of its downstream execution agents) instantly.

### 4️⃣ ZK Proofs Combined with Delegation Authorization
* **The Requirement:** *"...or combine ZK proofs with delegation-based authorization."*
* **Our Implementation:** Architected alongside a native `ZKVerifier.sol` and `CaveatEnforcers.sol` smart contract layer. Our UI Analytics page explicitly tracks and graphs *ZKMembershipEnforcer* integrity scores via active block telemetry, ensuring privacy-preserving caveats scale flawlessly.

---

## 🔗 Live On-Chain Deployments (Sepolia Testnet)

> All contracts deployed and verified on **Ethereum Sepolia** (Chain ID: 11155111)
> Deployer: `0xb4Bbf9A9ca11B75A13418d307ecede3Ac281656B`

| Contract | Address |
|---------|---------|
| **DelegationManager** (ERC-7715 Core) | [`0x02495d95EC5fd5fd00D642B2e940543192e4DBb6`](https://sepolia.etherscan.io/address/0x02495d95EC5fd5fd00D642B2e940543192e4DBb6) |
| **ZKMembershipVerifier** | [`0x80eb5067F939C80899Db7B9cBdc1d0AE74576D85`](https://sepolia.etherscan.io/address/0x80eb5067F939C80899Db7B9cBdc1d0AE74576D85) |
| **ZKGatedDelegationEnforcer** | [`0x6151797AF83a42e68a596493F58407E1479CD5C8`](https://sepolia.etherscan.io/address/0x6151797AF83a42e68a596493F58407E1479CD5C8) |
| **AgentBudgetEnforcer** | [`0xee960dE3DfAc7c4Ef31AF70A12580BA27963CBE7`](https://sepolia.etherscan.io/address/0xee960dE3DfAc7c4Ef31AF70A12580BA27963CBE7) |
| **TimeBoundEnforcer** | [`0xFCb88fB13E8E59AdFF2Eb10c2Eb1D344eE7b31B5`](https://sepolia.etherscan.io/address/0xFCb88fB13E8E59AdFF2Eb10c2Eb1D344eE7b31B5) |
| **NativeTokenTransferAmountEnforcer** | [`0x2a7AB4Bb55bF459eB3F25D2f84e29d7CF6095047`](https://sepolia.etherscan.io/address/0x2a7AB4Bb55bF459eB3F25D2f84e29d7CF6095047) |

**✅ Demo Delegation Created On-Chain:**
[`0xf82ca708258641176de62fa899579072b2e8d22dc5ead5fbc3c51f662754f336`](https://sepolia.etherscan.io/tx/0xf82ca708258641176de62fa899579072b2e8d22dc5ead5fbc3c51f662754f336)


## ⚡ Technical Architecture

### The Automation Control Center
* **No Shared Private Keys.** DelegateFlow proves you can have high-speed automated execution without sacrificing absolute cryptographic security.
* **Global Circuit Breakers.** If anomalous behavior is detected across the mesh network, human operators can trigger the "Safe Mode," instantly halting all ERC-7715 agent executions via smart contract constraints.
* **Graph Telemetry.** Real-time visual tracking of caveat distribution across your DAO or organizational treasury.

## 🛠️ Built With

- **Frontend**: Next.js 16 (App Router / Turbopack), Tailwind CSS v4, Framer Motion
- **Web3 Stack**: Wagmi, Viem, MetaMask Delegation Toolkit `@tanstack/react-query`
- **Smart Contracts**: Solidity 
  - `DelegationManager.sol`
  - `CaveatEnforcers.sol`
  - `ZKVerifier.sol`

---

## 🚀 Quick Start

Ensure you have Node.js and a package manager installed on your machine.

```bash
# 1. Clone the repository
git clone https://github.com/harichopper/DelegateFlow.git
cd DelegateFlow

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the orchestration suite.