# DelegateFlow - Implementation Notes

## 📋 Technical Overview

This document outlines the implementation details, design decisions, and future work for the DelegateFlow hackathon project.

---

## 🏗️ Architecture Decisions

### 1. Storage Model (Delegations)

**Decision**: Store delegations in a flat mapping with hierarchical linking

```solidity
mapping(bytes32 => Delegation) public delegations;
mapping(bytes32 => bytes32[]) public subDelegations;
```

**Rationale**:
- O(1) lookup by delegation ID
- Child enumeration via subDelegations mapping
- No deep nesting limits
- Easy to iterate sub-delegations

### 2. Caveat Architecture (Modular Enforcers)

**Decision**: Each caveat type = separate smart contract

**Rationale**:
- **Upgradeable** — deploy new enforcer without updating manager
- **Auditable** — each enforcer is small, focused scope
- **Composable** — mix/match any combination
- **Testable** — independent test suites per enforcer

**Implementation**:
```solidity
struct Caveat {
  address enforcer;      // Contract to call
  bytes terms;           // ABI-encoded params
  bytes args;            // Additional context
}
```

All enforcers implement:
```solidity
function enforceCaveat(bytes32 delegationId, bytes terms, bytes callData)
  external returns (bool);
```

### 3. Permission Attenuation

**Decision**: Implicit via caveat parameters

**Rationale**:
- Parent sets $100k budget
- Child must set $50k budget in their caveat
- User responsible for attenuation
- On-chain validated via caveats

**Example**:
```
Parent caveat: maxAmount = 100 ETH
Child caveat: maxAmount = 50 ETH
→ Child can never exceed 100 ETH (parent limit)
```

### 4. State Management (Frontend)

**Decision**: Mock Zustand store for hack, ready for retrofit

```typescript
// src/lib/store.ts
let mockStore: DelegationStore = { ... };
export const useDelegationStore = () => mockStore;
```

**Why Mock?**
- Faster development (no Redux boilerplate)
- Demo data easily injected
- Real Zustand implementation is drop-in replacement
- No remote API calls needed

**Retrofit Path**:
```typescript
// Replace with real Zustand
import { create } from "zustand";
export const useDelegationStore = create<DelegationStore>((set) => ({
  // ... real Zustand implementation
}));
```

### 5. ZK Proof Integration

**Decision**: Client-side proof generation, server-side verification

**Architecture**:
1. Frontend generates proof locally (Circom/Noir)
2. Encodes proof in callData
3. Backend enforcer validates on-chain
4. Nullifier prevents replay

**Why This Approach?**
- Privacy preserved (proof generation off-chain)
- Proof never exposed to servers
- Solidity verifier validates efficiently
- Nullifier prevents double-spending

---

## 📝 Type System

### Core Interfaces

```typescript
// ERC-7715 compliant
interface Delegation {
  id: string;                      // Unique ID
  delegator: string;               // Original grantor
  delegate: string;                // Current delegate
  authority: string;               // Parent delegation or "ROOT"
  caveats: Caveat[];              // Permission constraints
  depth: number;                   // Tree level (0=root)
  children: Delegation[];         // Sub-delegations
  signature: string;              // ERC-191 signature
}

interface Caveat {
  id: string;
  type: CaveatType;               // Enum: Amount, Time, Method, etc.
  enforcer: string;               // Contract address
  terms: string;                  // ABI-encoded bytes
  label: string;                  // Display name
  params: Record<string, any>;   // Parsed terms
}

interface DelegationIntent {
  id: string;
  action: "transfer" | "vote" | "access" | "execute";
  target: string;
  amount?: string;
  matchedDelegations: string[];   // IDs of matched delegations
  status: IntentStatus;
}
```

---

## 🔄 Data Flow

### Creating a Delegation

```
User submits form
    ↓
Validate inputs (address format, expiration > now)
    ↓
Generate delegation ID = keccak256(delegator + delegate + salt + chainid)
    ↓
Encode caveats as Caveat[] struct
    ↓
Sign with ERC-191 (delegator's wallet)
    ↓
Call DelegationManager.createDelegation()
    ↓
Update UI: add to delegations list
```

