"use client";

import React from "react";
import { Shield, Menu, Sparkles } from "lucide-react";

interface HeaderProps {
  onOpenMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  return (
    <header className="relative z-20 border-b border-[var(--border)]/40 bg-[var(--bg-secondary)]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] highlight-ring">
            <Shield className="w-6 h-6 text-[var(--accent-blue)]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-wide">DelegateFlow</h1>
            <p className="text-[var(--text-secondary)] text-xs uppercase tracking-[0.4em]">
              Delegation Framework
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)]/80 bg-[var(--bg-card)] text-xs font-semibold tracking-[0.3em]">
            <span className="status-dot status-active" />
            MAINNET SYNCED
          </div>
          <button className="btn-ghost hidden md:flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Neon Theme
          </button>
          <button
            onClick={onOpenMenu}
            className="md:hidden p-2 border border-[var(--border)] rounded-xl text-[var(--text-secondary)]"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};
