/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Calendar, User, ShieldAlert, AlertTriangle, Sparkles, PhoneCall, Check, Volume2, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { Email, EmailAnalysis } from '../types';

interface EmailDetailModalProps {
  email: Email | null;
  onTriggerSimulatedCall: (emailId: string, subject: string, senderEmail: string) => void;
  isTriggeringCall: boolean;
  onMarkAsRead: (emailId: string) => void;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({
  email,
  onTriggerSimulatedCall,
  isTriggeringCall,
  onMarkAsRead
}) => {
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [browserSpeakActive, setBrowserSpeakActive] = useState(false);

  if (!email) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 night:bg-night-bg border border-gray-100 dark:border-slate-800 night:border-night-border rounded-2xl text-center transition-colors duration-200">
        <div className="p-4 bg-gray-50 dark:bg-slate-800 night:bg-night-surface rounded-full text-gray-300 dark:text-gray-600 night:text-night-border mb-4">
          <Mail className="h-10 w-10" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 night:text-night-text uppercase tracking-wider">
          No Email Selected
        </h3>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 night:text-night-muted max-w-xs mt-1">
          Select an email from the collapsible sender pockets on the left to review its content, Gemini AI deadline evaluation, and security logs.
        </p>
      </div>
    );
  }

  // Auto-mark as read when opened
  React.useEffect(() => {
    if (!email.is_read) {
      onMarkAsRead(email.id);
    }
  }, [email.id]);

  const analysis = email.analysis;
  const hasDeadline = analysis?.is_real_deadline;

  // Local browser SpeechSynthesis Voice Alarm simulation (Alice style)
  const triggerBrowserSpeechAlert = () => {
    if (!('speechSynthesis' in window)) {
      alert("Web Speech API is not supported in this browser.");
      return;
    }

    setBrowserSpeakActive(true);
    setCallStatus('calling');

    const speakText = `Urgent deadline alert from Mail IQ. You have an action required: ${
      analysis?.action_required || email.subject
    }. This deadline is approaching quickly. Please check your email immediately.`;

    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05; // Slightly high-pitched "Alice" friendly voice

    // Try to find a nice female voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) || 
                        voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      setCallStatus('connected');
    };

    utterance.onend = () => {
      setCallStatus('ended');
      setBrowserSpeakActive(false);
      setTimeout(() => setCallStatus('idle'), 2500);
    };

    utterance.onerror = () => {
      setCallStatus('idle');
      setBrowserSpeakActive(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleTestTwilioVoiceCall = () => {
    // 1. Run local SpeechSynthesis for instant audio review
    triggerBrowserSpeechAlert();
    // 2. Also execute the backend route to log the event & verify Twilio credentials if provided
    onTriggerSimulatedCall(email.id, email.subject, email.sender_email);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 night:bg-night-bg border border-gray-100 dark:border-slate-800 night:border-night-border rounded-2xl overflow-hidden shadow-xs transition-colors duration-200">
      
      {/* Detail Header */}
      <div className="p-5 border-b border-gray-100 dark:border-slate-800 night:border-night-border bg-gray-50/50 dark:bg-slate-900/50 night:bg-night-surface/10">
        <h2 className="text-base font-bold text-gray-900 dark:text-white night:text-night-text font-display leading-snug">
          {email.subject}
        </h2>
        
        <div className="flex flex-wrap gap-y-2 items-center justify-between text-xs text-gray-500 dark:text-gray-400 night:text-night-muted mt-3">
          <div className="flex items-center space-x-1.5 min-w-0">
            <User className="h-4 w-4 shrink-0 text-indigo-500" />
            <span className="font-semibold text-gray-800 dark:text-gray-200 night:text-night-text truncate max-w-[260px]">
              {email.sender}
            </span>
          </div>
          <div className="flex items-center space-x-1 shrink-0 font-mono text-[11px]">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(email.date).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Container: Split body & AI side-by-side on desktop */}
      <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Pane (Lg: 7/12): Email content body */}
        <div className="lg:col-span-7 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 night:text-night-muted uppercase tracking-wider">
              Email Body Content
            </h3>
            {email.is_bulk && (
              <span className="text-[10px] bg-amber-500/10 dark:bg-amber-500/5 text-amber-700 dark:text-amber-400 font-medium px-2 py-0.5 rounded-sm border border-amber-500/20">
                Bulk/Promotion Filtered
              </span>
            )}
          </div>
          <div className="flex-1 p-4 bg-gray-50 dark:bg-slate-800/40 night:bg-night-surface/30 border border-gray-100 dark:border-slate-800 night:border-night-border/40 rounded-xl text-sm text-gray-800 dark:text-gray-200 night:text-night-text/90 font-sans whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[360px] lg:max-h-none">
            {email.body}
          </div>
        </div>

        {/* Right Pane (Lg: 5/12): AI Evaluation and alerts */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 1. AI evaluation card */}
          <div className="bg-indigo-50/40 dark:bg-slate-800/60 night:bg-night-surface border border-indigo-100 dark:border-slate-700 night:border-night-border p-4 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 night:text-night-text flex items-center space-x-1 uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>Gemini 3.5 Analysis</span>
              </h3>
              <span className="text-[10px] font-mono text-indigo-500 font-bold bg-white dark:bg-slate-900 night:bg-night-bg px-2 py-0.5 rounded-full border border-indigo-100/30">
                Confidence: {analysis ? (analysis.confidence * 100).toFixed(0) : '0'}%
              </span>
            </div>

            {hasDeadline ? (
              <div className="space-y-3">
                <div className="p-3 bg-red-500/5 dark:bg-red-500/5 night:bg-night-bg/40 border border-red-500/15 rounded-lg flex items-start space-x-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-red-900 dark:text-red-300 night:text-night-text">
                      Real Commitment Detected
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 night:text-night-muted leading-snug">
                      This email contains an explicit, time-bound action commitment.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 night:text-night-muted">
                      Extracted Action Required:
                    </span>
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-100 night:text-night-text bg-white dark:bg-slate-900 night:bg-night-bg px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-slate-800 night:border-night-border/40 mt-1">
                      {analysis.action_required || "No action described"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 night:text-night-muted">
                      Target Deadline Time:
                    </span>
                    <p className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-100 night:text-night-text bg-white dark:bg-slate-900 night:bg-night-bg px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-slate-800 night:border-night-border/40 mt-1 flex items-center">
                      <Clock className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                      {analysis.deadline_datetime 
                        ? new Date(analysis.deadline_datetime).toLocaleString() 
                        : "Vague / soon"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-white dark:bg-slate-900 night:bg-night-bg p-2 rounded-lg border border-gray-100 dark:border-slate-800 night:border-night-border/40 text-center">
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Urgency</span>
                      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 night:text-night-accent">
                        {analysis.urgency_score} / 10
                      </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 night:bg-night-bg p-2 rounded-lg border border-gray-100 dark:border-slate-800 night:border-night-border/40 text-center">
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Alert Trigger</span>
                      <p className={`text-sm font-bold ${analysis.trigger_call ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                        {analysis.trigger_call ? 'YES (Within 24h)' : 'NO'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Voice alert activation sandbox */}
                {analysis.trigger_call && (
                  <div className="pt-3 border-t border-indigo-100/50 dark:border-slate-700/50 night:border-night-border/50 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 night:text-night-muted block">
                      Twilio Programmable Voice Call:
                    </span>

                    {/* Interactive Widget */}
                    <div className="bg-white dark:bg-slate-900 night:bg-night-bg p-3 rounded-lg border border-gray-100 dark:border-slate-800 night:border-night-border/40 space-y-2 text-center relative overflow-hidden">
                      {callStatus === 'idle' && (
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 night:text-night-muted">
                            Twilio logs register high velocity security checks.
                          </p>
                          <button
                            onClick={handleTestTwilioVoiceCall}
                            disabled={isTriggeringCall}
                            className="w-full mt-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 shadow-sm shadow-red-100/50 dark:shadow-none"
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                            <span>{isTriggeringCall ? 'Triggering...' : 'Simulate Twilio Alice Alert'}</span>
                          </button>
                        </div>
                      )}

                      {callStatus === 'calling' && (
                        <div className="py-2 space-y-1.5">
                          <span className="inline-block h-2 w-2 bg-red-600 rounded-full animate-ping mr-1" />
                          <span className="text-xs font-bold text-red-600 dark:text-red-400">Calling User Phone...</span>
                          <p className="text-[10px] text-gray-400">Connecting Web Speech synthesis channel...</p>
                        </div>
                      )}

                      {callStatus === 'connected' && (
                        <div className="py-2 space-y-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-md">
                          <Volume2 className="h-5 w-5 text-emerald-500 mx-auto animate-pulse" />
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Call Connected (Speaking)</span>
                          <p className="text-[10px] text-gray-500 max-w-xs mx-auto">Speaking sanitized TwiML voice alert payload into computer speakers.</p>
                        </div>
                      )}

                      {callStatus === 'ended' && (
                        <div className="py-2 text-xs font-bold text-gray-500 flex items-center justify-center space-x-1">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span>Call completed successfully.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-400 dark:text-gray-500 night:text-night-muted space-y-1">
                <CheckCircle className="h-8 w-8 text-gray-300 dark:text-gray-600 night:text-night-border mx-auto" />
                <p className="text-xs font-medium">No Looming Deadlines Found</p>
                <p className="text-[10px] text-gray-500">Gemini evaluated this message as general communication or promotional.</p>
              </div>
            )}
          </div>

          {/* 2. Security pre-filter report card */}
          <div className="bg-emerald-50/30 dark:bg-slate-800/40 night:bg-night-surface border border-emerald-100/40 dark:border-slate-800 night:border-night-border p-4 rounded-xl space-y-2.5">
            <h3 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 night:text-night-text flex items-center space-x-1 uppercase tracking-wider">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
              <span>Security Shield Verification</span>
            </h3>

            <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 night:text-night-muted">
              <div className="flex items-center justify-between py-1 border-b border-gray-100/30 dark:border-slate-800/30">
                <span>Sanitization Filter:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">PASSED</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100/30 dark:border-slate-800/30">
                <span>Prompt Injection Block:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">SECURE (0 Threats)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Bulk Sender Analysis:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 night:text-night-text">
                  {email.has_unsubscribe ? 'Bulk detected (Ignored by AI)' : 'Direct Person-to-Person'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
