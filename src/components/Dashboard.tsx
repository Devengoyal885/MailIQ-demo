/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, AlertTriangle, ShieldCheck, Inbox, ShieldAlert, Sparkles, RefreshCw, Clock, ArrowRight, Trophy } from 'lucide-react';
import { Email, SecurityLog, DashboardStats } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  securityLogs: SecurityLog[];
  onTriggerScan: () => void;
  isScanning: boolean;
  scanLog: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  securityLogs,
  onTriggerScan,
  isScanning,
  scanLog
}) => {
  return (
    <div className="space-y-5">
      {/* 1. Bento Grid Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Synced Emails */}
        <div className="bg-white dark:bg-slate-900 night:bg-night-bg border border-gray-100 dark:border-slate-800 night:border-night-border rounded-2xl p-4 shadow-xs flex items-center space-x-3.5 transition-colors">
          <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/5 night:bg-night-highlight rounded-xl text-indigo-600 dark:text-indigo-400 night:text-night-accent shrink-0">
            <Mail className="h-5.5 w-5.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 night:text-night-muted">Synced Inbox</p>
            <p className="text-xl font-bold font-display text-gray-900 dark:text-white night:text-night-text mt-0.5">
              {stats.totalEmails}
            </p>
          </div>
        </div>

        {/* Active Deadlines */}
        <div className="bg-white dark:bg-slate-900 night:bg-night-bg border border-gray-100 dark:border-slate-800 night:border-night-border rounded-2xl p-4 shadow-xs flex items-center space-x-3.5 transition-colors">
          <div className="p-3 bg-red-500/10 dark:bg-red-500/5 night:bg-night-highlight rounded-xl text-red-600 dark:text-red-400 night:text-night-accent shrink-0">
            <AlertTriangle className="h-5.5 w-5.5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 night:text-night-muted">Deadlines Detected</p>
            <p className="text-xl font-bold font-display text-gray-900 dark:text-white night:text-night-text mt-0.5">
              {stats.activeDeadlines}
            </p>
          </div>
        </div>

        {/* Senders grouped */}
        <div className="bg-white dark:bg-slate-900 night:bg-night-bg border border-gray-100 dark:border-slate-800 night:border-night-border rounded-2xl p-4 shadow-xs flex items-center space-x-3.5 transition-colors">
          <div className="p-3 bg-teal-500/10 dark:bg-teal-500/5 night:bg-night-highlight rounded-xl text-teal-600 dark:text-teal-400 night:text-night-accent shrink-0">
            <Inbox className="h-5.5 w-5.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 night:text-night-muted">Active Pockets</p>
            <p className="text-xl font-bold font-display text-gray-900 dark:text-white night:text-night-text mt-0.5">
              {stats.totalPockets}
            </p>
          </div>
        </div>

        {/* Security Blocks */}
        <div className="bg-white dark:bg-slate-900 night:bg-night-bg border border-gray-100 dark:border-slate-800 night:border-night-border rounded-2xl p-4 shadow-xs flex items-center space-x-3.5 transition-colors">
          <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/5 night:bg-night-highlight rounded-xl text-emerald-600 dark:text-emerald-400 night:text-night-accent shrink-0">
            <ShieldCheck className="h-5.5 w-5.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 night:text-night-muted">Security Blocks</p>
            <p className="text-xl font-bold font-display text-gray-900 dark:text-white night:text-night-text mt-0.5">
              {stats.securityIncidents}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Interactive AI Email Scanner Dashboard Control */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-5 border border-indigo-800 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative overflow-hidden">
        {/* Abstract background art */}
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center shrink-0">
          <Sparkles className="h-44 w-44 text-indigo-400" />
        </div>

        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Background Daemon Active
            </span>
            <div className="flex items-center text-[10px] text-gray-300">
              <Clock className="h-3 w-3 mr-1" />
              <span>Cron: Every 15 min</span>
            </div>
          </div>
          <h2 className="text-base font-bold font-display tracking-tight text-white">
            Mail IQ Engine Scanning Panel
          </h2>
          <p className="text-[11px] text-gray-300 max-w-xl leading-relaxed">
            Trigger a manual inbox sync scan. The AI engine processes new emails, strips promotional headers, intercepts prompt injection threats, extracts commitments with Gemini 3.5, and fires Twilio voice alerts for approaching deadlines.
          </p>
        </div>

        <div className="shrink-0 flex flex-col justify-center space-y-2 z-10">
          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Sandbox...' : 'Run Scanner Scan'}</span>
          </button>
        </div>
      </div>

      {/* Trigger scan feedback banner */}
      {scanLog && (
        <div className="p-3 bg-amber-50 dark:bg-slate-800 night:bg-night-surface border border-amber-500/10 dark:border-slate-700 night:border-night-border rounded-xl text-[11px] text-amber-800 dark:text-amber-300 night:text-night-text flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
          <span>{scanLog}</span>
        </div>
      )}

      {/* 3. Security Audit Logs Panel */}
      <div className="bg-white dark:bg-slate-900 night:bg-night-bg border border-gray-100 dark:border-slate-800 night:border-night-border rounded-2xl p-4 shadow-xs space-y-4 transition-colors">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 night:text-night-text uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-500" />
            <span>Cyber Shield - Threat Logs</span>
          </h3>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 night:text-night-muted">
            Intercepted exploits, system overrides, and prompt injection attempts logged in real-time.
          </p>
        </div>

        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {securityLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-rose-500/5 border border-rose-500/15 rounded-xl text-xs flex items-start space-x-3"
            >
              <div className="p-1.5 bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 rounded-lg shrink-0 mt-0.5">
                <ShieldAlert className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-semibold text-rose-900 dark:text-rose-300 night:text-rose-200 truncate">
                  Blocked Exploit: {log.subject}
                </p>
                <p className="text-[10px] text-rose-700/80 dark:text-rose-400/80 font-medium">
                  Reason: {log.reason}
                </p>
                <div className="text-[9px] text-gray-400 dark:text-gray-500 night:text-night-muted flex items-center pt-0.5">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Logged at: {new Date(log.logged_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}

          {securityLogs.length === 0 && (
            <div className="text-center py-6 text-gray-400 dark:text-gray-500 night:text-night-muted text-[11px]">
              No security blocks logged yet. Prompt injection tests are executed inside the email scanning trigger.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
