# DelegateFlow - Deployment Guide

This guide covers deploying DelegateFlow to local, testnet, and mainnet environments.

---

## 🏠 Local Development Setup

### Prerequisites
```bash
Node.js 18+ LTS
npm 9+
git
```

### Installation

```bash
# 1. Clone repository
git clone https://github.com/your-org/delegateflow.git
cd delegateflow

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

**Result**: App available at `http://localhost:3000`

### Environment Variables

Create `.env.local`:
```bash
# Next.js
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337

# Optional: MetaMask Snap
NEXT_PUBLIC_SNAP_ID=npm:@metamask/delegateflow-snap
```

---

## 🧪 Testnet Deployment

### Sepolia (Recommended for Testing)

#### 1. Get Testnet ETH

```bash
# Go to faucet
https://www.sepoliafaucet.com

# Or use Alchemy
https://www.alchemy.com/faucets/ethereum-sepolia
```

#### 2. Deploy Smart Contracts

```bash
# Install Foundry (if not already)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Set environment variables
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
export SEPOLIA_PRIVATE_KEY="0xYOUR_PRIVATE_KEY"

# Deploy DelegationManager
forge create contracts/DelegationManager.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $SEPOLIA_PRIVATE_KEY

# Deploy CaveatEnforcers
forge create contracts/CaveatEnforcers.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $SEPOLIA_PRIVATE_KEY

# Deploy ZKVerifier
forge create contracts/ZKVerifier.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $SEPOLIA_PRIVATE_KEY
```

#### 3. Update Frontend Configuration

In `src/lib/contracts.ts`:
```typescript
export const CONTRACTS = {
  delegationManager: "0x...", // From deployment
  nativeTokenEnforcer: "0x...",
  timeBoundEnforcer: "0x...",
  zkVerifier: "0x...",
} as const;
```

#### 4. Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables on Vercel dashboard:
# NEXT_PUBLIC_RPC_URL
# NEXT_PUBLIC_CHAIN_ID=11155111
```

---

## 🌍 Mainnet Deployment (Production)

### 1. Pre-Deployment Checklist

- [ ] Smart contracts audited by third party
- [ ] Testnet deployment successful
- [ ] All environment variables set
- [ ] Team review of code
- [ ] Updated CHANGELOG
- [ ] Insurance/audited badges printed

### 2. Smart Contract Deployment

```bash
# Set mainnet environment
export MAINNET_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
export MAINNET_PRIVATE_KEY="0x..."
export MAINNET_CHAIN_ID=1

# Deploy with Timelock (safer!)
# First, deploy Timelock contract
forge create contracts/Timelock.sol \
  --rpc-url $MAINNET_RPC_URL \
  --private-key $MAINNET_PRIVATE_KEY

# Then deploy DelegationManager with Timelock ownership
forge create contracts/DelegationManager.sol \
  --rpc-url $MAINNET_RPC_URL \
  --private-key $MAINNET_PRIVATE_KEY

# Deploy all enforcers
# ... (repeat for each enforcer)
```

### 3. Frontend Deployment

```bash
# Update environment for mainnet
# .env.production.local
NEXT_PUBLIC_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_CHAIN_ID=1

# Deploy to production
vercel --prod
```

### 4. Post-Deployment

- [ ] Verify contracts on Etherscan
- [ ] Monitor contract activity
- [ ] Set up alerts for errors
- [ ] Create documentation for users
- [ ] Announce launch to community

---

## 📊 Monitoring & Maintenance

### Activity Monitoring

```bash
# Watch contract activity
etherscan-cli --contract $DELEGATION_MANAGER_ADDRESS --follow

# Monitor transaction costs
npm run analytics
```

### Upgrading Contracts

Since DelegationManager is upgradeable via Timelock:

```bash
# 1. Prepare new implementation
# contracts/DelegationManagerV2.sol

# 2. Create upgrade proposal (Timelock)
cast send $TIMELOCK_ADDRESS "scheduleTransaction()" \
  --rpc-url $MAINNET_RPC_URL

# 3. Wait for timelock delay (e.g., 48 hours)

# 4. Execute upgrade
cast send $TIMELOCK_ADDRESS "executeTransaction()" \
  --rpc-url $MAINNET_RPC_URL

# 5. Verify new implementation
etherscan-api-proxy --action getabi --address $DELEGATION_MANAGER_ADDRESS
```

---

## 🔧 Layer 2 Deployment

### Optimism

```bash
export OP_RPC_URL="https://mainnet.optimism.io"
export OP_PRIVATE_KEY="0x..."

forge create contracts/DelegationManager.sol \
  --rpc-url $OP_RPC_URL \
  --private-key $OP_PRIVATE_KEY

# Lower gas, same security!
```

### Arbitrum

```bash
export ARB_RPC_URL="https://arb1.arbitrum.io/rpc"
export ARB_PRIVATE_KEY="0x..."

forge create contracts/DelegationManager.sol \
  --rpc-url $ARB_RPC_URL \
  --private-key $ARB_PRIVATE_KEY
```

---

## 🐛 Debugging Deployments

### Contract not deploying?

```bash
# Check gas
cast estimate-gas --rpc-url $RPC_URL [contract_code]

# Check funds
cast balance --rpc-url $RPC_URL $YOUR_ADDRESS

# Check nonce
cast nonce --rpc-url $RPC_URL $YOUR_ADDRESS
```

### Frontend not connecting?

```javascript
// Check RPC connection
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
await provider.getBlockNumber();  // Should return number

// Check contract deployed
const code = await provider.getCode(contractAddress);
if (code === "0x") console.error("Contract not deployed!");
```

---

## 📝 Deployment Rollback

If issues occur post-deployment:

1. **Immediate**: Pause new delegations via admin function
2. **Short-term**: Redeploy enforcer contracts
3. **Long-term**: Execute timelock upgrade

---

## 🎯 Quick Deploy Script

```bash
#!/bin/bash
# deploy.sh

RPC_URL=$1
PRIVATE_KEY=$2

if [ -z "$RPC_URL" ] || [ -z "$PRIVATE_KEY" ]; then
  echo "Usage: ./deploy.sh <RPC_URL> <PRIVATE_KEY>"
  exit 1
fi

echo "Deploying to $RPC_URL..."

# Compile
forge build

# Deploy
DM=$(forge create contracts/DelegationManager.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --json | jq -r '.deployedTo')

echo "✅ DelegationManager: $DM"

# ... deploy other contracts

echo "✅ All contracts deployed!"
echo "Update src/lib/contracts.ts with addresses"
```

Usage:
```bash
chmod +x deploy.sh
./deploy.sh https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY 0xYOUR_PRIVATE_KEY
```

---

## ✅ Deployment Checklist

- [ ] All contracts compile without errors/warnings
- [ ] Smart contracts audited
- [ ] Testnet deployment successful
- [ ] Mainnet contracts verified on Etherscan
- [ ] Environment variables set correctly
- [ ] Frontend deployed and accessible
- [ ] RPC connection verified
- [ ] Contract addresses updated in frontend
- [ ] Monitoring/alerts configured
- [ ] Documentation published
- [ ] Team notified of deployment

---

**Need Help?** Open an issue or contact the team!