### Resolving an Intent

```
User submits intent (e.g., "transfer $25 to 0x123")
    ↓
Query delegations matching action type
    ↓
Filter by delegator (usually same as requestor)
    ↓
For each delegation:
  - Check status = "active"
  - Check not expired
  - Validate all caveats
    ↓
Return sorted list of matched delegations
    ↓
User selects delegation to use
    ↓
Call redeemDelegation() → execute action
```

### Sub-Delegation Creation

```
Start with root delegation (already active)
    ↓
User creates sub-delegation with:
  - authority: parent delegation ID
  - delegate: new recipient
  - caveats: attenuated constraints
    ↓
On-chain: add to subDelegations[parentId]
    ↓
UI: render as child in tree view
```

---

## 🧪 Testing Strategy

### Unit Tests (Per Contract)

```solidity
// DelegationManager.t.sol
function testCreateDelegation() { ... }
function testSubDelegationLinking() { ... }
function testCaveatValidation() { ... }
function testRedemption() { ... }
function testRevocation() { ... }

// CaveatEnforcers.t.sol
function testAmountEnforcer() { ... }
function testTimeBound() { ... }
function testRateLimiting() { ... }

// ZKVerifier.t.sol
function testMembershipProof() { ... }
function testNullifierReplay() { ... }
```

### Integration Tests
- Multi-level delegation chains
- Cross-caveat enforcement
- Intent resolution accuracy
- Budget correct through levels

### UI Tests
- Form submission
- Delegation tree rendering
- Intent matching
- Agent status updates

---

## 🚀 Performance Considerations

### Gas Optimization

**Current**:
- Delegation creation: ~150k gas
- Caveat validation: ~50k gas per caveat
- Redemption: ~200k gas

**Future Optimizations**:
- Batch operations (create N delegations)
- Cached merkle proofs
- Delegate call instead of regular call (if safe)

### Frontend Performance

**Current**:
- Dashboard loads instantly (mock data)
- Tab switching is O(1)
- Tree expansion is O(n) children

**Future**:
- Virtualization for deep trees
- Lazy load historical data
- Real-time updates via WebSocket

---

## 🔐 Security Audit Checklist

- [ ] No reentrancy in redeemDelegation()
- [ ] Signature validation for all delegations
- [ ] Caveat enforcement can't be bypassed
- [ ] Nullifier prevents ZK proof replay
- [ ] Can't escal ate delegations above parent
- [ ] Can't modify delegations once created
- [ ] Expiration enforced
- [ ] Authority chain validated

---

## 🛣️ Roadmap: From Hack to Production

### Phase 1: Hackathon (Current ✅)
- [x] Basic ERC-7715 implementation
- [x] 5 caveat enforcers
- [x] Next.js dashboard
- [x] Mock ZK integration
- [x] Demo data flows

### Phase 2: Testnet ($$$)
- [ ] Deploy to Sepolia/Goerli
- [ ] Real ETH for testing
- [ ] Timelock for contract upgrades
- [ ] Testnet version of ZK verifier

### Phase 3: Audit & Security ($$$$)
- [ ] Professional smart contract audit
- [ ] Formal verification (optional)
- [ ] Bug bounty program
- [ ] Insurance/audited by OpenZeppelin

### Phase 4: Mainnet Launch ($$$$$)
- [ ] Deploy DelegationManager
- [ ] Deploy all enforcers
- [ ] Frontend on mainnet
- [ ] MetaMask Snap (if possible)
- [ ] Community education

### Phase 5: Scaling
- [ ] Layer 2 deployment (Optimism, Arbitrum)
- [ ] Message bridge for cross-chain delegations
- [ ] Delegation marketplace (buy/sell delegations)
- [ ] DAO integrations (Aragon, Snapshot)

---

## 🔗 Contract Interactions

### DelegationManager Functions

```solidity
createDelegation(delegator, delegate, authority, caveats, salt, expiresAt)
  → bytes32 delegationId
  
revokeDelegation(delegationId)
  → void (emits event)
  
redeemDelegation(delegationId, target, callData)
  → bytes result (from executed call)
  
validateCaveats(delegationId, context)
  → bool (all caveats pass?)
  
getDelegation(delegationId)
  → Delegation struct
  
getSubDelegations(delegationId)
  → bytes32[] (child IDs)
```

