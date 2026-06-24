/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, Lock, Sparkles, Trophy, Eye, ShieldAlert } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentCode, setSentCode] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter a valid phone number');
      return;
    }
    setError(null);
    setLoading(true);

    // Simulate OTP network latency
    setTimeout(() => {
      setStep('otp');
      setSentCode(true);
      setLoading(false);
    }, 1200);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // Mock OTP validation (bypass backend)
      const isDemo = verificationCode === "123456" || verificationCode === "999999" || verificationCode === "888888";
      
      if (!isDemo) {
        throw new Error('Invalid OTP verification code. Try 123456 as a demo.');
      }

      // Provide mock user data on success
      const mockUser = {
        id: "user-1",
        firebase_uid: "demo-uid-arclight",
        phone_number: phoneNumber,
        email: "team.arclight@cumail.in",
        created_at: new Date().toISOString()
      };
      
      // Mock token
      const mockToken = btoa(JSON.stringify({ id: mockUser.id, phone_number: mockUser.phone_number, email: mockUser.email }));
      
      onLoginSuccess(mockToken, mockUser);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 night:bg-night-bg p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 night:bg-night-surface rounded-2xl border border-gray-100 dark:border-slate-700 night:border-night-border shadow-lg overflow-hidden transition-all duration-300">
        <div className="p-8 text-center border-b border-gray-50 dark:border-slate-700 night:border-night-border bg-linear-to-b from-indigo-50/50 to-white dark:from-slate-800 dark:to-slate-800 night:from-night-surface night:to-night-surface">
          <div className="inline-flex items-center justify-center p-3.5 bg-indigo-600 dark:bg-indigo-500 night:bg-night-accent rounded-xl text-white shadow-md shadow-indigo-100 dark:shadow-none mb-4">
            <Mail className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white night:text-night-text tracking-tight">
            MAIL IQ
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 night:text-night-muted mt-1.5">
            AI-Powered Intelligent Email Triage & Deadline Alerts
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 night:bg-rose-950/20 text-rose-800 dark:text-rose-200 night:text-rose-300 text-xs rounded-xl flex items-start space-x-2 border border-rose-100 dark:border-rose-900/30">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 night:text-night-text uppercase tracking-wider mb-2">
                  Verify Phone via Firebase OTP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-9234"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900/50 night:bg-night-bg/50 border border-gray-200 dark:border-slate-700 night:border-night-border rounded-xl text-gray-900 dark:text-white night:text-night-text focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                    required
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                  Enter your phone number to receive a secure SMS OTP verification payload.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 night:bg-night-accent night:hover:bg-amber-700 text-white font-medium rounded-xl text-sm shadow-xs transition-colors focus:outline-none disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 height-4" />
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 night:text-night-text uppercase tracking-wider mb-2">
                  Enter 6-Digit Secure Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900/50 night:bg-night-bg/50 border border-gray-200 dark:border-slate-700 night:border-night-border rounded-xl text-gray-900 dark:text-white night:text-night-text focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm tracking-widest font-mono text-center transition-all"
                    required
                  />
                </div>
                
                <div className="mt-4 p-3 bg-amber-500/10 night:bg-night-highlight border border-amber-500/20 rounded-lg text-amber-800 dark:text-amber-200 night:text-night-text text-[11px] flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Sandbox Demo:</strong> Use code <code className="bg-amber-500/20 px-1 py-0.5 rounded font-bold font-mono">123456</code> to bypass and login immediately!
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-1/3 py-3 px-4 border border-gray-200 dark:border-slate-700 night:border-night-border text-gray-700 dark:text-gray-300 night:text-night-text text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 night:hover:bg-night-highlight focus:outline-none transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 night:bg-night-accent night:hover:bg-amber-700 text-white font-medium rounded-xl text-sm shadow-xs transition-colors focus:outline-none disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 height-4" />
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
