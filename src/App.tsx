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
      const headers = { 'Authorization': `Bearer ${token}` };

      const [emailsRes, keywordsRes, callsRes, secRes] = await Promise.all([
        fetch('/api/emails', { headers }),
        fetch('/api/keywords', { headers }),
        fetch('/api/alerts', { headers }),
        fetch('/api/security-logs', { headers })
      ]);

      const [emailsData, keywordsData, callsData, secData] = await Promise.all([
        emailsRes.json(),
        keywordsRes.json(),
        callsRes.json(),
        secRes.json()
      ]);

      setEmails(emailsData.emails || []);
      setKeywords(keywordsData.keywords || []);
      setVoiceCalls(callsData.voiceCalls || []);
      setSecurityLogs(secData.securityLogs || []);
    } catch (err) {
      console.error("Error synchronizing backend statistics", err);
    }
  };

  // Fetch current user session profile on start
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error("Session expired");
        }
        const data = await response.json();
        setUser(data.user);
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
      const response = await fetch('/api/auth/gmail/url', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      // Open popup with direct OAuth provider URL (mocked in server if not set up, live if client config is present)
      const oauthWindow = window.open(
        data.url,
        'gmail_oauth_popup',
        'width=600,height=700,status=no,toolbar=no,menubar=no'
      );
      if (!oauthWindow) {
        alert("Popups are blocked! Please enable popups in your browser to authorize Gmail.");
      }
    } catch (err) {
      console.error("Failed to fetch OAuth redirect URI", err);
    } finally {
      setIsConnectingGmail(false);
    }
  };

  // Trigger manual background scanner evaluation scan
  const handleTriggerScan = async () => {
    setIsScanning(true);
    setScanLog("Initializing Gemini 3.5 Flash deadline scanning daemon...");
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Scan failed');
      }

      setScanLog(data.message);
      fetchData(); // Refresh metrics

      // If a new email was received, auto-select it!
      if (data.newEmail) {
        setSelectedEmail(data.newEmail);
      }
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
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ label, keyword })
      });
      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to add keyword rule", err);
    } finally {
      setIsAddingKeyword(false);
    }
  };

  // Remove custom keyword labels
  const handleDeleteKeyword = async (id: string) => {
    try {
      const response = await fetch(`/api/keywords/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchData();
        // Clear selected filter if it was the deleted keyword
        const rule = keywords.find(k => k.id === id);
        if (rule && activeFilterKeyword === rule.keyword) {
          setActiveFilterKeyword(null);
        }
      }
    } catch (err) {
      console.error("Failed to remove keyword rule", err);
    }
  };

  // Trigger test voice alarm (API trigger, client triggers SpeechSynthesis fallback)
  const handleTriggerSimulatedCall = async (emailId: string, subject: string, senderEmail: string) => {
    setIsTriggeringCall(true);
    try {
      const response = await fetch('/api/alerts/voice', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ emailId, subject, sender_email: senderEmail })
      });
      const data = await response.json();
      if (!response.ok) {
        // Expose velocity rate limit error to user
        alert(data.message || data.error);
      }
      fetchData(); // Synchronize voice calls list
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
