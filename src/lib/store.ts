// DelegateFlow delegation store and state management
import { Delegation, DelegationIntent, AgentNode, ZKProof } from "./types";

interface DelegationStore {
  // Delegations
  delegations: Delegation[];
  activeDelegation: Delegation | null;
  addDelegation: (delegation: Delegation) => void;
  updateDelegation: (id: string, updates: Partial<Delegation>) => void;
  removeDelegation: (id: string) => void;
  setActiveDelegation: (delegation: Delegation | null) => void;

  // Intents
  intents: DelegationIntent[];
  addIntent: (intent: DelegationIntent) => void;
  updateIntent: (id: string, updates: Partial<DelegationIntent>) => void;
  resolveIntent: (intentId: string, delegationIds: string[]) => void;

  // Agents
  agents: AgentNode[];
  registerAgent: (agent: AgentNode) => void;
  updateAgentStatus: (agentId: string, status: AgentNode["status"]) => void;
  recordAgentAction: (
    agentId: string,
    amountUsed: string,
    actionName: string
  ) => void;

  // ZK Proofs
  zkProofs: ZKProof[];
  addZKProof: (proof: ZKProof) => void;
  verifyZKProof: (proofId: string) => void;

  // UI State
  showCreateDelegation: boolean;
  setShowCreateDelegation: (show: boolean) => void;
  selectedChainDepth: number;
  setSelectedChainDepth: (depth: number) => void;
}

// Mock Zustand store (for demo) - replace with actual Zustand later
const mockStore: DelegationStore = {
  delegations: [],
  activeDelegation: null,
  intents: [],
  agents: [],
  zkProofs: [],
  showCreateDelegation: false,
  selectedChainDepth: 0,

  addDelegation: (delegation) => {
    mockStore.delegations = [...mockStore.delegations, delegation];
  },
  updateDelegation: (id, updates) => {
    mockStore.delegations = mockStore.delegations.map((d) =>
      d.id === id ? { ...d, ...updates } : d
    );
  },
  removeDelegation: (id) => {
    mockStore.delegations = mockStore.delegations.filter((d) => d.id !== id);
  },
  setActiveDelegation: (delegation) => {
    mockStore.activeDelegation = delegation;
  },
  addIntent: (intent) => {
    mockStore.intents = [...mockStore.intents, intent];
  },
  updateIntent: (id, updates) => {
    mockStore.intents = mockStore.intents.map((i) =>
      i.id === id ? { ...i, ...updates } : i
    );
  },
  resolveIntent: (intentId, delegationIds) => {
    mockStore.intents = mockStore.intents.map((i) =>
      i.id === intentId
        ? {
            ...i,
            matchedDelegations: delegationIds,
            status: "matched" as const,
          }
        : i
    );
  },
  registerAgent: (agent) => {
    mockStore.agents = [...mockStore.agents, agent];
  },
  updateAgentStatus: (agentId, status) => {
    mockStore.agents = mockStore.agents.map((a) =>
      a.id === agentId ? { ...a, status } : a
    );
  },
  recordAgentAction: (agentId, amountUsed) => {
    mockStore.agents = mockStore.agents.map((a) => {
      if (a.id === agentId) {
        return {
          ...a,
          actionsExecuted: a.actionsExecuted + 1,
          budgetUsed: (
            parseFloat(a.budgetUsed) + parseFloat(amountUsed)
          ).toString(),
        };
      }
      return a;
    });
  },
  addZKProof: (proof) => {
    mockStore.zkProofs = [...mockStore.zkProofs, proof];
  },
  verifyZKProof: (proofId) => {
    mockStore.zkProofs = mockStore.zkProofs.map((p) =>
      p.id === proofId ? { ...p, isValid: true } : p
    );
  },
  setShowCreateDelegation: (show) => {
    mockStore.showCreateDelegation = show;
  },
  setSelectedChainDepth: (depth) => {
    mockStore.selectedChainDepth = depth;
  },
};

export const useDelegationStore = () => mockStore;

export function getDelegationStore() {
  return mockStore;
}
