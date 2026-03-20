"use client";

import React from "react";
import { Delegation, DelegationStatus } from "@/lib/types";
import { ChevronDown, Lock, Clock, Zap, Shield, Layers } from "lucide-react";

interface DelegationCardProps {
  delegation: Delegation;
  onExpand?: () => void;
  isExpanded?: boolean;
  depth?: number;
}

const statusTokens: Record<DelegationStatus, { badge: string; icon: React.ReactNode }> = {
  active: {
    badge: "badge badge-green",
    icon: <Zap className="w-4 h-4" />,
  },
  pending: {
    badge: "badge badge-orange",
    icon: <Clock className="w-4 h-4" />,
  },
  expired: {
    badge: "badge badge-red",
    icon: <Shield className="w-4 h-4" />,
  },
  revoked: {
    badge: "badge badge-purple",
    icon: <Lock className="w-4 h-4" />,
  },
};

export const DelegationCard: React.FC<DelegationCardProps> = ({
  delegation,
  onExpand,
  isExpanded,
  depth = 0,
}) => {
  const indent = depth * 20;
  const hasChildren = delegation.children && delegation.children.length > 0;

  return (
    <div style={{ marginLeft: `${indent}px` }} className="mb-4">
      <div
        className={`rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/90 p-5 transition-all ${
          isExpanded ? "shadow-2xl shadow-black/40" : "hover:border-[var(--border-glow)]"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {hasChildren ? (
                <button
                  type="button"
                  aria-label={isExpanded ? "Collapse delegation" : "Expand delegation"}
                  onClick={onExpand}
                  className={`p-2 rounded-xl border border-[var(--border)] transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              ) : (
                <div className="p-2 rounded-xl border border-dashed border-[var(--border)] text-[var(--text-muted)]">
                  <Layers className="w-4 h-4" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{delegation.label}</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                  depth {delegation.depth}
                </p>
              </div>
              <span className={statusTokens[delegation.status].badge}>
                <span className="flex items-center gap-1 text-[0.65rem]">
                  {statusTokens[delegation.status].icon}
                  {delegation.status}
                </span>
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {delegation.description || "No description provided"}
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs mb-4">
              <div className="p-3 rounded-xl bg-[var(--bg-card-soft)] border border-[var(--border)]">
                <p className="text-[var(--text-muted)] mb-1">From</p>
                <code className="font-mono text-[var(--text-primary)] text-sm block truncate">
                  {delegation.delegator.slice(0, 12)}...
                </code>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-card-soft)] border border-[var(--border)]">
                <p className="text-[var(--text-muted)] mb-1">To</p>
                <code className="font-mono text-[var(--text-primary)] text-sm block truncate">
                  {delegation.delegate.slice(0, 12)}...
                </code>
              </div>
            </div>
            {delegation.caveats.length > 0 && (
              <div className="pt-3 border-t border-dashed border-[var(--border)]/60">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">
                  Caveats ({delegation.caveats.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {delegation.caveats.map((caveat) => (
                    <span
                      key={caveat.id}
                      className="px-3 py-1 rounded-full border border-[var(--border)] text-xs text-[var(--accent-blue)]"
                    >
                      {caveat.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="mt-3 border-l border-dashed border-[var(--border)]/60 pl-5">
          {delegation.children.map((child) => (
            <DelegationCard key={child.id} delegation={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
