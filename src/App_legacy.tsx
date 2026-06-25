/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { PocketsView } from './components/PocketsView';
import { EmailDetailModal } from './components/EmailDetailModal';
import { KeywordsPanel } from './components/KeywordsPanel';
import { VoiceAlertsLog } from './components/VoiceAlertsLog';
import { AuthScreen } from './components/AuthScreen';
import { Email, KeywordRule, VoiceCall, SecurityLog, DashboardStats } from './types';
import { Trophy, Mail, ShieldAlert, Sparkles, PhoneCall } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mailiq-token'));
  const [user, setUser] = useState<any | null>(null);
  
  const [emails, setEmails] = useState<Email[]>([]);
  const [keywords, setKeywords] = useState<KeywordRule[]>([]);
  const [voiceCalls, setVoiceCalls] = useState<VoiceCall[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);

  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeFilterKeyword, setActiveFilterKeyword] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [isAddingKeyword, setIsAddingKeyword] = useState(false);
  const [isTriggeringCall, setIsTriggeringCall] = useState(false);
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);
  const [scanLog, setScanLog] = useState<string | null>(null);

  // Parse headers and tokens on login
  const handleLoginSuccess = (newToken: string, loggedUser: any) => {
    localStorage.setItem('mailiq-token', newToken);
    setToken(newToken);
    setUser(loggedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('mailiq-token');
    setToken(null);
    setUser(null);
    setEmails([]);
    setKeywords([]);
    setVoiceCalls([]);
    setSecurityLogs([]);
    setSelectedEmail(null);
    setActiveFilterKeyword(null);
  };

  // Fetch application state
  const fetchData = async () => {
    if (!token) return;
    try {
      // Mocked Backend: Import mock data dynamically or statically
      const { initialSeedData } = await import('./mockData');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setEmails(initialSeedData.emails || []);
      setKeywords(initialSeedData.keywords || []);
      setVoiceCalls(initialSeedData.voiceCalls || []);
      setSecurityLogs(initialSeedData.securityLogs || []);
    } catch (err) {
      console.error("Error synchronizing backend statistics", err);
    }
  };

  // Fetch current user session profile on start
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        // Mock profile fetch by decoding the token
        const decoded = JSON.parse(atob(token));
        setUser(decoded);
        fetchData();
      } catch (err) {
        handleLogout();
      }
    };
    fetchProfile();
  }, [token]);

  // Listener for successful Gmail OAuth Connection popup triggers
  useEffect(() => {
    const handleOauthMessage = (event: MessageEvent) => {
      // Basic security check
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchData();
        if (user) {
          setUser((prev: any) => ({
            ...prev,
            email: event.data.email || 'arclight-sandbox@gmail.com'
          }));
        }
      }
    };
    window.addEventListener('message', handleOauthMessage);
    return () => window.removeEventListener('message', handleOauthMessage);
  }, [user]);

  // Handle Connecting Gmail account OAuth trigger
  const handleConnectGmail = async () => {
    setIsConnectingGmail(true);
    try {
      // Mock OAuth Flow delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // We can just simulate the OAuth success directly without opening a popup
      // since this is a frontend-only mock demo.
      if (user) {
        setUser((prev: any) => ({
          ...prev,
          email: 'arclight-sandbox@gmail.com'
        }));
      }
      
      // Dispatch the event that the useEffect is listening to
      window.postMessage({ type: 'OAUTH_AUTH_SUCCESS', email: 'arclight-sandbox@gmail.com' }, '*');
      
    } catch (err) {
      console.error("Failed to mock OAuth redirect URI", err);
    } finally {
      setIsConnectingGmail(false);
    }
  };

  // Trigger manual background scanner evaluation scan
  const handleTriggerScan = async () => {
    setIsScanning(true);
    setScanLog("Initializing Gemini 3.5 Flash deadline scanning daemon...");
    try {
      // Mock scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setScanLog("Scan completed successfully. No new actionable emails found.");
      fetchData(); // Refresh metrics
    } catch (err: any) {
      setScanLog("Scan completed with warning. " + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  // Add custom keyword labels
  const handleAddKeyword = async (label: string, keyword: string) => {
    setIsAddingKeyword(true);
    try {
      // Mock keyword addition
      const newKeyword = {
        id: `kw-${Date.now()}`,
        label,
        keyword,
        created_at: new Date().toISOString()
      };
      setKeywords([...keywords, newKeyword]);
    } catch (err) {
      console.error("Failed to add keyword rule", err);
    } finally {
      setIsAddingKeyword(false);
    }
  };

  // Remove custom keyword labels
  const handleDeleteKeyword = async (id: string) => {
    try {
      // Mock keyword deletion
      setKeywords(keywords.filter(kw => kw.id !== id));
      // Clear selected filter if it was the deleted keyword
      const rule = keywords.find(k => k.id === id);
      if (rule && activeFilterKeyword === rule.keyword) {
        setActiveFilterKeyword(null);
      }
    } catch (err) {
      console.error("Failed to delete keyword", err);
    }
  };

  // Trigger test voice alarm (API trigger, client triggers SpeechSynthesis fallback)
  const handleTriggerSimulatedCall = async (emailId: string, subject: string, senderEmail: string) => {
    setIsTriggeringCall(true);
    try {
      // Mock API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newCall = {
        id: `vc-${Date.now()}`,
        email_id: emailId,
        subject,
        twilio_call_sid: `mock-${Date.now()}`,
        status: "completed",
        called_at: new Date().toISOString()
      };
      setVoiceCalls(prev => [newCall, ...prev]);
      
      alert(`Simulated voice call queued successfully for: ${senderEmail}`);
    } catch (err: any) {
      console.error("Twilio request failed", err);
    } finally {
      setIsTriggeringCall(false);
    }
  };

  // Mark single email as read
  const handleMarkAsRead = (emailId: string) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, is_read: true } : e));
  };

  // Mark all emails in a pocket as read
  const handleMarkPocketAsRead = (senderEmail: string) => {
    setEmails(prev => prev.map(e => e.sender_email.toLowerCase() === senderEmail.toLowerCase() ? { ...e, is_read: true } : e));
  };

  // Dynamic Metrics calculations
  const stats = useMemo<DashboardStats>(() => {
    const totalEmails = emails.length;
    const activeDeadlines = emails.filter(e => e.analysis?.is_real_deadline).length;
    const uniqueSenders = new Set(emails.map(e => e.sender_email.toLowerCase())).size;
    const securityIncidents = securityLogs.length;

    return {
      totalEmails,
      activeDeadlines,
      totalPockets: uniqueSenders,
      securityIncidents
    };
  }, [emails, securityLogs]);

  if (!token || !user) {
    return (
      <ThemeProvider>
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-gray-900 dark:bg-slate-950 dark:text-gray-100 night:bg-night-bg night:text-night-text font-sans selection:bg-indigo-500/30 selection:text-indigo-900 transition-colors duration-200">
        
        {/* Navbar */}
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          gmailAccount={user.email || null}
          onConnectGmail={handleConnectGmail}
          isConnectingGmail={isConnectingGmail}
        />

        {/* Content Layout Grid */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Lg: 4/12) -> Pockets View + Keyword filter list */}
          <section className="lg:col-span-4 space-y-6 flex flex-col lg:sticky lg:top-22 lg:max-h-[calc(100vh-120px)]">
            <div className="flex-1 min-h-[350px] lg:min-h-0 lg:max-h-[480px]">
              <PocketsView 
                emails={emails}
                selectedEmail={selectedEmail}
                onSelectEmail={(email) => setSelectedEmail(email)}
                activeFilterKeyword={activeFilterKeyword}
                onClearFilter={() => setActiveFilterKeyword(null)}
                onMarkPocketAsRead={handleMarkPocketAsRead}
              />
            </div>

            <KeywordsPanel 
              keywords={keywords}
              emails={emails}
              activeFilterKeyword={activeFilterKeyword}
              onSelectFilterKeyword={(kw) => setActiveFilterKeyword(kw)}
              onAddKeyword={handleAddKeyword}
              onDeleteKeyword={handleDeleteKeyword}
              isAdding={isAddingKeyword}
            />
          </section>

          {/* Right Column (Lg: 8/12) -> Dashboard stats + Selected Email analysis panel + Logs */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* Email Detail Panel */}
            <EmailDetailModal 
              email={selectedEmail}
              onTriggerSimulatedCall={handleTriggerSimulatedCall}
              isTriggeringCall={isTriggeringCall}
              onMarkAsRead={handleMarkAsRead}
            />

            {/* Central SaaS Analytics Grid & Control Panel */}
            <Dashboard 
              stats={stats}
              securityLogs={securityLogs}
              onTriggerScan={handleTriggerScan}
              isScanning={isScanning}
              scanLog={scanLog}
            />

            {/* Twilio Call feeds log list */}
            <VoiceAlertsLog voiceCalls={voiceCalls} />

          </section>

        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-gray-100 dark:border-slate-800 night:border-night-border text-center text-xs text-gray-400 dark:text-gray-500 night:text-night-muted transition-colors">
          <p>© 2026 Mail IQ. All rights reserved.</p>
        </footer>

      </div>
    </ThemeProvider>
  );
}
