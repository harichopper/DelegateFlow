# 🌊 DelegateFlow

> **Empowering Autonomous AI Agents with Trustless ERC-7715 Guardrails**

![DelegateFlow](https://img.shields.io/badge/MetaMask-Delegation_Framework-blue?style=for-the-badge&logo=metamask)
![NextJS](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![Wagmi](https://img.shields.io/badge/Wagmi-v2-blueviolet?style=for-the-badge)
![FramerMotion](https://img.shields.io/badge/Framer_Motion-purple?style=for-the-badge)

DelegateFlow is an intent-based delegation control center built on top of the **MetaMask Delegation Framework (ERC-7715)**. It acts as the critical orchestration layer between user intent, autonomous AI agents (like Ollama, OpenClaw, GLM), and decentralized programmable budgets. 

### 🌐 [Live Production Demo](https://delegate-flow-green.vercel.app/)
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