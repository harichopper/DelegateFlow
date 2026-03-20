"use client";

import React from "react";
import { AgentNode } from "@/lib/types";
import { Bot, Activity, TrendingUp, Zap } from "lucide-react";

interface AgentStatusDisplayProps {
  agents: AgentNode[];
}

const roleIcons = {
  coordinator: <Zap className="w-4 h-4" />,
  executor: <Activity className="w-4 h-4" />,
  verifier: <TrendingUp className="w-4 h-4" />,
};

const statusColors = {
  active: "badge badge-green",
  idle: "badge badge-blue",
  processing: "badge badge-purple",
};

export const AgentStatusDisplay: React.FC<AgentStatusDisplayProps> = ({
  agents,
}) => {
  if (!agents || agents.length === 0) {
    return (
      <div className="p-6 text-center text-[var(--text-secondary)]">
        <Bot className="w-12 h-12 mx-auto mb-2 opacity-40" />
        <p>No agents registered yet</p>
      </div>
    );
  }

  const totalBudgetUsed = agents.reduce(
    (sum, a) => sum + parseFloat(a.budgetUsed),
    0
  );
  const totalBudgetAvailable = agents.reduce(
    (sum, a) => sum + parseFloat(a.budgetTotal),
    0
  );
  const totalActionsExecuted = agents.reduce((sum, a) => sum + a.actionsExecuted, 0);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card-soft)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Agents</p>
          <p className="text-3xl font-semibold mt-2">{agents.length}</p>
          <span className="badge badge-blue mt-3 inline-flex">synced</span>
        </div>
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card-soft)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Actions</p>
          <p className="text-3xl font-semibold mt-2">{totalActionsExecuted}</p>
          <span className="badge badge-green mt-3 inline-flex">executed</span>
        </div>
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card-soft)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Budget</p>
          <p className="text-xl font-semibold mt-2">
            {totalBudgetUsed.toFixed(2)} / {totalBudgetAvailable.toFixed(2)}
          </p>
          <span className="badge badge-purple mt-3 inline-flex">allocation</span>
        </div>
      </div>

      {/* Agent List */}
      <div className="space-y-2">
        {agents.map((agent) => {
          const budgetPercentage =
            (parseFloat(agent.budgetUsed) / parseFloat(agent.budgetTotal)) * 100;

          return (
            <div
              key={agent.id}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-glow)] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-2xl bg-[var(--bg-card-soft)] border border-[var(--border)]">
                    {roleIcons[agent.role]}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{agent.name}</p>
                    <code className="text-xs text-[var(--text-secondary)] font-mono">
                      {agent.address.slice(0, 12)}...
                    </code>
                  </div>
                </div>
                <span className={statusColors[agent.status]}>{agent.status}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-[var(--text-muted)] text-xs uppercase tracking-[0.2em]">
                    Role
                  </p>
                  <p className="capitalize">{agent.role}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-xs uppercase tracking-[0.2em]">
                    Actions
                  </p>
                  <p>{agent.actionsExecuted}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-xs uppercase tracking-[0.2em]">
                    Delegations
                  </p>
                  <p>{agent.delegations.length}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-[var(--text-muted)] mb-2">
                  <span>Budget usage</span>
                  <span>{budgetPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--bg-card-soft)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent-green)] via-[var(--accent-orange)] to-[var(--accent-danger)]"
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
