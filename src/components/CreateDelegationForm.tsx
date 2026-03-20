"use client";

import React, { useState, useRef } from "react";
import { Caveat, CaveatType, Delegation } from "@/lib/types";
import { X } from "lucide-react";

interface CreateDelegationFormProps {
  onSubmit: (delegation: Partial<Delegation>) => void;
  onCancel: () => void;
  parentDelegation?: Delegation;
}

const caveatTemplates: Record<CaveatType, Partial<Caveat>> = {
  NativeTokenTransfer: {
    type: "NativeTokenTransfer",
    label: "Amount Limit",
    description: "Limits the amount of native tokens that can be transferred",
    params: { maxAmount: 10, tokenSymbol: "ETH" },
  },
  TimeBound: {
    type: "TimeBound",
    label: "Time Window",
    description: "Restricts when the delegation can be used",
    params: { startDate: new Date().toISOString().split("T")[0], durationDays: 7 },
  },
  AllowedTargets: {
    type: "AllowedTargets",
    label: "Target Whitelist",
    description: "Restricts which contracts can be targeted",
    params: { maxTargets: 5 },
  },
  AllowedMethods: {
    type: "AllowedMethods",
    label: "Method Restrictions",
    description: "Restricts which methods can be called",
    params: { methods: ["transfer", "approve"] },
  },
  RateLimit: {
    type: "RateLimit",
    label: "Rate Limit",
    description: "Limits the frequency of actions",
    params: { maxPerHour: 10 },
  },
  ZKMembership: {
    type: "ZKMembership",
    label: "ZK Membership Proof",
    description: "Requires ZK proof of membership",
    params: { commitmentTree: "", nullifierHash: "" },
  },
  AgentBudget: {
    type: "AgentBudget",
    label: "Agent Budget",
    description: "Sets budget limits for autonomous agents",
    params: { dailyBudget: 100, tokenSymbol: "ETH" },
  },
  Custom: {
    type: "Custom",
    label: "Custom Caveat",
    description: "Custom caveat enforcer",
    params: { enforcerAddress: "" },
  },
};

export const CreateDelegationForm: React.FC<CreateDelegationFormProps> = ({
  onSubmit,
  onCancel,
  parentDelegation,
}) => {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [delegateAddress, setDelegateAddress] = useState("");
  const [expirationDays, setExpirationDays] = useState(30);
  const [selectedCaveats, setSelectedCaveats] = useState<CaveatType[]>([]);
  const [caveats, setCaveats] = useState<Caveat[]>([]);
  const caveatIdCounter = useRef(0);

  const handleAddCaveat = (caveatType: CaveatType) => {
    if (!selectedCaveats.includes(caveatType)) {
      setSelectedCaveats([...selectedCaveats, caveatType]);
      const template = caveatTemplates[caveatType];
      caveatIdCounter.current += 1;
      setCaveats([
        ...caveats,
        {
          id: `caveat-${caveatIdCounter.current}`,
          enforcer: "0x0000000000000000000000000000000000000000",
          terms: "",
          ...template,
        } as Caveat,
      ]);
    }
  };

  const handleRemoveCaveat = (caveatType: CaveatType) => {
    setSelectedCaveats(selectedCaveats.filter((c) => c !== caveatType));
    setCaveats(caveats.filter((c) => c.type !== caveatType));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const delegation: Partial<Delegation> = {
      id: `del-${Date.now()}`,
      label,
      description,
      delegate: delegateAddress,
      delegator: "0xCurrentUser", // In real app, get from wallet
      authority: parentDelegation?.id || "ROOT",
      caveats,
      status: "pending",
      expiresAt: Math.floor(Date.now() / 1000) + expirationDays * 86400,
      createdAt: Math.floor(Date.now() / 1000),
      depth: (parentDelegation?.depth || 0) + 1,
      children: [],
      zkProofRequired: selectedCaveats.includes("ZKMembership"),
      redeemCount: 0,
    };

    onSubmit(delegation);
  };

  const availableCaveats: CaveatType[] = [
    "NativeTokenTransfer",
    "TimeBound",
    "AllowedTargets",
    "AllowedMethods",
    "RateLimit",
    "ZKMembership",
    "AgentBudget",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)]/95 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]">
              {parentDelegation ? "Sub delegation" : "New delegation"}
            </p>
            <h2 className="text-2xl font-semibold mt-1">
              {parentDelegation ? "Create Sub-Delegation" : "Create Delegation"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-2xl border border-[var(--border)] hover:border-[var(--border-glow)]"
            aria-label="Close create delegation dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div>
              <label className="block text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">
                Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Finance Committee Budget"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this delegation..."
                rows={3}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">
                Delegate Address
              </label>
              <input
                type="text"
                value={delegateAddress}
                onChange={(e) => setDelegateAddress(e.target.value)}
                placeholder="0x..."
                className="input-field font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">
                Expiration (Days)
              </label>
              <input
                type="number"
                value={expirationDays}
                onChange={(e) => setExpirationDays(parseInt(e.target.value))}
                min={1}
                max={365}
                className="input-field"
              />
            </div>
          </div>

          {/* Caveats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Permission Caveats</h3>

            <div>
              <label className="block text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">
                Add Constraints
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableCaveats.map((caveatType) => (
                  <button
                    key={caveatType}
                    type="button"
                    onClick={() => handleAddCaveat(caveatType)}
                    disabled={selectedCaveats.includes(caveatType)}
                    className="px-3 py-2 text-sm rounded-xl border border-[var(--border)] text-left hover:border-[var(--border-glow)] disabled:opacity-50"
                  >
                    {caveatTemplates[caveatType].label}
                  </button>
                ))}
              </div>
            </div>

            {selectedCaveats.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-[var(--text-secondary)]">Selected Caveats:</p>
                {selectedCaveats.map((caveatType) => (
                  <div
                    key={caveatType}
                    className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card-soft)] flex justify-between items-start"
                  >
                    <div>
                      <p className="font-medium">
                        {caveatTemplates[caveatType].label}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {caveatTemplates[caveatType].description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCaveat(caveatType)}
                      className="p-1 rounded-full border border-[var(--border)] hover:border-[var(--border-glow)]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t border-[var(--border)]">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Delegation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
