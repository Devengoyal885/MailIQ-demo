/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Tag, Plus, Trash2, Filter, FilterX, HelpCircle } from 'lucide-react';
import { KeywordRule, Email } from '../types';

interface KeywordsPanelProps {
  keywords: KeywordRule[];
  emails: Email[];
  activeFilterKeyword: string | null;
  onSelectFilterKeyword: (keyword: string | null) => void;
  onAddKeyword: (label: string, keyword: string) => void;
  onDeleteKeyword: (id: string) => void;
  isAdding: boolean;
}

export const KeywordsPanel: React.FC<KeywordsPanelProps> = ({
  keywords,
  emails,
  activeFilterKeyword,
  onSelectFilterKeyword,
  onAddKeyword,
  onDeleteKeyword,
  isAdding
}) => {
  const [label, setLabel] = useState('');
  const [keywordText, setKeywordText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Calculate email matches count per keyword rule
  const keywordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    keywords.forEach((rule) => {
      const kw = rule.keyword.toLowerCase();
      const count = emails.filter(
        e => e.subject.toLowerCase().includes(kw) || e.body.toLowerCase().includes(kw)
      ).length;
      counts[rule.id] = count;
    });
    return counts;
  }, [keywords, emails]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !keywordText.trim()) return;
    onAddKeyword(label, keywordText);
    setLabel('');
    setKeywordText('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 night:bg-night-bg border border-gray-100 dark:border-slate-800 night:border-night-border rounded-2xl p-4 shadow-xs space-y-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 night:text-night-text uppercase tracking-wider flex items-center space-x-1.5">
          <Tag className="h-4 w-4 text-indigo-500" />
          <span>Keyword Headings</span>
        </h3>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 night:hover:bg-night-surface rounded text-indigo-600 dark:text-indigo-400 night:text-night-accent font-semibold transition-colors"
          title="Add keyword category"
        >
          <Plus className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Add Rule Form (Expands inline) */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-3 bg-gray-50 dark:bg-slate-800 night:bg-night-surface border border-gray-100 dark:border-slate-700 night:border-night-border rounded-xl space-y-2.5">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Category Label</label>
            <input
              type="text"
              placeholder="e.g. Finance"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 night:bg-night-bg border border-gray-200 dark:border-slate-700 night:border-night-border text-xs rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Matching Text</label>
            <input
              type="text"
              placeholder="e.g. Stripe, invoice"
              value={keywordText}
              onChange={(e) => setKeywordText(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 night:bg-night-bg border border-gray-200 dark:border-slate-700 night:border-night-border text-xs rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="w-1/2 py-1 px-2 border border-gray-200 dark:border-slate-600 night:border-night-border text-[10px] rounded hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="w-1/2 py-1 px-2 bg-indigo-600 dark:bg-indigo-500 night:bg-night-accent text-white text-[10px] font-bold rounded hover:bg-indigo-700"
            >
              Save Rule
            </button>
          </div>
        </form>
      )}

      {/* Keywords Badges Filter Grid */}
      <div className="space-y-1.5">
        {/* "All" button */}
        <button
          onClick={() => onSelectFilterKeyword(null)}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg border transition-all ${
            activeFilterKeyword === null
              ? 'bg-indigo-600/10 dark:bg-indigo-500/10 night:bg-night-highlight/60 border-indigo-200 dark:border-indigo-500/20 night:border-night-accent/40 text-indigo-900 dark:text-indigo-200 night:text-night-text font-semibold'
              : 'border-transparent text-gray-700 dark:text-gray-300 night:text-night-text hover:bg-gray-50 dark:hover:bg-slate-800 night:hover:bg-night-highlight/20'
          }`}
        >
          <span className="flex items-center space-x-1.5">
            <Filter className="h-3.5 w-3.5" />
            <span>Show All Inboxes</span>
          </span>
          <span className="bg-gray-100 dark:bg-slate-800 night:bg-night-surface px-1.5 py-0.5 rounded-full text-[10px] font-mono text-gray-500 font-bold">
            {emails.length}
          </span>
        </button>

        {keywords.map((rule) => {
          const isSelected = activeFilterKeyword === rule.keyword;
          const count = keywordCounts[rule.id] || 0;

          return (
            <div
              key={rule.id}
              className={`group flex items-center justify-between rounded-lg border transition-all ${
                isSelected
                  ? 'bg-indigo-600/10 dark:bg-indigo-500/10 night:bg-night-highlight/60 border-indigo-200 dark:border-indigo-500/20 night:border-night-accent/40 text-indigo-900 dark:text-indigo-200 night:text-night-text font-semibold'
                  : 'border-transparent text-gray-700 dark:text-gray-300 night:text-night-text hover:bg-gray-50 dark:hover:bg-slate-800 night:hover:bg-night-highlight/20'
              }`}
            >
              <button
                onClick={() => onSelectFilterKeyword(isSelected ? null : rule.keyword)}
                className="flex-1 flex items-center space-x-1.5 px-3 py-2 text-xs text-left"
              >
                <Tag className="h-3.5 w-3.5 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate leading-none">{rule.label}</p>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 night:text-night-muted truncate mt-0.5 font-mono">
                    match: "{rule.keyword}"
                  </p>
                </div>
              </button>

              <div className="flex items-center space-x-1.5 pr-2.5">
                <span className="bg-gray-100 dark:bg-slate-800 night:bg-night-surface px-1.5 py-0.5 rounded-full text-[10px] font-mono text-gray-500 font-bold shrink-0">
                  {count}
                </span>

                <button
                  onClick={() => onDeleteKeyword(rule.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700/50 night:hover:bg-night-highlight text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all rounded"
                  title="Remove Keyword category"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {keywords.length === 0 && (
        <div className="text-center py-4 text-[11px] text-gray-400 night:text-night-muted">
          No keyword headings configured. Click the "+" above to filter subjects or sender streams.
        </div>
      )}
    </div>
  );
};
