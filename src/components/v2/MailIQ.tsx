


import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, Send, Archive, Trash2, Star, Search, Mail, ChevronRight,
  Link, Hash, Calendar, Tag, Plus, Sparkles, Paperclip, X, Check,
  Bell, Settings, BarChart2, CheckSquare, Zap, Filter, SortDesc,
  ArrowLeft, ArrowRight, Reply, Forward, MoreHorizontal, RefreshCw,
  Sun, Moon, Monitor, ChevronDown, Clock, AlertCircle, TrendingUp,
  MessageSquare, Brain, Shield, Globe, Download, Eye, EyeOff,
  Wifi, WifiOff, Layers, Grid, List, Menu, LogOut, User, Loader2,
  ChevronUp, Columns, Target, Circle, MoveRight, Flag, Phone,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { toast } from 'sonner';
import { useMailIQ } from './hooks/useMailIQ';
import { useAI } from './hooks/useAI';
import type { Email, Task, TaskStatus, MailIQView, EmailFolder, SmartReplyOption } from './types';
import { MOCK_ANALYTICS } from './data/mockData';
import { formatRelativeTime } from './utils';

// ═══════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════
const NAV_ITEMS = [
  { id: 'inbox' as MailIQView, label: 'Inbox', icon: Inbox },
  { id: 'dashboard' as MailIQView, label: 'Analytics', icon: BarChart2 },
  { id: 'tasks' as MailIQView, label: 'Tasks', icon: CheckSquare },
  { id: 'search' as MailIQView, label: 'Search', icon: Search },
  { id: 'assistant' as MailIQView, label: 'AI Chat', icon: Brain },
  { id: 'notifications' as MailIQView, label: 'Alerts', icon: Bell },
  { id: 'settings' as MailIQView, label: 'Settings', icon: Settings },
];

const FOLDERS = [
  { id: 'inbox' as EmailFolder, label: 'Inbox', icon: Inbox },
  { id: 'sent' as EmailFolder, label: 'Sent', icon: Send },
  { id: 'starred' as EmailFolder, label: 'Starred', icon: Star },
  { id: 'archive' as EmailFolder, label: 'Archive', icon: Archive },
  { id: 'trash' as EmailFolder, label: 'Trash', icon: Trash2 },
];

