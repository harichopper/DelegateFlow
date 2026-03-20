"use client";

import React from "react";
import { DelegationIntent, Delegation } from "@/lib/types";
import { CheckCircle, AlertCircle, Loader, Zap } from "lucide-react";

interface IntentResolverProps {
  intents: DelegationIntent[];
  delegations: Delegation[];
  onResolveIntent: (intentId: string, delegationIds: string[]) => void;
}

const statusIcons = {
  resolving: <Loader className="w-5 h-5 animate-spin text-[var(--accent-orange)]" />,
  matched: <CheckCircle className="w-5 h-5 text-[var(--accent-green)]" />,
  executing: <Zap className="w-5 h-5 text-[var(--accent-blue)]" />,
  completed: <CheckCircle className="w-5 h-5 text-[var(--accent-green)]" />,
  failed: <AlertCircle className="w-5 h-5 text-[var(--accent-danger)]" />,
};

const statusBadges = {
  resolving: "badge badge-orange",
  matched: "badge badge-green",
  executing: "badge badge-blue",
  completed: "badge badge-green",
  failed: "badge badge-red",
};

const findMatchingDelegations = (
  intent: DelegationIntent,
  delegations: Delegation[]
): Delegation[] => {
  // Simple matching: find delegations that can execute this action
  return delegations.filter((d) => {
    // Check if delegation is active
    if (d.status !== "active") return false;

    // Check permissions based on intent action
    const hasPermission = d.caveats.some((c) => {
      if (intent.action === "transfer") {
        return ["NativeTokenTransfer", "AgentBudget"].includes(c.type);
      }
      if (intent.action === "access") {
        return ["AllowedTargets", "AllowedMethods"].includes(c.type);
      }
      return true;
    });

    return hasPermission;
  });
};

export const IntentResolver: React.FC<IntentResolverProps> = ({
  intents,
  delegations,
  onResolveIntent,
}) => {
  if (!intents || intents.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No pending intents</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {intents.map((intent) => {
        const matchingDelegations = findMatchingDelegations(intent, delegations);
        const isResolved = intent.matchedDelegations.length > 0;

        return (
          <div
            key={intent.id}
            className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-glow)] transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                {statusIcons[intent.status]}
                <div>
                  <p className="font-semibold text-lg">
                    Intent: {intent.action.charAt(0).toUpperCase() + intent.action.slice(1)}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">{intent.reasoning}</p>
                </div>
              </div>
              <span className={statusBadges[intent.status]}>{intent.status}</span>
            </div>

            {intent.amount && (
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                <strong className="text-[var(--text-primary)]">Amount:</strong> {intent.amount}
              </p>
            )}

            {!isResolved && matchingDelegations.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Found {matchingDelegations.length} matching delegation(s):
                </p>
                <div className="space-y-2">
                  {matchingDelegations.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card-soft)]"
                    >
                      <span className="text-sm text-[var(--text-primary)]">{d.label}</span>
                      <button
                        onClick={() => onResolveIntent(intent.id, [d.id])}
                        className="btn-ghost text-xs"
                      >
                        Use This
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isResolved && matchingDelegations.length === 0 && (
              <div className="mt-3 p-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card-soft)] text-[var(--accent-danger)] text-sm">
                <p>
                  No matching delegations found. Create one with appropriate permissions.
                </p>
              </div>
            )}

            {isResolved && (
              <div className="mt-3 p-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card-soft)] text-[var(--accent-green)] text-sm">
                <p>
                  ✓ Matched to {intent.matchedDelegations.length} delegation(s)
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
