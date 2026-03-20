// Smart contract utilities and ABI definitions for DelegateFlow

// ERC-7715 Delegation Manager ABI
export const DELEGATION_MANAGER_ABI = [
  {
    name: "createDelegation",
    type: "function",
    inputs: [
      { name: "delegation", type: "tuple", components: [
        { name: "delegator", type: "address" },
        { name: "delegate", type: "address" },
        { name: "authority", type: "bytes32" },
        { name: "caveats", type: "tuple[]", components: [
          { name: "enforcer", type: "address" },
          { name: "terms", type: "bytes" },
          { name: "args", type: "bytes" }
        ]},
        { name: "salt", type: "bytes32" },
        { name: "signature", type: "bytes" }
      ]},
    ],
    outputs: [{ name: "delegationId", type: "bytes32" }],
  },
  {
    name: "redeemDelegation",
    type: "function",
    inputs: [
      { name: "delegation", type: "bytes32" },
      { name: "target", type: "address" },
      { name: "data", type: "bytes" },
    ],
    outputs: [{ name: "result", type: "bytes" }],
  },
  {
    name: "revokeDelegation",
    type: "function",
    inputs: [{ name: "delegationId", type: "bytes32" }],
    outputs: [],
  },
  {
    name: "getDelegation",
    type: "function",
    inputs: [{ name: "delegationId", type: "bytes32" }],
    outputs: [
      {
        name: "delegation",
        type: "tuple",
        components: [
          { name: "delegator", type: "address" },
          { name: "delegate", type: "address" },
          { name: "authority", type: "bytes32" },
          { name: "salt", type: "bytes32" },
          { name: "status", type: "uint8" },
          { name: "createdAt", type: "uint256" },
          { name: "expiresAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "validateCaveats",
    type: "function",
    inputs: [
      { name: "delegationId", type: "bytes32" },
      { name: "context", type: "bytes" },
    ],
    outputs: [{ name: "valid", type: "bool" }],
  },
] as const;

// Caveat Enforcer ABI (generic interface for custom caveats)
export const CAVEAT_ENFORCER_ABI = [
  {
    name: "enforceCaveat",
    type: "function",
    inputs: [
      { name: "delegationId", type: "bytes32" },
      { name: "terms", type: "bytes" },
      { name: "context", type: "bytes" },
    ],
    outputs: [{ name: "valid", type: "bool" }],
  },
] as const;

// NativeTokenTransferAmountEnforcer ABI
export const NATIVE_TOKEN_ENFORCER_ABI = [
  {
    name: "enforceCaveat",
    type: "function",
    inputs: [
      { name: "delegationId", type: "bytes32" },
      { name: "maxAmount", type: "uint256" },
      { name: "recipient", type: "address" },
    ],
    outputs: [{ name: "valid", type: "bool" }],
  },
  {
    name: "getRemainingBudget",
    type: "function",
    inputs: [{ name: "delegationId", type: "bytes32" }],
    outputs: [{ name: "remaining", type: "uint256" }],
  },
] as const;

// Time-bound Caveat Enforcer ABI
export const TIME_BOUND_ENFORCER_ABI = [
  {
    name: "enforceCaveat",
    type: "function",
    inputs: [
      { name: "delegationId", type: "bytes32" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
    ],
    outputs: [{ name: "valid", type: "bool" }],
  },
  {
    name: "isTimeValid",
    type: "function",
    inputs: [
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
    ],
    outputs: [{ name: "valid", type: "bool" }],
  },
] as const;

// ZK Proof Verifier ABI
export const ZK_VERIFIER_ABI = [
  {
    name: "verifyProof",
    type: "function",
    inputs: [
      { name: "proof", type: "bytes" },
      { name: "publicInputs", type: "bytes" },
    ],
    outputs: [{ name: "valid", type: "bool" }],
  },
  {
    name: "verifyMembership",
    type: "function",
    inputs: [
      { name: "commitment", type: "bytes32" },
      { name: "proof", type: "bytes" },
      { name: "nullifier", type: "bytes32" },
    ],
    outputs: [{ name: "valid", type: "bool" }],
  },
] as const;

// Mock contract addresses for demo
export const CONTRACTS = {
  delegationManager: "0x1234567890123456789012345678901234567890",
  nativeTokenEnforcer: "0x2345678901234567890123456789012345678901",
  timeBoundEnforcer: "0x3456789012345678901234567890123456789012",
  zkVerifier: "0x4567890123456789012345678901234567890123",
} as const;

// Helper functions for contract interactions
export async function createDelegationHash(
  delegator: string,
  delegate: string,
  caveats: { enforcer: string; terms: string }[],
  salt: string
): Promise<string> {
  // In real implementation, would use proper ERC-7710 hashing
  const encoded = delegate + delegator + salt + JSON.stringify(caveats);
  return "0x" + Buffer.from(encoded).toString("hex").slice(0, 64);
}

export async function validateDelegationSignature(
  _delegation: Record<string, unknown>,
  signature: string
): Promise<boolean> {
  // In real implementation, would use ethers.js signature verification
  return signature.length > 10;
}
