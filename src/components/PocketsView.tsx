/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Mail, MailOpen, Calendar, AlertTriangle, CheckCheck, Search, FilterX, HelpCircle } from 'lucide-react';
import { Email, EmailAnalysis } from '../types';

interface PocketsViewProps {
  emails: Email[];
  selectedEmail: Email | null;
  onSelectEmail: (email: Email) => void;
  activeFilterKeyword: string | null;
  onClearFilter: () => void;
  onMarkPocketAsRead: (senderEmail: string) => void;
}

export const PocketsView: React.FC<PocketsViewProps> = ({
  emails,
  selectedEmail,
  onSelectEmail,
  activeFilterKeyword,
  onClearFilter,
  onMarkPocketAsRead
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPockets, setExpandedPockets] = useState<Record<string, boolean>>({});

  // Group emails into "Pockets" by normalized sender_email
  const groupedPockets = useMemo(() => {
    // 1. Filter emails based on search query and active custom keyword filter
    let filtered = emails;

    if (activeFilterKeyword) {
      const kw = activeFilterKeyword.toLowerCase();
      filtered = filtered.filter(
        e => e.subject.toLowerCase().includes(kw) || e.body.toLowerCase().includes(kw)
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        e => e.subject.toLowerCase().includes(q) || 
             e.sender.toLowerCase().includes(q) || 
             e.body.toLowerCase().includes(q)
      );
    }

    const pockets: Record<string, {
      senderName: string;
      senderEmail: string;
      emailsList: Email[];
      unreadCount: number;
      mostRecentDate: string;
    }> = {};

    filtered.forEach((email) => {
      const sEmail = email.sender_email.toLowerCase();
      // Extract display name or fallback
      let sName = email.sender;
      if (sName.includes('<')) {
        sName = sName.split('<')[0].trim();
      }

      if (!pockets[sEmail]) {
        pockets[sEmail] = {
          senderName: sName || sEmail,
          senderEmail: email.sender_email,
          emailsList: [],
          unreadCount: 0,
          mostRecentDate: email.date
        };
      }

      pockets[sEmail].emailsList.push(email);
      if (!email.is_read) {
        pockets[sEmail].unreadCount += 1;
      }

      // Check dates
      if (new Date(email.date) > new Date(pockets[sEmail].mostRecentDate)) {
        pockets[sEmail].mostRecentDate = email.date;
      }
    });

    // Convert to sorted list based on mostRecentDate descending
    return Object.values(pockets).sort((a, b) => 
      new Date(b.mostRecentDate).getTime() - new Date(a.mostRecentDate).getTime()
    );
  }, [emails, searchTerm, activeFilterKeyword]);

  const togglePocket = (senderEmail: string) => {
    setExpandedPockets(prev => ({
      ...prev,
      [senderEmail]: !prev[senderEmail]
    }));
  };

  // Auto-expand first pocket if none are manually open
  React.useEffect(() => {
    if (groupedPockets.length > 0 && Object.keys(expandedPockets).length === 0) {
      setExpandedPockets({
        [groupedPockets[0].senderEmail]: true
      });
    }
  }, [groupedPockets]);

  // Urgency color map
  const getUrgencyBadge = (analysis?: EmailAnalysis) => {
    if (!analysis || !analysis.is_real_deadline) return null;
    const score = analysis.urgency_score;
    if (score >= 8) {
      return (
        <span className="text-[10px] bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-bold px-2 py-0.5 rounded-full flex items-center shrink-0">
          <AlertTriangle className="h-3 w-3 mr-1 animate-bounce" />
          Urgent ({score})
        </span>
      );
    } else if (score >= 5) {
      return (
        <span className="text-[10px] bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full shrink-0">
          Moderate ({score})
        </span>
      );
    } else {
      return (
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium px-2 py-0.5 rounded-full shrink-0">
          Low ({score})
        </span>
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 night:bg-night-bg border border-gray-100 dark:border-slate-800 night:border-night-border rounded-2xl overflow-hidden shadow-xs transition-colors duration-200">
      
      {/* Search Header */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-800 night:border-night-border space-y-3 bg-gray-50/50 dark:bg-slate-900/50 night:bg-night-surface/10">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500 night:text-night-muted" />
          <input
            type="text"
            placeholder="Search pockets & subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 night:bg-night-surface border border-gray-200 dark:border-slate-700 night:border-night-border text-xs rounded-xl text-gray-900 dark:text-white night:text-night-text focus:outline-none focus:ring-1.5 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Filter State Banner */}
        {activeFilterKeyword && (
          <div className="flex items-center justify-between bg-indigo-500/10 dark:bg-indigo-500/5 night:bg-night-highlight/50 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
            <span className="text-[10px] text-indigo-700 dark:text-indigo-300 night:text-night-text font-medium flex items-center">
              Filtered Keyword: <strong>{activeFilterKeyword}</strong>
            </span>
            <button
              onClick={onClearFilter}
              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 night:text-night-accent hover:underline text-[10px] flex items-center space-x-1 font-bold"
            >
              <FilterX className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Pockets List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {groupedPockets.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2">
            <MailOpen className="h-8 w-8 text-gray-300 dark:text-gray-600 night:text-night-border mx-auto" />
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 night:text-night-text uppercase tracking-wider">
              No Pockets Found
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 night:text-night-muted max-w-xs mx-auto">
              There are no emails matching your filters or search constraints. Trigger a fresh scan to gather emails.
            </p>
          </div>
        ) : (
          groupedPockets.map((pocket) => {
            const isExpanded = expandedPockets[pocket.senderEmail] || false;
            return (
              <div 
                key={pocket.senderEmail}
                className={`border rounded-xl transition-all ${
                  isExpanded 
                    ? 'border-indigo-100 dark:border-slate-700 night:border-night-border bg-gray-50/25 dark:bg-slate-800/25 night:bg-night-surface/10 shadow-xs' 
                    : 'border-gray-100 dark:border-slate-800/50 night:border-night-border bg-white dark:bg-slate-900 night:bg-night-bg hover:border-gray-200 dark:hover:border-slate-700 night:hover:border-night-border/80'
                }`}
              >
                {/* Pocket Header */}
                <div className="flex items-center justify-between p-3 cursor-pointer select-none">
                  <div 
                    className="flex-1 flex items-center space-x-2 min-w-0"
                    onClick={() => togglePocket(pocket.senderEmail)}
                  >
                    <span className="text-gray-400 shrink-0">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white night:text-night-text truncate pr-1">
                        {pocket.senderName}
                      </h4>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 night:text-night-muted truncate max-w-[180px]">
                        {pocket.senderEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Unread badge count */}
                    {pocket.unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-indigo-600 dark:bg-indigo-500 night:bg-night-accent text-white h-5 w-5 rounded-full flex items-center justify-center shadow-xs">
                        {pocket.unreadCount}
                      </span>
                    )}
                    {/* Action: Mark pocket as read speedbutton */}
                    {pocket.unreadCount > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkPocketAsRead(pocket.senderEmail);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 night:hover:bg-night-highlight rounded text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 night:hover:text-night-accent"
                        title="Mark pocket as read"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Pocket Content list (Collapsible) */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-gray-100/50 dark:border-slate-700/50 night:border-night-border/50 space-y-1.5">
                    {pocket.emailsList.map((email) => {
                      const isSelected = selectedEmail?.id === email.id;
                      const hasDeadline = email.analysis?.is_real_deadline;

                      return (
                        <div
                          key={email.id}
                          onClick={() => onSelectEmail(email)}
                          className={`p-2.5 rounded-lg cursor-pointer text-left border transition-all ${
                            isSelected
                              ? 'bg-indigo-50/70 dark:bg-slate-800 night:bg-night-highlight/70 border-indigo-200 dark:border-indigo-500/30 night:border-night-accent/40'
                              : 'bg-white dark:bg-slate-900 night:bg-night-bg border-gray-50 dark:border-slate-800/80 night:border-night-border hover:bg-gray-50/50 dark:hover:bg-slate-800/30 night:hover:bg-night-highlight/20'
                          }`}
                        >
                          <div className="flex items-start justify-between space-x-2">
                            <h5 className={`text-[11px] leading-tight truncate flex-1 ${
                              email.is_read ? 'text-gray-600 dark:text-gray-300 night:text-night-text/80 font-normal' : 'text-gray-900 dark:text-white night:text-night-text font-bold'
                            }`}>
                              {email.subject}
                            </h5>
                            {!email.is_read && (
                              <span className="h-1.5 w-1.5 bg-indigo-600 dark:bg-indigo-500 night:bg-night-accent rounded-full shrink-0 mt-1" />
                            )}
                          </div>
                          
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 night:text-night-muted line-clamp-1 mt-1 font-sans">
                            {email.snippet}
                          </p>

                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-50/50 dark:border-slate-800/50 night:border-night-border/30">
                            <span className="text-[9px] text-gray-400 dark:text-gray-500 night:text-night-muted flex items-center">
                              <Calendar className="h-2.5 w-2.5 mr-1" />
                              {new Date(email.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {hasDeadline && getUrgencyBadge(email.analysis)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
