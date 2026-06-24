/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PhoneCall, Calendar, ShieldCheck, Clock, CheckCircle, Flame } from 'lucide-react';
import { VoiceCall } from '../types';

interface VoiceAlertsLogProps {
  voiceCalls: VoiceCall[];
}

export const VoiceAlertsLog: React.FC<VoiceAlertsLogProps> = ({ voiceCalls }) => {
  return (
    <div className="bg-white dark:bg-slate-900 night:bg-night-bg border border-gray-100 dark:border-slate-800 night:border-night-border rounded-2xl p-4 shadow-xs space-y-4 transition-colors duration-200">
      
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 night:text-night-text uppercase tracking-wider flex items-center space-x-1.5">
          <PhoneCall className="h-4 w-4 text-red-500" />
          <span>Twilio Alarm Logs</span>
        </h3>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 night:text-night-muted">
          Real-time record of triggered phone alarms for upcoming deadlines.
        </p>
      </div>

      {/* Safety description indicator */}
      <div className="p-3 bg-indigo-500/5 night:bg-night-surface border border-indigo-500/10 dark:border-slate-800 night:border-night-border rounded-xl space-y-1">
        <div className="flex items-center space-x-1 text-[11px] font-bold text-indigo-900 dark:text-indigo-300 night:text-night-text uppercase tracking-wider">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Velocity Safety Active</span>
        </div>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 night:text-night-muted leading-relaxed">
          Safety governor limits outbound calls to <strong>max 2 calls per sender per 24 hours</strong>. This prevents excessive API billing.
        </p>
      </div>

      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
        {voiceCalls.map((call) => {
          const isRateLimited = call.status === 'rate_limited';

          return (
            <div
              key={call.id}
              className={`p-3 rounded-xl border text-xs flex items-start space-x-3 transition-colors ${
                isRateLimited
                  ? 'bg-amber-500/5 dark:bg-amber-500/5 night:bg-night-highlight/40 border-amber-500/15'
                  : 'bg-gray-50/50 dark:bg-slate-800/50 night:bg-night-surface/10 border-gray-100 dark:border-slate-800 night:border-night-border/40'
              }`}
            >
              <div className={`p-2 rounded-lg ${isRateLimited ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
                <PhoneCall className="h-3.5 w-3.5" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-semibold text-gray-800 dark:text-gray-200 night:text-night-text truncate">
                  {call.subject}
                </p>
                
                <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500 night:text-night-muted">
                  <span className="font-mono truncate max-w-[120px]">
                    {isRateLimited ? '⚠️ Rate Blocked' : `SID: ${call.twilio_call_sid || 'CA_SIMULATED'}`}
                  </span>
                  <span className="flex items-center shrink-0">
                    <Clock className="h-3 w-3 mr-0.5" />
                    {new Date(call.called_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {isRateLimited && (
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 night:text-night-accent flex items-center pt-0.5">
                    <Flame className="h-3 w-3 mr-0.5" /> Velocity check prevented phone alarm.
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {voiceCalls.length === 0 && (
          <div className="text-center py-6 text-gray-400 dark:text-gray-500 night:text-night-muted text-[11px]">
            No voice alarms triggered yet. Click "Simulate Twilio Alice Alert" inside any deadline email to trigger!
          </div>
        )}
      </div>
    </div>
  );
};