const PRIORITY_CONFIG = {
  high: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
  medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
  low: { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
};

const SENTIMENT_CONFIG = {
  positive: { label: 'Positive', color: 'text-emerald-400', icon: '😊' },
  neutral: { label: 'Neutral', color: 'text-slate-400', icon: '😐' },
  negative: { label: 'Negative', color: 'text-red-400', icon: '😟' },
  urgent: { label: 'Urgent', color: 'text-amber-400', icon: '⚡' },
};

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'];

// ═══════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════
function Chip({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${className}`}>
      {children}
    </span>
  );
}

function Avatar({ name, size = 'sm' }: { name: string; size?: 'xs' | 'sm' | 'md' | 'lg' }) {
  const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const colors = [
    'from-indigo-500 to-violet-600', 'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600', 'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-600', 'from-purple-500 to-fuchsia-600',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center font-bold text-white shrink-0 select-none`}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

function LoadingSpinner({ size = 16 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-indigo-400" />;
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />;
}

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center z-10">
      {count > 9 ? '9+' : count}
    </span>
  );
}

// ═══════════════════════════════════════════════
// MAIN MAILIQ COMPONENT
// ═══════════════════════════════════════════════
export default function MailIQ() {
  const state = useMailIQ();
  const ai = useAI();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    currentView, setCurrentView, activeFolder, setActiveFolder,
    filteredEmails, activeEmail, openEmail, showCompose, setShowCompose,
    replyToEmail, setReplyToEmail, unreadCount, notificationCount,
    settings, updateTheme, gmailConnected,
  } = state;

  return (
    <div className={`flex-1 flex overflow-hidden relative ${settings.theme === 'light' ? 'bg-gray-50' : 'bg-slate-950'}`}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Column 1: Sidebar Nav ── */}
      <motion.div
        initial={false}
        animate={{ x: mobileMenuOpen ? 0 : undefined }}
        className={`
          w-14 xl:w-52 flex flex-col py-3 gap-1 shrink-0 overflow-hidden
          border-r border-white/5 bg-slate-950/90 backdrop-blur-xl
          max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50
          max-lg:w-52 max-lg:shadow-2xl
          ${mobileMenuOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'}
          transition-transform duration-200
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 pb-2 mb-1 border-b border-white/5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
            <Mail size={13} className="text-white" />
          </div>
          <div className="xl:block hidden">
            <p className="text-xs font-bold text-white leading-none">Mail-IQ</p>
            <p className="text-[9px] text-indigo-400 font-medium mt-0.5">AI Email Intelligence</p>
          </div>
        </div>

        {/* Gmail Connect Banner */}
        {!gmailConnected && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { toast.success('Gmail OAuth would open here — connect your API keys!'); state.setGmailConnected(true); }}
            className="mx-2 xl:mx-2 mb-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all xl:block hidden"
          >
            <div className="flex items-center gap-2">
              <Wifi size={12} />
              <span className="text-[10px] font-semibold">Connect Gmail</span>
            </div>
          </motion.button>
        )}

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-0.5 px-1.5">
          {NAV_ITEMS.map(item => {
            const isActive = currentView === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setCurrentView(item.id); setMobileMenuOpen(false); }}
                className={`relative w-full flex items-center gap-2.5 px-2 py-2 rounded-xl transition-all text-left
                  ${isActive
                    ? 'bg-indigo-500/15 text-indigo-300'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
              >
                <item.icon size={15} className="shrink-0" />
                <span className="xl:block hidden text-xs font-medium">{item.label}</span>
                {item.id === 'inbox' && unreadCount > 0 && (
                  <span className="xl:block hidden ml-auto text-[9px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>
                )}
                {item.id === 'notifications' && notificationCount > 0 && (
                  <>
                    <span className="xl:block hidden ml-auto text-[9px] bg-red-500/30 text-red-300 px-1.5 py-0.5 rounded-full font-bold">{notificationCount}</span>
                    <span className="xl:hidden absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full" />
                  </>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom: Theme toggle + Gmail status */}
        <div className="px-1.5 pb-2 pt-2 border-t border-white/5 space-y-1">
          <div className="xl:flex hidden items-center gap-1 p-1 rounded-lg bg-white/3">
            {(['dark', 'light', 'system'] as const).map(t => (
              <button
                key={t}
                onClick={() => updateTheme(t)}
                className={`flex-1 flex items-center justify-center p-1 rounded-md text-[10px] transition-all ${settings.theme === t ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-600 hover:text-slate-400'}`}
              >
                {t === 'dark' ? <Moon size={11} /> : t === 'light' ? <Sun size={11} /> : <Monitor size={11} />}
              </button>
            ))}
          </div>
          {gmailConnected && (
            <div className="xl:flex hidden items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
              <Wifi size={10} className="text-emerald-400" />
              <span className="text-[9px] text-emerald-400 font-medium truncate">Gmail Connected</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex overflow-hidden relative min-w-0">
        {/* Mobile header bar */}
        <div className="lg:hidden absolute top-0 left-0 right-0 z-30 flex items-center px-3 py-2 border-b border-white/5 bg-slate-950/90 backdrop-blur-xl">
          <button onClick={() => setMobileMenuOpen(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <Menu size={18} />
          </button>
          <div className="flex-1 flex items-center justify-center gap-2">
            <Mail size={14} className="text-indigo-400" />
            <span className="text-sm font-bold text-white">Mail-IQ</span>
          </div>
          <button onClick={() => setShowCompose(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <Plus size={18} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {currentView === 'inbox' && (
            <motion.div key="inbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex overflow-hidden max-lg:pt-11">
              <InboxView state={state} ai={ai} />
            </motion.div>
          )}
          {currentView === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto max-lg:pt-11">
              <DashboardView analytics={MOCK_ANALYTICS} emails={state.emails} />
            </motion.div>
          )}
          {currentView === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex-1 overflow-hidden max-lg:pt-11">
              <TasksView
                tasksByStatus={state.tasksByStatus}
                moveTask={state.moveTask}
                deleteTask={state.deleteTask}
                updateTask={state.updateTask}
              />
            </motion.div>
          )}
          {currentView === 'search' && (
            <motion.div key="search" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto max-lg:pt-11">
              <SearchView emails={state.emails} searchFilters={state.searchFilters} setSearchFilters={state.setSearchFilters} openEmail={(e) => { setCurrentView('inbox'); state.openEmail(e); }} />
            </motion.div>
          )}
          {currentView === 'assistant' && (
            <motion.div key="assistant" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col max-lg:pt-11">
              <AssistantView ai={ai} emails={state.emails} />
            </motion.div>
          )}
          {currentView === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto max-lg:pt-11">
              <NotificationsView
                notifications={state.notifications}
                markRead={state.markNotificationRead}
                markAllRead={state.markAllNotificationsRead}
              />
            </motion.div>
          )}
          {currentView === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto max-lg:pt-11">
              <SettingsView settings={state.settings} updateSettings={state.updateSettings} updateTheme={updateTheme} gmailConnected={gmailConnected} setGmailConnected={state.setGmailConnected} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <ComposeModal
            onClose={() => { setShowCompose(false); setReplyToEmail(null); }}
            onSend={state.sendEmail}
            replyTo={replyToEmail}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════
// INBOX VIEW
// ═══════════════════════════════════════════════
function InboxView({ state, ai }: { state: ReturnType<typeof useMailIQ>; ai: ReturnType<typeof useAI> }) {
  const { filteredEmails, activeEmail, openEmail, activeFolder, setActiveFolder,
    starEmail, archiveEmail, deleteEmail, showMobileList, setShowMobileList,
    unreadCount, setShowCompose, setReplyToEmail, createTaskFromEmail,
    searchFilters, setSearchFilters, labels } = state;
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'sender'>('date');

  const sorted = [...filteredEmails].sort((a, b) => {
    if (sortBy === 'priority') {
      const order = { high: 0, medium: 1, low: 2 };
      return (order[a.aiAnalysis?.priority ?? 'low'] ?? 2) - (order[b.aiAnalysis?.priority ?? 'low'] ?? 2);
    }
    if (sortBy === 'sender') return a.sender.localeCompare(b.sender);
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Folder Sidebar */}
      <div className="w-0 xl:w-40 shrink-0 xl:flex hidden flex-col py-3 px-2 border-r border-white/5 gap-0.5">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-2 mb-1">Folders</p>
        {FOLDERS.map(f => {
          const count = state.emails.filter(e => e.folder === f.id && !e.read).length;
          return (
            <button key={f.id} onClick={() => setActiveFolder(f.id)}
              className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-all
                ${activeFolder === f.id ? 'bg-indigo-500/15 text-indigo-300 font-semibold' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
              <div className="flex items-center gap-2"><f.icon size={13} />{f.label}</div>
              {count > 0 && <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 rounded-full">{count}</span>}
            </button>
          );
        })}
        <div className="mt-2 pt-2 border-t border-white/5">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-2 mb-1">Labels</p>
          {labels.map(l => (
            <button key={l.id}
              onClick={() => setSearchFilters({ ...searchFilters, labels: searchFilters.labels?.includes(l.name) ? searchFilters.labels.filter(x => x !== l.name) : [...(searchFilters.labels ?? []), l.name] })}
              className="w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                {l.name}
              </div>
              {l.count && <span className="text-[9px] text-slate-600">{l.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Email List */}
      <div className={`flex flex-col border-r border-white/5 shrink-0 overflow-hidden
        ${activeEmail ? 'w-[40%] max-lg:w-full' : 'w-full'}
        ${activeEmail && !showMobileList ? 'max-lg:hidden' : 'max-lg:flex'}`}>
        {/* List Header */}
        <div className="px-4 py-3 border-b border-white/5 space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white capitalize">{activeFolder}</h2>
              <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{sorted.length}</span>
              {unreadCount > 0 && activeFolder === 'inbox' && (
                <span className="text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">{unreadCount} new</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="text-[10px] bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-slate-400 focus:outline-none focus:border-indigo-500/50 cursor-pointer">
                <option value="date">Date</option>
                <option value="priority">Priority</option>
                <option value="sender">Sender</option>
              </select>
              <button onClick={() => setShowCompose(true)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-indigo-500/20 transition-colors">
                <Plus size={13} />
              </button>
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input type="text" value={searchFilters.query} onChange={e => setSearchFilters({ ...searchFilters, query: e.target.value })}
              placeholder="Search emails..." className="w-full pl-8 pr-3 h-7 text-xs rounded-lg bg-white/5 border border-white/8 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors" />
            {searchFilters.query && (
              <button onClick={() => setSearchFilters({ ...searchFilters, query: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Email Items */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="popLayout" initial={false}>
            {sorted.map(email => (
              <EmailListItem
                key={email.id}
                email={email}
                isActive={activeEmail?.id === email.id}
                onClick={() => openEmail(email)}
                onStar={ev => { ev.stopPropagation(); starEmail(email.id); }}
                onArchive={ev => { ev.stopPropagation(); archiveEmail(email.id); toast.success('Archived'); }}
                onDelete={ev => { ev.stopPropagation(); deleteEmail(email.id); toast.success('Moved to trash'); }}
              />
            ))}
          </AnimatePresence>
          {sorted.length === 0 && <EmptyState folder={activeFolder} />}
        </div>
      </div>

      {/* Email Reader */}
      <div className={`flex-1 flex flex-col overflow-hidden min-w-0
        ${!activeEmail ? 'max-lg:hidden' : ''}
        ${showMobileList ? 'max-lg:hidden' : 'max-lg:flex max-lg:flex-1'}`}>
        {activeEmail ? (
          <EmailReaderPane
            email={activeEmail}
            ai={ai}
            onBack={() => setShowMobileList(true)}
            onReply={() => { setReplyToEmail(activeEmail); setShowCompose(true); }}
            onArchive={() => { archiveEmail(activeEmail.id); toast.success('Archived'); }}
            onStar={() => starEmail(activeEmail.id)}
            onDelete={() => { deleteEmail(activeEmail.id); toast.success('Moved to trash'); }}
            onCreateTask={() => { createTaskFromEmail(activeEmail); toast.success(`${(activeEmail.extractedData?.actionItems?.length ?? 1)} task(s) created!`); }}
          />
        ) : (
          <IdleState />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// EMAIL LIST ITEM
// ═══════════════════════════════════════════════
function EmailListItem({ email, isActive, onClick, onStar, onArchive, onDelete }: {
  email: Email;
  isActive: boolean;
  onClick: () => void;
  onStar: (ev: React.MouseEvent) => void;
  onArchive: (ev: React.MouseEvent) => void;
  onDelete: (ev: React.MouseEvent) => void;
}) {
  const priority = email.aiAnalysis?.priority;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={onClick}
      className={`relative px-4 py-3 border-b border-white/[0.04] cursor-pointer transition-all group
        ${isActive ? 'bg-indigo-500/8' : 'hover:bg-white/[0.03]'}`}
    >
      {isActive && <motion.div layoutId="email-active-bar" className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-400" />}

      <div className="flex items-start gap-3">
        <Avatar name={email.sender} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <p className={`text-xs font-semibold truncate ${!email.read ? 'text-white' : 'text-slate-400'}`}>
              {email.sender}
            </p>
            <span className="text-[10px] text-slate-600 shrink-0">{formatRelativeTime(email.timestamp)}</span>
          </div>
          <p className={`text-xs truncate mb-0.5 ${!email.read ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
            {email.subject}
          </p>
          <p className="text-[11px] text-slate-600 truncate">{email.preview}</p>

          {/* Chips */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {priority && (
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${PRIORITY_CONFIG[priority].bg} ${PRIORITY_CONFIG[priority].color}`}>
                <span className={`w-1 h-1 rounded-full ${PRIORITY_CONFIG[priority].dot}`} />
                {PRIORITY_CONFIG[priority].label}
              </span>
            )}
            {email.labels?.slice(0, 2).map(l => (
              <span key={l} className="px-1.5 py-0.5 rounded-full text-[9px] border border-white/10 text-slate-500 bg-white/3">{l}</span>
            ))}
            {email.extractedData?.deadlines?.length ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] border border-emerald-500/20 text-emerald-400 bg-emerald-500/8">
                <Clock size={8} />{email.extractedData.deadlines[0].date}
              </span>
            ) : null}
            {email.extractedData?.otp && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] border border-amber-500/20 text-amber-400 bg-amber-500/8">
                <Hash size={8} />OTP
              </span>
            )}
            {email.attachments?.length ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] border border-white/10 text-slate-500 bg-white/3">
                <Paperclip size={8} />{email.attachments.length}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onStar} className={`w-6 h-6 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors ${email.starred ? 'text-amber-400' : 'text-slate-600'}`}>
          <Star size={11} fill={email.starred ? 'currentColor' : 'none'} />
        </button>
        <button onClick={onArchive} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors text-slate-600 hover:text-slate-400">
          <Archive size={11} />
        </button>
        <button onClick={onDelete} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-red-500/20 transition-colors text-slate-600 hover:text-red-400">
          <Trash2 size={11} />
        </button>
      </div>

      {!email.read && <div className="absolute top-4 right-14 w-1.5 h-1.5 bg-indigo-400 rounded-full" />}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
// EMAIL READER PANE
// ═══════════════════════════════════════════════
function EmailReaderPane({ email, ai, onBack, onReply, onArchive, onStar, onDelete, onCreateTask }: {
  email: Email;
  ai: ReturnType<typeof useAI>;
  onBack: () => void;
  onReply: () => void;
  onArchive: () => void;
  onStar: () => void;
  onDelete: () => void;
  onCreateTask: () => void;
}) {
  const [aiExpanded, setAiExpanded] = useState(true);
  const [activeAiTab, setActiveAiTab] = useState<'summary' | 'reply' | 'tasks' | 'translate'>('summary');
  const [smartReplies, setSmartReplies] = useState<SmartReplyOption[]>([]);
  const [selectedReply, setSelectedReply] = useState<string | null>(null);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState('Hindi');

  const loadSmartReplies = useCallback(async () => {
    setIsLoadingReplies(true);
    const replies = await ai.generateReplies(email);
    setSmartReplies(replies);
    setIsLoadingReplies(false);
  }, [email, ai]);

  useEffect(() => {
    setSmartReplies([]);
    setSelectedReply(null);
    setTranslatedText(null);
    setAiExpanded(true);
    setActiveAiTab('summary');
  }, [email.id]);

  const handleTranslate = async () => {
    const result = await ai.translateEmail(email, targetLang);
    setTranslatedText(result);
  };

  return (
    <motion.div
      key={email.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex-1 flex flex-col overflow-hidden"
    >
      {/* Reader Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 shrink-0">
        <button onClick={onBack} className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors mr-1">
          <ArrowLeft size={15} />
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <ToolbarBtn icon={Reply} onClick={onReply} title="Reply" />
          <ToolbarBtn icon={Star} onClick={onStar} title="Star" active={email.starred} activeColor="text-amber-400" />
          <ToolbarBtn icon={Archive} onClick={onArchive} title="Archive" />
          <ToolbarBtn icon={CheckSquare} onClick={onCreateTask} title="Extract Tasks" activeColor="text-emerald-400" />
          <ToolbarBtn icon={Trash2} onClick={onDelete} title="Delete" hover="hover:text-red-400 hover:bg-red-500/10" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Email Header */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-lg font-bold text-white leading-tight flex-1">{email.subject}</h2>
            {email.aiAnalysis?.priority && (
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border shrink-0 ${PRIORITY_CONFIG[email.aiAnalysis.priority].bg} ${PRIORITY_CONFIG[email.aiAnalysis.priority].color}`}>
                <Flag size={9} />{PRIORITY_CONFIG[email.aiAnalysis.priority].label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Avatar name={email.sender} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200">{email.sender}</p>
              <p className="text-xs text-slate-500">{email.senderEmail}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-slate-500">{new Date(email.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              {email.aiAnalysis?.sentiment && (
                <span className={`text-xs ${SENTIMENT_CONFIG[email.aiAnalysis.sentiment].color}`}>
                  {SENTIMENT_CONFIG[email.aiAnalysis.sentiment].icon} {SENTIMENT_CONFIG[email.aiAnalysis.sentiment].label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Labels */}
        {email.labels && email.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {email.labels.map(l => (
              <span key={l} className="px-2.5 py-1 rounded-full text-[11px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">{l}</span>
            ))}
          </div>
        )}

        {/* AI Intelligence Panel */}
        <motion.div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 overflow-hidden">
          <button
            onClick={() => setAiExpanded(p => !p)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-500/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-500/20 flex items-center justify-center">
                <Sparkles size={11} className="text-indigo-400" />
              </div>
              <span className="text-xs font-semibold text-indigo-300">AI Intelligence</span>
              {ai.isAnalyzing && <LoadingSpinner size={12} />}
            </div>
            <ChevronDown size={14} className={`text-slate-500 transition-transform ${aiExpanded ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {aiExpanded && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                className="overflow-hidden border-t border-indigo-500/10">
                {/* AI Tabs */}
                <div className="flex border-b border-indigo-500/10">
                  {(['summary', 'reply', 'tasks', 'translate'] as const).map(tab => (
                    <button key={tab} onClick={() => { setActiveAiTab(tab); if (tab === 'reply' && smartReplies.length === 0) loadSmartReplies(); }}
                      className={`flex-1 py-2 text-[11px] font-medium capitalize transition-colors
                        ${activeAiTab === tab ? 'text-indigo-300 border-b-2 border-indigo-400 -mb-px' : 'text-slate-600 hover:text-slate-400'}`}>
                      {tab === 'reply' ? 'Smart Reply' : tab === 'translate' ? 'Translate' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="p-4">
                  {activeAiTab === 'summary' && (
                    <div className="space-y-3">
                      {email.aiAnalysis?.summary ? (
                        <p className="text-xs text-slate-300 leading-relaxed">{email.aiAnalysis.summary}</p>
                      ) : (
                        <div className="space-y-1.5">
                          <SkeletonBlock className="h-3 w-full" />
                          <SkeletonBlock className="h-3 w-4/5" />
                          <SkeletonBlock className="h-3 w-3/5" />
                        </div>
                      )}
                      {email.extractedData?.actionItems && email.extractedData.actionItems.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Action Items</p>
                          {email.extractedData.actionItems.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                              <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[8px] text-indigo-400 font-bold">{i + 1}</span>
                              </div>
                              {item}
                            </div>
                          ))}
                        </div>
                      )}
                      {email.extractedData?.deadlines?.length && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Deadlines</p>
                          {email.extractedData.deadlines.map((d, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <Calendar size={11} className="text-emerald-400 shrink-0" />
                              <span className="text-slate-400">{d.label}:</span>
                              <span className="text-emerald-300 font-medium">{d.date}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {email.aiAnalysis?.suggestedLabels && email.aiAnalysis.suggestedLabels.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Suggested Labels</p>
                          <div className="flex flex-wrap gap-1">
                            {email.aiAnalysis.suggestedLabels.map(l => (
                              <span key={l} className="px-2 py-0.5 rounded-full text-[10px] border border-indigo-500/20 text-indigo-400 bg-indigo-500/5">{l}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {email.aiAnalysis?.confidence && (
                        <div className="flex items-center gap-2 mt-2">
                          <Shield size={10} className="text-slate-600" />
                          <span className="text-[10px] text-slate-600">AI Confidence: {Math.round(email.aiAnalysis.confidence * 100)}%</span>
                        </div>
                      )}
                    </div>
                  )}

                  {activeAiTab === 'reply' && (
                    <div className="space-y-3">
                      {isLoadingReplies ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <LoadingSpinner size={14} />Generating smart replies...
                        </div>
                      ) : smartReplies.length > 0 ? (
                        <>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Choose a Reply</p>
                          {smartReplies.map((reply, i) => (
                            <div key={i}
                              onClick={() => setSelectedReply(selectedReply === reply.content ? null : reply.content)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all
                                ${selectedReply === reply.content ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-white/8 bg-white/3 hover:border-white/15'}`}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-semibold text-slate-300">{reply.label}</span>
                                <span className="text-[9px] text-slate-600 capitalize border border-white/10 px-1.5 rounded-full">{reply.tone}</span>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2">{reply.content}</p>
                            </div>
                          ))}
                          {selectedReply && (
                            <button onClick={() => { toast.success('Reply sent!'); setSelectedReply(null); }}
                              className="w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2">
                              <Send size={12} />Send Reply
                            </button>
                          )}
                        </>
                      ) : (
                        <button onClick={loadSmartReplies}
                          className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                          <Sparkles size={13} />Generate Smart Replies
                        </button>
                      )}
                    </div>
                  )}

                  {activeAiTab === 'tasks' && (
                    <div className="space-y-3">
                      {email.extractedData?.actionItems && email.extractedData.actionItems.length > 0 ? (
                        <>
                          <p className="text-xs text-slate-400">These action items can be converted to tasks:</p>
                          {email.extractedData.actionItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/3 border border-white/8">
                              <Circle size={11} className="text-emerald-400 shrink-0" />
                              <span className="text-xs text-slate-300 flex-1">{item}</span>
                            </div>
                          ))}
                          <button onClick={onCreateTask}
                            className="w-full py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2">
                            <Plus size={12} />Create {email.extractedData.actionItems.length} Task{email.extractedData.actionItems.length > 1 ? 's' : ''}
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-slate-500">No action items detected in this email.</p>
                      )}
                    </div>
                  )}

                  {activeAiTab === 'translate' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <select value={targetLang} onChange={e => setTargetLang(e.target.value)}
                          className="flex-1 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500/50">
                          {['Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Arabic', 'Portuguese'].map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                        <button onClick={handleTranslate}
                          className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium hover:bg-indigo-500/30 transition-colors flex items-center gap-1.5">
                          {ai.isTranslating ? <LoadingSpinner size={12} /> : <Globe size={12} />}Translate
                        </button>
                      </div>
                      {translatedText && (
                        <div className="p-3 rounded-lg bg-white/3 border border-white/8">
                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{translatedText}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Extracted Links */}
        {email.extractedData?.links && email.extractedData.links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {email.extractedData.links.map(link => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/8 border border-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors">
                <Link size={11} />{link.label}
              </a>
            ))}
          </div>
        )}

        {/* Email Body */}
        <div className="bg-white/[0.02] rounded-xl border border-white/6 p-5">
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{email.body}</p>
        </div>

        {/* Reply Button */}
        <button onClick={onReply}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-sm w-full justify-center">
          <Reply size={14} />Reply to {email.sender}
        </button>
      </div>
    </motion.div>
  );
}

function ToolbarBtn({ icon: Icon, onClick, title, active, activeColor, hover }: {
  icon: React.ElementType;
  onClick: () => void;
  title: string;
  active?: boolean;
  activeColor?: string;
  hover?: string;
}) {
  return (
    <button onClick={onClick} title={title}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
        ${active ? (activeColor ?? 'text-indigo-400') + ' bg-indigo-500/10' : 'text-slate-500 hover:text-slate-200 hover:bg-white/10'}
        ${hover ?? ''}`}>
      <Icon size={13} />
    </button>
  );
}

// ═══════════════════════════════════════════════
// DASHBOARD VIEW
// ═══════════════════════════════════════════════
function DashboardView({ analytics, emails }: { analytics: typeof MOCK_ANALYTICS; emails: Email[] }) {
  const STAT_CARDS = [
    { label: 'Total Emails', value: analytics.totalEmails, icon: Mail, color: 'text-indigo-400', bg: 'bg-indigo-500/10', change: '+12%' },
    { label: 'Unread', value: analytics.unreadEmails, icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10', change: '-3' },
    { label: 'High Priority', value: analytics.priorityEmails, icon: Flag, color: 'text-red-400', bg: 'bg-red-500/10', change: '+2' },
    { label: 'Deadlines', value: analytics.upcomingDeadlines, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: 'this week' },
    { label: 'AI Actions', value: analytics.aiActionsToday, icon: Sparkles, color: 'text-violet-400', bg: 'bg-violet-500/10', change: 'today' },
    { label: 'Productivity', value: `${analytics.productivityScore}%`, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10', change: '+5% vs last week' },
  ];

  return (
    <div className="p-5 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-xs text-slate-500 mt-0.5">AI-powered insights into your email productivity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAT_CARDS.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/15 transition-all">
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={15} className={stat.color} />
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{stat.label}</p>
            <p className="text-[9px] text-slate-600 mt-1">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Activity */}
        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/8">
          <p className="text-sm font-semibold text-white mb-1">Weekly Activity</p>
          <p className="text-[10px] text-slate-600 mb-4">Emails received, sent & AI-processed per day</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={analytics.weeklyActivity} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="received" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="received" stroke="#6366f1" fill="url(#received)" strokeWidth={2} name="Received" />
              <Area type="monotone" dataKey="sent" stroke="#10b981" fill="url(#sent)" strokeWidth={2} name="Sent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/8">
          <p className="text-sm font-semibold text-white mb-1">Email Categories</p>
          <p className="text-[10px] text-slate-600 mb-4">Distribution by category type</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={analytics.categoryBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {analytics.categoryBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {analytics.categoryBreakdown.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Priority & Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/8">
          <p className="text-sm font-semibold text-white mb-4">Priority Breakdown</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={analytics.priorityBreakdown} layout="vertical" margin={{ left: -10 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={50} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                {analytics.priorityBreakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.color} opacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/8">
          <p className="text-sm font-semibold text-white mb-4">Sentiment Analysis</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={analytics.sentimentBreakdown} layout="vertical" margin={{ left: -10 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                {analytics.sentimentBreakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.color} opacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent High Priority */}
      <div className="p-5 rounded-xl bg-white/[0.03] border border-white/8">
        <p className="text-sm font-semibold text-white mb-3">High Priority Emails</p>
        <div className="space-y-2">
          {emails.filter(e => e.aiAnalysis?.priority === 'high').slice(0, 4).map(email => (
            <div key={email.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
              <Avatar name={email.sender} size="xs" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{email.subject}</p>
                <p className="text-[10px] text-slate-600">{email.sender}</p>
              </div>
              {email.extractedData?.deadlines?.[0] && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 px-2 py-1 rounded-full shrink-0">
                  <Clock size={9} />{email.extractedData.deadlines[0].date}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TASKS VIEW — KANBAN BOARD
// ═══════════════════════════════════════════════
function TasksView({ tasksByStatus, moveTask, deleteTask, updateTask }: {
  tasksByStatus: { todo: Task[]; in_progress: Task[]; done: Task[] };
  moveTask: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}) {
  const columns: { id: TaskStatus; label: string; color: string; bg: string }[] = [
    { id: 'todo', label: 'To Do', color: 'text-slate-300', bg: 'bg-slate-500/10 border-slate-500/20' },
    { id: 'in_progress', label: 'In Progress', color: 'text-amber-300', bg: 'bg-amber-500/10 border-amber-500/20' },
    { id: 'done', label: 'Done', color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div className="h-full flex flex-col p-5 gap-4">
      <div>
        <h1 className="text-xl font-bold text-white">Task Board</h1>
        <p className="text-xs text-slate-500 mt-0.5">Tasks extracted from your emails via AI</p>
      </div>
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col.id} className="flex-1 min-w-[280px] flex flex-col gap-3">
            <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${col.bg}`}>
              <span className={`text-xs font-semibold ${col.color}`}>{col.label}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/20 ${col.color}`}>
                {tasksByStatus[col.id].length}
              </span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              <AnimatePresence>
                {tasksByStatus[col.id].map(task => (
                  <motion.div key={task.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-3.5 rounded-xl bg-white/[0.04] border border-white/8 hover:border-white/15 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs font-semibold text-slate-200 leading-snug flex-1">{task.title}</p>
                      <button onClick={() => deleteTask(task.id)}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                        <X size={10} />
                      </button>
                    </div>
                    {task.description && <p className="text-[11px] text-slate-600 mb-2 leading-snug">{task.description}</p>}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${PRIORITY_CONFIG[task.priority].bg} ${PRIORITY_CONFIG[task.priority].color}`}>
                        {PRIORITY_CONFIG[task.priority].label}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 px-1.5 py-0.5 rounded-full">
                          <Clock size={8} />{task.dueDate}
                        </span>
                      )}
                      {task.emailSubject && (
                        <span className="flex items-center gap-1 text-[9px] text-slate-600 border border-white/8 px-1.5 py-0.5 rounded-full truncate max-w-[100px]">
                          <Mail size={8} />{task.emailSubject.slice(0, 20)}…
                        </span>
                      )}
                    </div>
                    {/* Move buttons */}
                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {col.id !== 'todo' && (
                        <button onClick={() => moveTask(task.id, col.id === 'in_progress' ? 'todo' : 'in_progress')}
                          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded-lg hover:bg-white/5 transition-all">
                          <ArrowLeft size={10} />Back
                        </button>
                      )}
                      {col.id !== 'done' && (
                        <button onClick={() => moveTask(task.id, col.id === 'todo' ? 'in_progress' : 'done')}
                          className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-lg hover:bg-indigo-500/10 transition-all ml-auto">
                          {col.id === 'todo' ? 'Start' : 'Done'}<ArrowRight size={10} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {tasksByStatus[col.id].length === 0 && (
                <div className="flex items-center justify-center h-24 rounded-xl border border-dashed border-white/10 text-xs text-slate-700">
                  No tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// SEARCH VIEW
// ═══════════════════════════════════════════════
function SearchView({ emails, searchFilters, setSearchFilters, openEmail }: {
  emails: Email[];
  searchFilters: { query: string; priority?: string; isUnread?: boolean; isStarred?: boolean; hasAttachments?: boolean };
  setSearchFilters: (f: any) => void;
  openEmail: (e: Email) => void;
}) {
  const results = emails.filter(email => {
    const q = searchFilters.query.toLowerCase();
    if (!q) return false;
    return email.subject.toLowerCase().includes(q) ||
      email.sender.toLowerCase().includes(q) ||
      email.body.toLowerCase().includes(q) ||
      email.senderEmail.toLowerCase().includes(q);
  });

  const QUICK_SEARCHES = [
    'urgent emails this week', 'emails with attachments', 'patent emails',
    'interview confirmation', 'invoices and billing', 'meetings scheduled',
  ];

  return (
    <div className="p-5 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Advanced Search</h1>
        <p className="text-xs text-slate-500 mt-0.5">Search across all emails with AI-powered natural language</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={searchFilters.query} onChange={e => setSearchFilters({ ...searchFilters, query: e.target.value })}
          placeholder='Try: "urgent emails with deadlines" or "interview from Google"'
          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors" />
        {searchFilters.query && (
          <button onClick={() => setSearchFilters({ query: '' })}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={15} /></button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Unread', key: 'isUnread', value: true },
          { label: 'Starred', key: 'isStarred', value: true },
          { label: 'Attachments', key: 'hasAttachments', value: true },
          { label: 'High Priority', key: 'priority', value: 'high' },
        ].map(filter => {
          const active = (searchFilters as any)[filter.key] === filter.value;
          return (
            <button key={filter.label}
              onClick={() => setSearchFilters({ ...searchFilters, [filter.key]: active ? undefined : filter.value })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${active ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/3 border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20'}`}>
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Quick Searches */}
      {!searchFilters.query && (
        <div className="space-y-2">
          <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Quick Searches</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {QUICK_SEARCHES.map(q => (
              <button key={q} onClick={() => setSearchFilters({ query: q })}
                className="flex items-center gap-2 p-3 rounded-xl bg-white/3 border border-white/8 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-left">
                <Sparkles size={12} className="text-indigo-400 shrink-0" />
                <span className="text-xs text-slate-400">{q}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searchFilters.query && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">{results.length} result{results.length !== 1 ? 's' : ''} for "<span className="text-white">{searchFilters.query}</span>"</p>
          {results.map(email => (
            <motion.div key={email.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => openEmail(email)}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/8 hover:border-indigo-500/30 hover:bg-indigo-500/3 cursor-pointer transition-all">
              <div className="flex items-start gap-3">
                <Avatar name={email.sender} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white truncate">{email.subject}</p>
                    <span className="text-[10px] text-slate-600 shrink-0">{formatRelativeTime(email.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{email.sender} · {email.senderEmail}</p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{email.preview}</p>
                  {email.aiAnalysis?.summary && (
                    <div className="mt-2 flex items-start gap-1.5">
                      <Sparkles size={10} className="text-indigo-400 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-indigo-300/80 line-clamp-1">{email.aiAnalysis.summary}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {results.length === 0 && searchFilters.query && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search size={32} className="text-slate-700 mb-3" />
              <p className="text-sm text-slate-400 font-medium">No results found</p>
              <p className="text-xs text-slate-600 mt-1">Try different keywords or check your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// AI ASSISTANT VIEW
// ═══════════════════════════════════════════════
function AssistantView({ ai, emails }: { ai: ReturnType<typeof useAI>; emails: Email[] }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ai.chatMessages]);

  const handleSend = () => {
    if (!input.trim() || ai.isChatLoading) return;
    ai.sendChatMessage(input.trim(), emails);
    setInput('');
  };

  const SUGGESTIONS = [
    'Summarize my important emails',
    'What deadlines do I have this week?',
    'Show me all interview emails',
    'Find patent-related emails',
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Mail-IQ AI Assistant</h2>
            <p className="text-[10px] text-slate-500">Powered by Gemini · Connected to your inbox</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-400">Active</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {ai.chatMessages.map(msg => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-gradient-to-br from-indigo-500 to-violet-600' : 'bg-white/10'}`}>
              {msg.role === 'assistant' ? <Brain size={13} className="text-white" /> : <User size={13} className="text-slate-300" />}
            </div>
            <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line
                ${msg.role === 'assistant' ? 'bg-white/[0.05] border border-white/8 text-slate-200' : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-100'}`}>
                {msg.content}
              </div>
              <span className="text-[9px] text-slate-700">{formatRelativeTime(msg.timestamp)}</span>
            </div>
          </motion.div>
        ))}
        {ai.isChatLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Brain size={13} className="text-white" />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/8">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {ai.chatMessages.length <= 1 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => { setInput(s); }}
              className="text-[11px] text-indigo-400 bg-indigo-500/8 border border-indigo-500/20 px-3 py-1.5 rounded-full hover:bg-indigo-500/15 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-5 pb-5 shrink-0">
        <div className="flex gap-3 p-2 rounded-2xl bg-white/5 border border-white/10 focus-within:border-indigo-500/50 transition-colors">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask anything about your emails..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none px-2" />
          <button onClick={handleSend} disabled={!input.trim() || ai.isChatLoading}
            className="w-9 h-9 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// NOTIFICATIONS VIEW
// ═══════════════════════════════════════════════
function NotificationsView({ notifications, markRead, markAllRead }: {
  notifications: import('./types').MailNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}) {
  const CATEGORY_ICONS = {
    email: Mail, deadline: Clock, ai: Sparkles, system: Settings,
  };
  const CATEGORY_COLORS = {
    email: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    deadline: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    ai: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    system: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  };

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">{notifications.filter(n => !n.read).length} unread</p>
        </div>
        <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-500/10">
          Mark all read
        </button>
      </div>
      <div className="space-y-2">
        {notifications.map(notif => {
          const Icon = CATEGORY_ICONS[notif.category];
          return (
            <motion.div key={notif.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => markRead(notif.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-white/15
                ${notif.read ? 'bg-white/[0.02] border-white/5' : 'bg-white/[0.04] border-white/10'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${CATEGORY_COLORS[notif.category]}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-semibold ${notif.read ? 'text-slate-400' : 'text-white'}`}>{notif.title}</p>
                    <span className="text-[10px] text-slate-600 shrink-0">{formatRelativeTime(notif.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                </div>
                {!notif.read && <div className="w-2 h-2 bg-indigo-400 rounded-full shrink-0 mt-1" />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// SETTINGS VIEW
// ═══════════════════════════════════════════════
function SettingsView({ settings, updateSettings, updateTheme, gmailConnected, setGmailConnected }: {
  settings: import('./types').MailSettings;
  updateSettings: (u: Partial<import('./types').MailSettings>) => void;
  updateTheme: (t: import('./types').ThemeMode) => void;
  gmailConnected: boolean;
  setGmailConnected: (v: boolean) => void;
}) {
  return (
    <div className="p-5 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Customize your Mail-IQ experience</p>
      </div>

      {/* Gmail Connection */}
      <SettingsSection title="Gmail Account" description="Connect your Gmail account for live email syncing">
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/8">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${gmailConnected ? 'bg-emerald-500/15 border border-emerald-500/20' : 'bg-white/5 border border-white/10'}`}>
              {gmailConnected ? <Wifi size={16} className="text-emerald-400" /> : <WifiOff size={16} className="text-slate-500" />}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{gmailConnected ? 'Gmail Connected' : 'Not Connected'}</p>
              <p className="text-xs text-slate-500">{gmailConnected ? 'deven@gmail.com · Last sync: Just now' : 'Connect to sync live emails'}</p>
            </div>
          </div>
          <button onClick={() => setGmailConnected(!gmailConnected)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors
              ${gmailConnected ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20' : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30'}`}>
            {gmailConnected ? 'Disconnect' : 'Connect Gmail'}
          </button>
        </div>
      </SettingsSection>

      {/* Appearance */}
      <SettingsSection title="Appearance" description="Customize the visual style of Mail-IQ">
        <div className="space-y-3">
          <SettingRow label="Theme" description="Choose your preferred color theme">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
              {(['dark', 'light', 'system'] as const).map(t => (
                <button key={t} onClick={() => updateTheme(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize
                    ${settings.theme === t ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}>
                  {t === 'dark' ? <Moon size={12} /> : t === 'light' ? <Sun size={12} /> : <Monitor size={12} />}
                  {t}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Font Size" description="Adjust reading comfort">
            <select value={settings.fontSize} onChange={e => updateSettings({ fontSize: e.target.value as any })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50">
              <option value="sm">Small</option>
              <option value="base">Medium</option>
              <option value="lg">Large</option>
            </select>
          </SettingRow>
          <SettingRow label="Compact Mode" description="Show more emails in the list">
            <Toggle checked={settings.compactMode} onChange={v => updateSettings({ compactMode: v })} />
          </SettingRow>
        </div>
      </SettingsSection>

      {/* AI Preferences */}
      <SettingsSection title="AI Intelligence" description="Configure AI models and behavior">
        <div className="space-y-3">
          <SettingRow label="AI Model" description="Select your preferred AI provider">
            <select value={settings.aiModel} onChange={e => updateSettings({ aiModel: e.target.value as any })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50">
              <option value="gemini">Gemini 1.5 Pro</option>
              <option value="gpt-4">GPT-4o</option>
              <option value="gpt-3.5">GPT-3.5 Turbo</option>
            </select>
          </SettingRow>
          <SettingRow label="Summary Length" description="How detailed should AI summaries be?">
            <select value={settings.summaryLength} onChange={e => updateSettings({ summaryLength: e.target.value as any })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50">
              <option value="short">Short (1 sentence)</option>
              <option value="medium">Medium (2-3 sentences)</option>
              <option value="detailed">Detailed (paragraph)</option>
            </select>
          </SettingRow>
          <SettingRow label="Auto Summarize" description="Automatically summarize new emails">
            <Toggle checked={settings.autoSummarize} onChange={v => updateSettings({ autoSummarize: v })} />
          </SettingRow>
          <SettingRow label="Auto Extract" description="Extract tasks and deadlines automatically">
            <Toggle checked={settings.autoExtract} onChange={v => updateSettings({ autoExtract: v })} />
          </SettingRow>
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications" description="Control when and how you're notified">
        <div className="space-y-3">
          <SettingRow label="Email Alerts" description="Notify on new high-priority emails">
            <Toggle checked={settings.emailAlerts} onChange={v => updateSettings({ emailAlerts: v })} />
          </SettingRow>
          <SettingRow label="Deadline Alerts" description="Remind me before deadlines">
            <Toggle checked={settings.deadlineAlerts} onChange={v => updateSettings({ deadlineAlerts: v })} />
          </SettingRow>
        </div>
      </SettingsSection>

      {/* Profile */}
      <SettingsSection title="Profile" description="Your account information">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/8">
          <Avatar name="Deven Goyal" size="lg" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Deven Goyal</p>
            <p className="text-xs text-slate-500">deven@mailiq.dev</p>
            <a href="https://devengoyal.netlify.app" target="_blank" rel="noopener noreferrer"
              className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors">
              devengoyal.netlify.app ↗
            </a>
          </div>
          <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white hover:border-white/20 transition-all">
            Edit
          </button>
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection title="Privacy & Data" description="Manage your data and account">
        <div className="space-y-2">
          <button onClick={() => toast.success('Data export started — you\'ll receive an email shortly')}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-white/3 border border-white/8 text-sm text-slate-400 hover:text-white hover:border-white/15 transition-all text-left">
            <Download size={14} />Export All Data
          </button>
          <button onClick={() => toast.error('Account deletion requires email confirmation')}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-red-500/5 border border-red-500/20 text-sm text-red-400 hover:bg-red-500/10 transition-all text-left">
            <Trash2 size={14} />Delete Account
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}

function SettingsSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-slate-600 mt-0.5">{description}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/8">
      <div>
        <p className="text-xs font-medium text-slate-200">{label}</p>
        <p className="text-[10px] text-slate-600 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? 'bg-indigo-500' : 'bg-white/10'}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

// ═══════════════════════════════════════════════
// COMPOSE MODAL
// ═══════════════════════════════════════════════
function ComposeModal({ onClose, onSend, replyTo }: {
  onClose: () => void;
  onSend: (draft: Partial<import('./types').Email>) => void;
  replyTo: Email | null;
}) {
  const [to, setTo] = useState(replyTo?.senderEmail ?? '');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState(replyTo ? `\n\n---\nOn ${new Date(replyTo.timestamp).toLocaleDateString()}, ${replyTo.sender} wrote:\n${replyTo.body.split('\n').slice(0, 3).map(l => `> ${l}`).join('\n')}` : '');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!to.trim() || !body.trim()) { toast.error('Please fill in recipient and message'); return; }
    setIsSending(true);
    await new Promise(r => setTimeout(r, 800));
    onSend({ recipient: to, recipientEmail: to, subject, body });
    toast.success('Email sent successfully!');
    setIsSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center">
              <Send size={12} className="text-indigo-400" />
            </div>
            <span className="text-sm font-semibold text-white">{replyTo ? 'Reply' : 'New Message'}</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <input type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="To:"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors" />
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject:"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors" />
          </div>
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..."
            rows={10}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-colors">
                <Paperclip size={14} />
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-indigo-400 bg-indigo-500/8 border border-indigo-500/20 hover:bg-indigo-500/15 transition-colors">
                <Sparkles size={12} />AI Assist
              </button>
            </div>
            <button onClick={handleSend} disabled={isSending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
              {isSending ? <LoadingSpinner size={14} /> : <Send size={14} />}
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
// IDLE STATE
// ═══════════════════════════════════════════════
function IdleState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full blur-3xl opacity-[0.06]"
            style={{ width: `${180 + i * 60}px`, height: `${180 + i * 60}px`, left: `${(i * 19) % 80}%`, top: `${(i * 27) % 75}%`, background: i % 2 === 0 ? '#6366f1' : '#a855f7' }}
            animate={{ x: [0, 25, -15, 10, 0], y: [0, -20, 15, -5, 0], scale: [1, 1.1, 0.95, 1.05, 1] }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center px-8">
        <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-5 backdrop-blur-xl">
          <Mail size={32} className="text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Select an email</h3>
        <p className="text-sm text-slate-600 max-w-xs">Choose an email from the list to read it and unlock AI-powered insights</p>
        <div className="flex items-center justify-center gap-3 mt-5 text-xs text-slate-700">
          <span className="flex items-center gap-1"><Sparkles size={11} /> AI Summary</span>
          <span>·</span>
          <span className="flex items-center gap-1"><CheckSquare size={11} /> Task Extraction</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Reply size={11} /> Smart Reply</span>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════
function EmptyState({ folder }: { folder: EmailFolder }) {
  const messages: Record<EmailFolder, { icon: React.ElementType; title: string; desc: string }> = {
    inbox: { icon: Inbox, title: 'Inbox Zero! 🎉', desc: "You're all caught up. No new emails." },
    sent: { icon: Send, title: 'No sent emails', desc: 'Your sent emails will appear here.' },
    archive: { icon: Archive, title: 'Archive empty', desc: 'Archived emails will appear here.' },
    trash: { icon: Trash2, title: 'Trash is empty', desc: 'Deleted emails will appear here.' },
    starred: { icon: Star, title: 'No starred emails', desc: 'Star important emails to find them here.' },
    drafts: { icon: Mail, title: 'No drafts', desc: 'Your draft emails will appear here.' },
  };
  const msg = messages[folder];
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <msg.icon size={32} className="text-slate-700 mb-3" />
      <p className="text-sm font-semibold text-slate-400">{msg.title}</p>
      <p className="text-xs text-slate-600 mt-1">{msg.desc}</p>
    </div>
  );
}


