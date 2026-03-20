"use client";

import React from "react";
import { Network, GitBranch, Bot, Zap, Settings } from "lucide-react";

interface TabNavigationProps {
  activeTab: "delegations" | "intents" | "agents" | "analytics" | "settings";
  onTabChange: (tab: "delegations" | "intents" | "agents" | "analytics" | "settings") => void;
}

const tabs = [
  {
    id: "delegations" as const,
    label: "Delegations",
    icon: <GitBranch className="w-5 h-5" />,
    description: "Manage delegation chains",
  },
  {
    id: "intents" as const,
    label: "Intents",
    icon: <Zap className="w-5 h-5" />,
    description: "Resolve user intents",
  },
  {
    id: "agents" as const,
    label: "Agents",
    icon: <Bot className="w-5 h-5" />,
    description: "Monitor agent activity",
  },
  {
    id: "analytics" as const,
    label: "Analytics",
    icon: <Network className="w-5 h-5" />,
    description: "View network stats",
  },
  {
    id: "settings" as const,
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
    description: "Configure system",
  },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="border-b border-[var(--border)]/50 bg-[var(--bg-secondary)]/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto py-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-medium transition-all ${
                  isActive
                    ? "border-[var(--border-glow)] text-[var(--accent-blue)] bg-[var(--bg-card)] shadow-lg"
                    : "border-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className={`p-1.5 rounded-xl ${
                  isActive ? "bg-[var(--border)]" : "bg-[var(--bg-card-soft)]"
                }`}
                >
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
