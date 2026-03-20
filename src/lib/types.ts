// Core types for the DelegateFlow delegation system
// Based on MetaMask ERC-7710/ERC-7715 delegation standards

export type DelegationStatus = "active" | "pending" | "expired" | "revoked";
export type CaveatType =
  | "NativeTokenTransfer"
  | "TimeBound"
  | "AllowedTargets"
  | "AllowedMethods"
  | "RateLimit"
  | "ZKMembership"
  | "AgentBudget"
  | "Custom";

export interface Caveat {
  id: string;
  type: CaveatType;
  enforcer: string; // contract address
  terms: string; // ABI-encoded terms
  label: string;
  description: string;
  params: Record<string, string | number | boolean | string[]>;
}

export interface Delegation {
  id: string;
  salt: string; // ERC-7710 salt for uniqueness
  delegator: string; // address
  delegate: string; // address
  authority: string; // parent delegation id or ROOT
  caveats: Caveat[];
  signature: string;
  status: DelegationStatus;
  createdAt: number;
  expiresAt?: number;
  label: string;
  description?: string;
  depth: number; // 0 = root, 1+ = sub-delegation
  children: Delegation[];
  zkProofRequired: boolean;
  intentTag?: string; // intent-based routing tag
  redeemCount: number;
  maxRedeems?: number;
}

export interface DelegationIntent {
  id: string;
  requester: string;
  action: string; // "transfer", "vote", "access", "execute"
  target: string;
  amount?: string;
  reasoning: string;
  matchedDelegations: string[]; // delegation IDs
  status: "resolving" | "matched" | "executing" | "completed" | "failed";
  timestamp: number;
}

export interface AgentNode {
  id: string;
  name: string;
  address: string;
  role: "coordinator" | "executor" | "verifier";
  delegations: string[]; // delegation IDs
  status: "active" | "idle" | "processing";
  actionsExecuted: number;
  budgetUsed: string;
  budgetTotal: string;
}

export interface ZKProof {
  id: string;
  type: "membership" | "balance" | "identity" | "custom";
  nullifier: string;
  commitment: string;
  proof: string; // encoded proof
  verifiedAt?: number;
  isValid: boolean;
}

export interface DelegationTree {
  root: Delegation;
  totalNodes: number;
  totalValue: string;
  activeCount: number;
}

// ERC-7710-compliant delegation hash structure
export interface DelegationHash {
  delegator: string;
  delegate: string;
  authority: string;
  caveats: {
    enforcer: string;
    terms: string;
    args: string;
  }[];
  salt: bigint;
}

// Intent resolution types
export interface DelegationRequest {
  recipient: string;
  amount?: string;
  duration: number; // seconds
  caveats: CaveatType[];
  description: string;
}

export interface DelegationChain {
  delegations: Delegation[];
  canExecute: boolean;
  executionPath: string[];
}
export interface IntentResolution {
  intent: string;
  resolvedPath: Delegation[];
  requiredCaveats: Caveat[];
  estimatedGas: string;
  canExecute: boolean;
  blockers: string[];
}
