"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  Shield, Plus, Settings2, Filter, Clock, Coins, Users, Edit2, Trash2, X, Sparkles, Camera, UserCheck, ChevronRight, Database, HelpCircle, Activity, Zap, Loader2, Bot, TrendingUp, BarChart, CheckCircle, AlertCircle, Terminal, ShieldCheck, Server
} from "lucide-react";

const DelegateFlowLogo = () => (
  <motion.svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[28px] h-[28px] drop-shadow-[0_0_15px_rgba(255,255,255,1)]" initial={{ rotate: -5 }} animate={{ rotate: 5, y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", repeatType: "reverse" }}>
    <defs>
      <linearGradient id="logoPrimary" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#a5b4fc" /></linearGradient>
      <linearGradient id="logoSecondary" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#818cf8" /></linearGradient>
    </defs>
    <path d="M50 5L95 28L50 52L5 28L50 5Z" fill="url(#logoPrimary)" fillOpacity="0.95" />
    <path d="M95 28V72L50 95V52L95 28Z" fill="url(#logoSecondary)" fillOpacity="0.8" />
    <path d="M5 28V72L50 95V52L5 28Z" fill="url(#logoSecondary)" fillOpacity="0.3" />
    <path d="M50 20L75 33L50 46L25 33L50 20Z" fill="#0f172a" fillOpacity="0.7" />
    <circle cx="50" cy="33" r="5" fill="#60a5fa" className="animate-pulse" />
    <circle cx="50" cy="33" r="3" fill="#ffffff" />
    <circle cx="50" cy="5" r="4" fill="#ffffff" />
    <circle cx="95" cy="28" r="4" fill="#ffffff" />
    <circle cx="5" cy="28" r="4" fill="#ffffff" />
    <circle cx="50" cy="95" r="4" fill="#ffffff" />
    <circle cx="95" cy="72" r="3" fill="#ffffff" fillOpacity="0.5" />
    <circle cx="5" cy="72" r="3" fill="#ffffff" fillOpacity="0.5" />
  </motion.svg>
);

const getIconByName = (name: string) => {
  switch (name) {
    case "Clock": return <Clock className="w-3.5 h-3.5" />;
    case "Coins": return <Coins className="w-3.5 h-3.5" />;
    case "Users": return <Users className="w-3.5 h-3.5" />;
    case "Camera": return <Camera className="w-3.5 h-3.5" />;
    case "UserCheck": return <UserCheck className="w-3.5 h-3.5" />;
    default: return <Shield className="w-3.5 h-3.5" />;
  }
};

