/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { Sun, Moon, Eye, LogOut, Trophy, Mail, ShieldAlert, Sparkles } from 'lucide-react';
import { ThemeType } from '../types';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  gmailAccount: string | null;
  onConnectGmail: () => void;
  isConnectingGmail: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  gmailAccount,
  onConnectGmail,
  isConnectingGmail
}) => {
  const { theme, setTheme, autoNightMode, setAutoNightMode } = useTheme();
  const [showAutoDropdown, setShowAutoDropdown] = useState(false);

  const themeIcons = {
    light: <Sun className="h-4 w-4 text-amber-500" />,
    dark: <Moon className="h-4 w-4 text-indigo-400" />,
    night: <Eye className="h-4 w-4 text-amber-600" />
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 dark:border-slate-800 night:border-night-border bg-white/95 dark:bg-slate-900/95 night:bg-night-bg/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Hackathon Badge */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-indigo-600 dark:bg-indigo-500 night:bg-night-accent text-white p-2 rounded-lg shadow-sm">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-bold text-lg text-gray-900 dark:text-white night:text-night-text tracking-tight">
                MAIL IQ
              </span>
              <span className="text-[9px] bg-indigo-50 dark:bg-slate-800 night:bg-night-surface text-indigo-600 dark:text-indigo-400 night:text-night-accent font-semibold px-1.5 py-0.5 rounded-sm border border-indigo-100/30">
                PRO v1.0
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-1 text-[10px] text-gray-400 dark:text-gray-500 night:text-night-muted">
              <span>AI-Powered Email Copilot</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Theme & User Controls */}
        <div className="flex items-center space-x-3">

          {/* Theme Selector Widget */}
          <div className="relative flex items-center bg-gray-100 dark:bg-slate-800 night:bg-night-surface p-1 rounded-full border border-gray-200/50 dark:border-slate-700 night:border-night-border">
            {(['light', 'dark', 'night'] as ThemeType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`p-1.5 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 night:hover:bg-night-highlight/50 transition-all ${
                  theme === t 
                    ? 'bg-white dark:bg-slate-900 night:bg-night-bg shadow-xs border border-gray-200/20 dark:border-slate-800 night:border-night-border' 
                    : 'opacity-65'
                }`}
                title={`${t.charAt(0).toUpperCase() + t.slice(1)} Mode`}
              >
                {themeIcons[t]}
              </button>
            ))}
          </div>

          {/* Eye-Care Auto Settings Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowAutoDropdown(!showAutoDropdown)}
              className="p-2 border border-gray-200 dark:border-slate-700 night:border-night-border rounded-full hover:bg-gray-50 dark:hover:bg-slate-800 night:hover:bg-night-surface text-gray-500 dark:text-gray-300 night:text-night-text"
              title="Eye Care Timer"
            >
              <Eye className={`h-4.5 w-4.5 ${autoNightMode ? 'text-amber-600 dark:text-amber-400 night:text-night-accent animate-pulse' : ''}`} />
            </button>

            {showAutoDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 night:bg-night-surface rounded-xl border border-gray-200 dark:border-slate-700 night:border-night-border shadow-lg p-4 z-50">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white night:text-night-text uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Blue Light Filter Mode</span>
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 night:text-night-muted mb-3">
                  Enabling scheduled mode shifts Mail IQ to a soft amber Night Palette between <strong>9:00 PM and 7:00 AM</strong>.
                </p>
                <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-gray-700 dark:text-gray-300 night:text-night-text">
                  <input
                    type="checkbox"
                    checked={autoNightMode}
                    onChange={(e) => setAutoNightMode(e.target.checked)}
                    className="rounded text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 h-4 w-4 bg-gray-100 dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                  />
                  <span>Auto-switch (9 PM - 7 AM)</span>
                </label>
              </div>
            )}
          </div>

          {/* Separation vertical bar */}
          <span className="h-6 w-px bg-gray-200 dark:bg-slate-800 night:bg-night-border" />

          {/* Connect Gmail status or trigger */}
          {gmailAccount ? (
            <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/20 night:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-full px-2.5 py-1 text-xs text-emerald-800 dark:text-emerald-300 night:text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span>{gmailAccount}</span>
            </div>
          ) : (
            <button
              onClick={onConnectGmail}
              disabled={isConnectingGmail}
              className="hidden sm:flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 night:bg-night-surface night:hover:bg-night-highlight text-indigo-700 dark:text-indigo-400 night:text-night-accent border border-indigo-100 dark:border-slate-700 night:border-night-border px-3 py-1 rounded-full text-xs font-medium transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>{isConnectingGmail ? 'Opening...' : 'Connect Gmail'}</span>
            </button>
          )}

          {/* User Signout Button */}
          <button
            onClick={onLogout}
            className="p-2 text-gray-500 dark:text-gray-400 night:text-night-text hover:text-rose-600 dark:hover:text-rose-400 night:hover:text-rose-400 border border-transparent hover:border-gray-100 dark:hover:border-slate-800 night:hover:border-night-border rounded-lg transition-all"
            title="Sign Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