### Enforcer Interface

```solidity
// Every enforcer implements this
interface ICaveatEnforcer {
  function enforceCaveat(
    bytes32 delegationId,
    bytes terms,
    bytes callData
  ) external returns (bool);
}
```

---

## 📊 Data Models

### Delegation Tree (N-ary tree)

```
Root[delegationId: "root-1"]
├── Sub[delegationId: "sub-1-1", depth: 1]
│   ├── Sub[delegationId: "sub-1-1-1", depth: 2]
│   └── Sub[delegationId: "sub-1-1-2", depth: 2]
├── Sub[delegationId: "sub-1-2", depth: 1]
│   └── Sub[delegationId: "sub-1-2-1", depth: 2]
└── Sub[delegationId: "sub-1-3", depth: 1]
```

### Caveat Enforcement

```
┌─────────────────────────────┐
│   redeemDelegation() called │
└──────────────┬──────────────┘
               ↓
         Check status
              ↓
        Loop caveats[]
              ↓
    ┌────────┴────────┐
    ↓                 ↓
 call enforcer    call enforcer
    ↓                 ↓
  pass?             pass?
    ↓                 ↓
   ✓                 ✓
    └────────┬────────┘
             ↓
    Execute target call
             ↓
        Emit event
```

---

## 🎯 Intent Matching Algorithm

```python
def resolve_intent(intent: Intent, delegations: List[Delegation]) -> List[str]:
    matched = []
    
    for del in delegations:
        # Must be active
        if del.status != "active":
            continue
        
        # Must not be expired
        if time.time() > del.expiresAt:
            continue
        
        # Must have permission for action
        if not has_permission(del, intent.action):
            continue
        
        # Ask caveats (simplified)
        score = rate_delegation_match(del, intent)
        matched.append((del.id, score))
    
    # Sort by score (best first)
    matched.sort(key=lambda x: x[1], reverse=True)
    return [id for id, score in matched]

def rate_delegation_match(del: Delegation, intent: Intent) -> float:
    # Score based on:
    # - Budget match (if amount specified)
    # - Caveat fit (fewer constraints = simpler)
    # - Recentness (newer = fresher)
    score = 0.0
    
    if intent.amount:
        for caveat in del.caveats:
            if caveat.type == "NativeTokenTransferAmountEnforcer":
                if caveat.params["maxAmount"] >= float(intent.amount):
                    score += 10
    
    score += 1.0 / (1 + len(del.caveats))  # Prefer simple
    score += time.time() - del.createdAt  # Prefer fresh
    
    return score
```

---

## 🔍 Debugging

### Common Issues & Fixes

**Issue**: Caveat validation fails
```
Solution:
1. Check enforcer contract is deployed
2. Verify terms are properly ABI-encoded
3. Log callData in enforcer to debug
4. Test enforcer independently
```

**Issue**: Delegation not appearing in UI
```
Solution:
1. Check store.addDelegation() called
2. Verify delegation ID matches state
3. Check React key prop on list items
4. Open DevTools to inspect state
```

**Issue**: Intent not matching any delegation
```
Solution:
1. Check delegations are "active"
2. Verify expiration hasn't passed
3. Check action type matches caveats
4. Log matching algorithm output
```

---

## 📚 References & Standards

- **ERC-7715**: https://github.com/ethereum/ERCs/pull/7715
- **ERC-191**: EIP-191 Signed Data Standard
- **Circom**: Circuit language for ZK proofs
- **OpenZeppelin**: Standard contract patterns

---

## ✅ Final Checklist

- [x] All smart contracts compile without warnings
- [x] All React components render without errors
- [x] TypeScript strict mode enabled
- [x] Mobile responsive design
- [x] Accessibility (alt text, labels)
- [x] Error handling in UI
- [x] Types exported from index files
- [x] Environment variables documented
- [x] README comprehensive

---

**Last Updated**: March 19, 2026  
**Status**: Hackathon Submission Ready 🚀