const CustomInput = ({ label, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-sm text-zinc-400 mb-2 font-medium">{label}</label>
    <input className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" {...props} />
  </div>
);

const CustomSelect = ({ label, options, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-sm text-zinc-400 mb-2 font-medium">{label}</label>
    <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" {...props}>
      {options.map((o: any) => <option key={o.value} value={o.value} className="bg-zinc-900">{o.label}</option>)}
    </select>
  </div>
);

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("Delegations");

  // App State - Resetting Demos & adding v3 keys
  const [delegations, setDelegations] = useState<any[]>([]);
  const [intents, setIntents] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: "Total Delegations", value: 0, color: "from-blue-500 to-indigo-500", key: "total" },
    { label: "Active Live", value: 0, color: "from-emerald-400 to-teal-500", glow: true, key: "active" },
    { label: "Sub-Delegations", value: 0, color: "from-purple-500 to-pink-500", key: "sub" },
    { label: "Redeems Processed", value: 0, color: "from-orange-400 to-red-500", key: "redeems" }
  ]);
  const [settings, setSettings] = useState({ rpc: "https://sepolia.infura.io/v3/YOUR_KEY", core: "0xDelegationProtocol...", depth: 3, alert: 80 });

  const [activeFilter, setActiveFilter] = useState("All");

  // Modals Data
  const [showDelModal, setShowDelModal] = useState(false);
  const [delForm, setDelForm] = useState({ title: '', target: '', amount: '10' });
  const [editDelId, setEditDelId] = useState<string | null>(null);

  const [showIntentModal, setShowIntentModal] = useState(false);
  const [intentForm, setIntentForm] = useState({ action: 'transfer', target: '', amount: '', reasoning: '' });

  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentForm, setAgentForm] = useState({ name: '', model: 'ollama', role: 'executor', endpoint: '' });

  const [isResolving, setIsResolving] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [safeMode, setSafeMode] = useState(false);

  // Wagmi State
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
    try {
      const savedDel = localStorage.getItem('df_delegations_v3');
      const savedStats = localStorage.getItem('df_stats_v3');
      const savedIntents = localStorage.getItem('df_intents_v3');
      const savedAgents = localStorage.getItem('df_agents_v3');
      const savedSettings = localStorage.getItem('df_settings_v3');
      const savedSafeMode = localStorage.getItem('df_safemode_v3');

      if (savedDel) setDelegations(JSON.parse(savedDel));
      if (savedStats) setStats(JSON.parse(savedStats));
      if (savedIntents) setIntents(JSON.parse(savedIntents));
      if (savedAgents) setAgents(JSON.parse(savedAgents));
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      if (savedSafeMode) setSafeMode(JSON.parse(savedSafeMode));
    } catch (e) {
      console.error("Local storage empty or corrupt");
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('df_delegations_v3', JSON.stringify(delegations));
      localStorage.setItem('df_stats_v3', JSON.stringify(stats));
      localStorage.setItem('df_intents_v3', JSON.stringify(intents));
      localStorage.setItem('df_agents_v3', JSON.stringify(agents));
      localStorage.setItem('df_settings_v3', JSON.stringify(settings));
      localStorage.setItem('df_safemode_v3', JSON.stringify(safeMode));
    }
  }, [delegations, stats, intents, agents, settings, safeMode, mounted]);

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // --- DELEGATIONS LOGIC ---
  const handleCycleFilter = () => {
    if (activeFilter === "All") setActiveFilter("Active");
    else if (activeFilter === "Active") setActiveFilter("Pending");
    else setActiveFilter("All");
  };

  const filteredDelegations = delegations.filter(d => {
    if (activeFilter === "All") return true;
    return d.status === activeFilter;
  });

  const submitDelegation = () => {
    if (!delForm.title || !delForm.target) return alert("Fill all required fields!");

    if (editDelId) {
      setDelegations(prev => prev.map(del => {
        if (del.id === editDelId) {
          return { ...del, title: delForm.title, target: delForm.target };
        }
        return del;
      }));
    } else {
      const newDel = {
        id: `del-${Date.now()}`,
        title: delForm.title,
        status: "Pending",
        statusColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        source: isConnected && address ? truncateAddress(address) : "0xLocal...Wallet",
        target: delForm.target,
        badges: [
          { iconText: `Max: ${delForm.amount} ETH/ERC20`, iconName: "Coins" },
          { iconText: "Manual Approval required", iconName: "Users" }
        ],
        actionRequired: true
      };
      setDelegations(prev => [newDel, ...prev]);
      setStats(prev => prev.map(s => {
        if (s.key === "total") return { ...s, value: Number(s.value) + 1 };
        return s;
      }));
    }
    closeDelModal();
  };

  const closeDelModal = () => {
    setShowDelModal(false);
    setEditDelId(null);
    setDelForm({ title: '', target: '', amount: '10' });
  };

  const openEditModal = (del: any) => {
    setDelForm({ title: del.title, target: del.target, amount: '10' });
    setEditDelId(del.id);
    setShowDelModal(true);
  };

  const handleApprove = (id: string) => {
    setDelegations(prev => prev.map(del => {
      if (del.id === id) {
        return {
          ...del,
          status: "Active",
          statusColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
          actionRequired: false
        };
      }
      return del;
    }));
    setStats(prev => prev.map(s => {
      if (s.key === "active") return { ...s, value: Number(s.value) + 1 };
      return s;
    }));
  };

  const handleDelete = (id: string, currentlyActive: boolean) => {
    if (!window.confirm("Permanently revoke this delegation tree?")) return;
    setDelegations(prev => prev.filter(del => del.id !== id));
    setStats(prev => prev.map(s => {
      if (s.key === "total") return { ...s, value: Math.max(0, Number(s.value) - 1) };
      if (s.key === "active" && currentlyActive) return { ...s, value: Math.max(0, Number(s.value) - 1) };
      return s;
    }));
  };

  // --- INTENTS LOGIC ---
  const submitIntent = () => {
    if (!intentForm.target || !intentForm.reasoning) return alert("Missing required fields!");

    const newIntent = {
      id: `intent-${Date.now()}`,
      action: intentForm.action,
      target: intentForm.target,
      amount: intentForm.action === "transfer" ? (intentForm.amount + " ETH") : null,
      reasoning: intentForm.reasoning,
      status: "resolving",
      time: "just now"
    };
    setIntents(prev => [newIntent, ...prev]);
    setShowIntentModal(false);
    setIntentForm({ action: 'transfer', target: '', amount: '', reasoning: '' });
  };

  const handleDeleteIntent = (id: string) => {
    if (window.confirm("Delete intent?")) {
      setIntents(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleResolveIntent = (id: string) => {
    setIsResolving(id);
    setTimeout(() => {
      setIntents(prev => prev.map(intent => {
        if (intent.id === id) {
          return { ...intent, status: "matched", time: "just now" };
        }
        return intent;
      }));
      setStats(prev => prev.map(s => {
        if (s.key === "redeems") return { ...s, value: Number(s.value) + 1 };
        return s;
      }));
      setIsResolving(null);
    }, 1200);
  };

  // --- AGENTS LOGIC ---
  const submitAgent = () => {
    if (!agentForm.name || !agentForm.endpoint) return alert("Fill out Agent ID and RPC endpoint");

    const newAgent = {
      id: `ag-${Date.now()}`,
      name: agentForm.name,
      address: `0xBot...${Math.floor(Math.random() * 1000)}`,
      role: agentForm.role,
      status: "idle",
      executions: 0,
      used: 0,
      total: 100,
      model: agentForm.model,
      endpoint: agentForm.endpoint
    };
    setAgents(prev => [newAgent, ...prev]);
    setShowAgentModal(false);
    setAgentForm({ name: '', model: 'ollama', role: 'executor', endpoint: '' });
  };

  const handleDeleteAgent = (id: string) => {
    if (window.confirm("Deregister AI agent from network?")) {
      setAgents(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleToggleSafeMode = () => {
    if (!safeMode) {
      if (!window.confirm("Trigger Global Safe Mode? This will pause all linked ERC-7715 agent executions.")) return;
      setSafeMode(true);
      setAgents(prev => prev.map(ag => ({ ...ag, status: "safe_mode" })));
    } else {
      setSafeMode(false);
      setAgents(prev => prev.map(ag => ({ ...ag, status: "idle" })));
    }
  };

  const handleAgentExecute = (id: string) => {
    if (safeMode) {
      alert("Execution Blocked: Global Safe Mode is Active. Restore operations first.");
      return;
    }
    setAgents(prev => prev.map(ag => {
      if (ag.id === id) {
        return {
          ...ag,
          executions: ag.executions + 1,
          used: Math.min(ag.total, ag.used + 10),
          status: "active"
        };
      }
      return ag;
    }));
  };

  // --- SETTINGS LOGIC ---
  const saveSettings = () => {
    setIsSavingSettings(true);
    setTimeout(() => {
      setSettingsForm({ ...settingsForm });
      setSettings(settingsForm); // Just for confirmation flow
      setIsSavingSettings(false);
      alert("Settings permanently saved via Wagmi Config Updates!");
    }, 800);
  };
  const [settingsForm, setSettingsForm] = useState(settings);
  useEffect(() => { setSettingsForm(settings); }, [settings]);

  // --- ANALYTICS DATA ---
  const intentResolutionRate = intents.length ? Math.round((intents.filter(i => i.status === "matched").length / intents.length) * 100) : 100;
  const integrityScore = delegations.length > 0 ? Math.max(0, (100 - (delegations.filter(d => d.status === "Pending").length * 5))).toFixed(1) : "100.0";
  const numAgentsActive = agents.filter(a => a.status === "active").length;

  const statusIcons: Record<string, React.ReactNode> = {
    resolving: <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />,
    matched: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    failed: <AlertCircle className="w-5 h-5 text-red-500" />
  };

  const statusBadges: Record<string, string> = {
    resolving: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    matched: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    failed: "text-red-500 border-red-500/30 bg-red-500/10"
  };

  return (
    <>
      <div className="mesh-bg" />
      <div className="noise-overlay" />

      <div className="min-h-screen flex flex-col items-center relative z-10">

        {/* Modern Header */}
        <header className="w-full max-w-[1400px] px-6 h-24 flex items-center justify-between border-b border-white/5 bg-white/[0.01] backdrop-blur-md sticky top-0 z-50">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-white/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <DelegateFlowLogo />
              </div>
              <div className="text-2xl font-bold tracking-tight text-white hidden sm:block">
                Delegate<span className="text-blue-500 font-light">Flow</span>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.05]">
              {["Delegations", "Intents", "Agents", "Analytics", "Settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === tab ? "text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="activeTab" className="absolute inset-0 bg-white/10 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                  )}
                </button>
              ))}
            </nav>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
            <button className="hidden sm:flex w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (isConnected) disconnect();
                else if (connectors.length > 0) connect({ connector: connectors[0] });
              }}
              className="group relative px-6 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                {mounted && isConnected && address ? (
                  <><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />{truncateAddress(address)}</>
                ) : (
                  <>Connect Wallet <ChevronRight className="w-4 h-4" /></>
                )}
              </span>
            </button>
          </motion.div>
        </header>

        {/* Main Content */}
        <main className="w-full max-w-[1400px] px-6 py-12 flex-1 flex flex-col">

          <AnimatePresence mode="wait">
            {activeTab === "Delegations" && (
              <motion.div key="delegations" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="flex-1 flex flex-col">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                  <div className="max-w-3xl">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-6">
                      <Sparkles className="w-3.5 h-3.5" /> Intent-Based Protocol
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">Manage Delegations</h1>
                    <p className="text-zinc-400 text-lg leading-relaxed max-w-xl font-light">Orchestrate secure voting power and hierarchical permission structures across decentralized protocols with ERC-7715.</p>
                  </div>
                  <motion.button
                    onClick={() => setShowDelModal(true)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="relative px-6 py-3.5 rounded-xl bg-white text-black font-semibold overflow-hidden group flex items-center gap-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Plus className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">New Delegation</span>
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-16">
                  {stats.map((stat, i) => (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.2 }} key={stat.label} className="glass-panel rounded-2xl p-6 relative group hover:bg-white/[0.04] transition-colors overflow-hidden">
                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                      {stat.glow && <div className={`absolute top-0 blur-2xl right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-20 -z-10 rounded-full`} />}
                      <div className="text-zinc-400 text-xs font-bold tracking-[0.15em] uppercase mb-4 flex items-center justify-between">
                        {stat.label}
                        {stat.glow && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                      </div>
                      <div className="text-5xl font-light tracking-tight">{stat.value < 10 ? `0${stat.value}` : stat.value}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold tracking-tight text-white/90">Active Trees</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={handleCycleFilter} className="w-auto px-4 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all font-semibold gap-2">
                      <Filter className="w-4 h-4" /> Filter: {activeFilter}
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-20">
                  <AnimatePresence>
                    {filteredDelegations.length === 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center text-zinc-500 glass-panel rounded-2xl">
                        No active allocations yet. Create a delegation to begin!
                      </motion.div>
                    )}
                    {filteredDelegations.map((del) => (
                      <motion.div initial={{ opacity: 0, x: -20, height: 0 }} animate={{ opacity: 1, x: 0, height: "auto" }} exit={{ opacity: 0, x: 20, height: 0 }} transition={{ duration: 0.3 }} key={del.id} className="glass-panel rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all group overflow-hidden">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mt-2 mb-2">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-semibold text-white/90">{del.title}</h3>
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${del.statusColor}`}>{del.status}</span>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg text-sm text-zinc-300 border border-white/[0.05] shadow-inner">
                                <Database className="w-3.5 h-3.5 text-blue-400" />
                                <span className="font-mono">{del.source}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-zinc-600" />
                              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg text-sm text-zinc-300 border border-white/[0.05] shadow-inner">
                                {del.status === "Pending" ? <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> : <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                                <span className="font-mono">{del.target}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            {del.badges.map((badge: any, j: number) => (
                              <div key={j} className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.05] px-3 py-1.5 rounded-lg text-sm text-zinc-400 group-hover:bg-white/[0.05] transition-colors">
                                {getIconByName(badge.iconName)}
                                <span>{badge.iconText}</span>
                              </div>
                            ))}
                            <div className="flex items-center gap-2 ml-auto xl:ml-2">
                              {del.actionRequired ? (
                                <button onClick={() => handleApprove(del.id)} className="bg-blue-500 flex items-center justify-center hover:bg-blue-600 px-5 py-2 rounded-lg font-semibold transition-all text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]">Approve</button>
                              ) : (
                                <button onClick={() => openEditModal(del)} className="w-10 h-10 rounded-lg bg-white/[0.03] hover:bg-white/[0.1] flex items-center justify-center text-zinc-400 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                              )}
                              <button onClick={() => handleDelete(del.id, del.status === "Active")} className="w-10 h-10 rounded-lg bg-white/[0.03] hover:bg-red-500/20 flex items-center justify-center text-zinc-400 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === "Intents" && (
              <motion.div key="intents" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col space-y-8">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-4xl font-semibold mb-2">Intent Resolver</h2>
                    <p className="text-zinc-400">Match complex intents to trustless delegation paths.</p>
                  </div>
                  <button onClick={() => setShowIntentModal(true)} className="px-5 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 font-semibold shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <Plus className="w-4 h-4" /> New Intent
                  </button>
                </div>
                <div className="grid gap-4 mt-8">
                  {intents.length === 0 && <div className="p-8 text-center text-zinc-500 glass-panel rounded-2xl">No unresolved intents in queue.</div>}
                  {intents.map((intent, idx) => (
                    <motion.div key={intent.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-panel rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {statusIcons[intent.status]}
                          <div>
                            <p className="font-semibold text-lg text-white">Action: <span className="capitalize">{intent.action}</span></p>
                            <p className="text-sm text-zinc-400 font-mono mt-1 text-blue-300">Target: {intent.target}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg border font-bold ${statusBadges[intent.status]}`}>{intent.status}</span>
                          <p className="text-xs text-zinc-500 mt-2">{intent.time}</p>
                        </div>
                      </div>
                      <div className="border-t border-white/5 pt-4 mt-2">
                        <p className="text-sm text-zinc-400 mb-1"><strong className="text-white/80">Reasoning:</strong> {intent.reasoning}</p>
                        {intent.amount && <p className="text-sm text-zinc-400"><strong className="text-white/80">Amount:</strong> {intent.amount}</p>}
                      </div>
                      <div className="mt-4 flex gap-3 justify-end border-t border-white/5 pt-4">
                        {intent.status === "resolving" && (
                          <button onClick={() => handleResolveIntent(intent.id)} disabled={isResolving === intent.id} className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-xl text-sm font-semibold transition-all text-white flex gap-2 items-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            {isResolving === intent.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Resolve Path
                          </button>
                        )}
                        <button onClick={() => handleDeleteIntent(intent.id)} className="px-5 py-2 bg-white/5 hover:bg-red-500/20 text-red-400 border border-transparent hover:border-red-500/30 rounded-xl transition-all">Delete</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "Agents" && (
              <motion.div key="agents" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col space-y-8">
                <div className="flex flex-col lg:flex-row gap-12">
                  <div className="lg:w-1/3">
                    <h2 className="text-4xl font-semibold mb-3">AI Agents Mesh</h2>
                    <p className="text-zinc-400 mb-8 leading-relaxed text-lg">Coordinate autonomous AI instances like Ollama, GLM, Claude via trustless ERC-7715 budgets.</p>
                    <button onClick={() => setShowAgentModal(true)} className="w-full mb-8 px-6 py-3.5 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      <Plus className="w-5 h-5" /> Deploy AI Agent
                    </button>
                    <div className={`glass-panel rounded-2xl p-6 border-l-4 ${safeMode ? 'border-l-red-500 bg-red-500/5' : 'border-l-blue-500 bg-blue-500/5'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Server className={`${safeMode ? 'text-red-500 animate-pulse' : 'text-blue-400'} w-5 h-5`} />
                        <p className={`font-semibold text-lg ${safeMode ? 'text-red-500' : ''}`}>{safeMode ? "SYSTEM LOCKED" : "System Health"}</p>
                      </div>
                      <p className={`${safeMode ? 'text-red-400' : 'text-zinc-400'} text-sm mb-4`}>
                        {safeMode ? "All nodes paused via Circuit Breaker." : `${agents.length} active autonomous nodes operating on-chain.`}
                      </p>
                      <button onClick={handleToggleSafeMode} className={`w-full text-center text-sm py-2 rounded-lg border transition-colors ${safeMode ? "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10" : "border-red-500/30 text-red-500 hover:bg-red-500/10"
                        }`}>
                        {safeMode ? "Restore Operations" : "Trigger Safe Mode"}
                      </button>
                    </div>
                  </div>
                  <div className="lg:w-2/3 space-y-4">
                    {agents.length === 0 && <div className="p-8 text-center text-zinc-500 glass-panel rounded-2xl">No agents running. Deploy your first AI node.</div>}
                    {agents.map((ag) => (
                      <div key={ag.id} className="glass-panel border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 uppercase font-bold text-xs text-center text-zinc-300">
                              {ag.model.slice(0, 3)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-medium">{ag.name}</h3>
                                <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold">{ag.model}</span>
                              </div>
                              <p className="text-sm font-mono text-zinc-500">{ag.address}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs uppercase tracking-wider rounded-lg border font-bold ${ag.status === "active" ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" :
                              ag.status === "safe_mode" ? "text-red-500 border-red-500/30 bg-red-500/10 animate-pulse" :
                                "text-zinc-400 border-zinc-400/30 bg-zinc-400/10"
                            }`}>{ag.status === "safe_mode" ? "LOCKED" : ag.status}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-6 mb-4">
                          <div><p className="text-zinc-500 text-xs uppercase mb-1">Role</p><p className="font-medium text-white/90 capitalize">{ag.role}</p></div>
                          <div><p className="text-zinc-500 text-xs uppercase mb-1">Executions</p><p className="font-medium text-white/90">{ag.executions}</p></div>
                          <div><p className="text-zinc-500 text-xs uppercase mb-1">Budget Use</p><p className="font-medium text-white/90">{ag.used} / {ag.total}</p></div>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-4 mb-6"><div className={`h-full rounded-full transition-all ${(ag.used / ag.total) > 0.8 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${(ag.used / ag.total) * 100}%` }} /></div>
                        <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                          <button onClick={() => handleAgentExecute(ag.id)} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-zinc-300 transition-colors">Mock Connect</button>
                          <button onClick={() => handleDeleteAgent(ag.id)} className="px-4 py-2 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-lg text-sm text-red-400 transition-colors">Deregister</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "Analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col space-y-8">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-4xl font-semibold mb-2">Network Analytics</h2>
                    <p className="text-zinc-400">Dynamic system telemetry based on operating sub-delegations.</p>
                  </div>
                  <button className="px-5 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">Download Report</button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="glass-panel rounded-2xl p-8">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Platform Usage</p>
                    <div className="space-y-6 mt-6">
                      {[
                        { name: "Active Delegations", value: `${delegations.length}` },
                        { name: "Intent Resolution Rate", value: `${intentResolutionRate}%` },
                        { name: "Active Agent Nodes", value: `${numAgentsActive}` },
                        { name: "System Uptime", value: "99.9%" }
                      ].map(cav => (
                        <div key={cav.name}>
                          <div className="flex justify-between text-sm mb-2"><span>{cav.name}</span><span className="text-zinc-400 font-mono">{cav.value}</span></div>
                          <div className="w-full h-1 bg-white/5 rounded-full"><div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: String(cav.value).includes('%') ? cav.value : '75%' }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-panel rounded-2xl p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-soft-light text-center flex flex-col justify-center items-center">
                    <Terminal className="text-blue-400 w-12 h-12 mb-4" />
                    <h3 className="text-2xl font-semibold mb-2 text-white">Advanced Telemetry</h3>
                    <p className="text-zinc-400 mb-6 font-mono text-sm">Real-time mapping syncing valid graphs</p>
                    <div className="grid grid-cols-2 gap-4 w-full text-left">
                      <div className="p-4 rounded-xl border border-white/10 bg-black/40"><p className="text-xs text-zinc-500 mb-1">Integrity Score</p><p className="text-2xl font-bold text-emerald-400">{integrityScore}%</p></div>
                      <div className="p-4 rounded-xl border border-white/10 bg-black/40"><p className="text-xs text-zinc-500 mb-1">Executions</p><p className="text-2xl font-bold text-white">{stats[3].value}</p></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "Settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col space-y-8">
                <div className="max-w-3xl">
                  <h2 className="text-4xl font-semibold mb-4">Configuration</h2>
                  <p className="text-zinc-400 mb-8">Manage MetaMask framework node addresses.</p>
                  <div className="glass-panel rounded-2xl p-8 space-y-6">
                    <CustomInput label="Delegation Manager RPC" value={settingsForm.rpc} onChange={(e: any) => setSettingsForm({ ...settingsForm, rpc: e.target.value })} />
                    <CustomInput label="ERC-7715 Core Contract" value={settingsForm.core} onChange={(e: any) => setSettingsForm({ ...settingsForm, core: e.target.value })} />
                    <div className="flex gap-4">
                      <div className="w-1/2"><CustomInput type="number" label="Default Max Depth" value={settingsForm.depth} onChange={(e: any) => setSettingsForm({ ...settingsForm, depth: e.target.value })} /></div>
                      <div className="w-1/2"><CustomInput type="number" label="Alert Threshold (%)" value={settingsForm.alert} onChange={(e: any) => setSettingsForm({ ...settingsForm, alert: e.target.value })} /></div>
                    </div>
                    <div className="pt-4 mt-6 border-t border-white/10 text-right">
                      <button onClick={saveSettings} className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        {isSavingSettings ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Settings"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OVERLAY MODALS */}
          <AnimatePresence>
            {showDelModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl px-4 p-4">
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg glass-panel border border-white/10 rounded-2xl p-8 relative">
                  <button onClick={closeDelModal} className="absolute top-6 right-6 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
                  <h3 className="text-2xl font-bold mb-6 text-white">{editDelId ? "Update Allocation" : "Deploy Validation Framework"}</h3>
                  <CustomInput label="Delegation Name / Title" placeholder="e.g. Treasury Agent" value={delForm.title} onChange={(e: any) => setDelForm({ ...delForm, title: e.target.value })} />
                  <CustomInput label="Target Address or Contract" placeholder="0x..." value={delForm.target} onChange={(e: any) => setDelForm({ ...delForm, target: e.target.value })} />
                  {!editDelId && <CustomInput label="Budget Constraint (Max Amount)" type="number" value={delForm.amount} onChange={(e: any) => setDelForm({ ...delForm, amount: e.target.value })} />}
                  <button onClick={submitDelegation} className="w-full mt-4 py-3.5 bg-blue-500 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]">Authorize Protocol</button>
                </motion.div>
              </motion.div>
            )}

            {showIntentModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl px-4 p-4">
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg glass-panel border border-white/10 rounded-2xl p-8 relative">
                  <button onClick={() => setShowIntentModal(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
                  <h3 className="text-2xl font-bold mb-6 text-white">Create Protocol Intent</h3>
                  <CustomSelect label="Action Type" options={[{ label: 'ERC20 Transfer', value: 'transfer' }, { label: 'Contract Access', value: 'access' }, { label: 'Execute Arbitrary Code', value: 'execute' }]} value={intentForm.action} onChange={(e: any) => setIntentForm({ ...intentForm, action: e.target.value })} />
                  <CustomInput label="Target Receiver" placeholder="e.g. 0xReceiver..." value={intentForm.target} onChange={(e: any) => setIntentForm({ ...intentForm, target: e.target.value })} />
                  {intentForm.action === 'transfer' && <CustomInput label="Amount" placeholder="e.g. 200 USDC" value={intentForm.amount} onChange={(e: any) => setIntentForm({ ...intentForm, amount: e.target.value })} />}
                  <CustomInput label="Reasoning / Justification" placeholder="Required for on-chain audit" value={intentForm.reasoning} onChange={(e: any) => setIntentForm({ ...intentForm, reasoning: e.target.value })} />
                  <button onClick={submitIntent} className="w-full mt-4 py-3.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">Queue Intent</button>
                </motion.div>
              </motion.div>
            )}

            {showAgentModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl px-4 p-4">
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg glass-panel border border-white/10 rounded-2xl p-8 relative">
                  <button onClick={() => setShowAgentModal(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
                  <h3 className="text-2xl font-bold mb-6 text-white">Deploy AI Node</h3>
                  <CustomInput label="Agent Identifier" placeholder="e.g. Trading Bot Alpha" value={agentForm.name} onChange={(e: any) => setAgentForm({ ...agentForm, name: e.target.value })} />
                  <div className="flex gap-4">
                    <div className="w-1/2"><CustomSelect label="AI Core Model" options={[{ label: 'Ollama (Local)', value: 'ollama' }, { label: 'OpenClaw', value: 'openclaw' }, { label: 'GLM', value: 'glm' }, { label: 'Claude', value: 'claude' }]} value={agentForm.model} onChange={(e: any) => setAgentForm({ ...agentForm, model: e.target.value })} /></div>
                    <div className="w-1/2"><CustomSelect label="Agent Role" options={[{ label: 'Executor', value: 'executor' }, { label: 'Coordinator', value: 'coordinator' }, { label: 'Verifier', value: 'verifier' }]} value={agentForm.role} onChange={(e: any) => setAgentForm({ ...agentForm, role: e.target.value })} /></div>
                  </div>
                  <CustomInput label="Model Endpoint RPC" placeholder="http://localhost:11434" value={agentForm.endpoint} onChange={(e: any) => setAgentForm({ ...agentForm, endpoint: e.target.value })} />
                  <button onClick={submitAgent} className="w-full mt-4 py-3.5 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]">Initialize Node</button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>

        <footer className="w-full max-w-[1400px] px-6 py-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between mt-auto">
          <div className="flex items-center gap-4 text-sm font-semibold text-zinc-500">
            <span>Built for MetaMask <span className="text-white">Delegation Framework</span></span>
            <div className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="font-mono tracking-widest text-[10px] uppercase text-zinc-600">V3.0.0-PRO</span>
          </div>
        </footer>
      </div>
    </>
  );
}
