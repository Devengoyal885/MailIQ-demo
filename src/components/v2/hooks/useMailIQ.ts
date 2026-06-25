'use client';

import { useState, useCallback, useMemo } from 'react';
import type {
  Email, Task, MailNotification, MailSettings, EmailLabel,
  EmailFolder, TaskStatus, MailIQView, SearchFilters, ThemeMode,
} from '../types';
import { MOCK_EMAILS, MOCK_TASKS, MOCK_NOTIFICATIONS, MOCK_LABELS } from '../data/mockData';

const DEFAULT_SETTINGS: MailSettings = {
  theme: 'dark',
  fontSize: 'base',
  aiModel: 'gemini',
  summaryLength: 'medium',
  autoSummarize: true,
  autoExtract: true,
  emailAlerts: true,
  deadlineAlerts: true,
  showPreview: true,
  compactMode: false,
  defaultFolder: 'inbox',
};

export function useMailIQ() {
  // Core data state
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [notifications, setNotifications] = useState<MailNotification[]>(MOCK_NOTIFICATIONS);
  const [labels, setLabels] = useState<EmailLabel[]>(MOCK_LABELS);
  const [settings, setSettings] = useState<MailSettings>(DEFAULT_SETTINGS);

  // UI state
  const [currentView, setCurrentView] = useState<MailIQView>('inbox');
  const [activeFolder, setActiveFolder] = useState<EmailFolder>('inbox');
  const [activeEmailId, setActiveEmailId] = useState<string | null>(emails[0]?.id ?? null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ query: '' });
  const [showMobileList, setShowMobileList] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [replyToEmail, setReplyToEmail] = useState<Email | null>(null);
  const [gmailConnected, setGmailConnected] = useState(false);

  // Derived data
  const activeEmail = useMemo(
    () => emails.find(e => e.id === activeEmailId) ?? null,
    [emails, activeEmailId]
  );

  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      if (currentView === 'inbox' && email.folder !== activeFolder) return false;
      const q = searchFilters.query.toLowerCase();
      if (q && !email.subject.toLowerCase().includes(q) && !email.sender.toLowerCase().includes(q) && !email.body.toLowerCase().includes(q)) return false;
      if (searchFilters.sender && !email.senderEmail.toLowerCase().includes(searchFilters.sender.toLowerCase())) return false;
      if (searchFilters.priority && email.aiAnalysis?.priority !== searchFilters.priority) return false;
      if (searchFilters.hasAttachments && !email.attachments?.length) return false;
      if (searchFilters.isUnread === true && email.read) return false;
      if (searchFilters.isStarred === true && !email.starred) return false;
      if (searchFilters.labels?.length && !searchFilters.labels.some(l => email.labels?.includes(l))) return false;
      return true;
    });
  }, [emails, activeFolder, currentView, searchFilters]);

  const unreadCount = useMemo(() => emails.filter(e => e.folder === 'inbox' && !e.read).length, [emails]);
  const notificationCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const tasksByStatus = useMemo(() => ({
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  }), [tasks]);

  // Email actions
  const openEmail = useCallback((email: Email) => {
    setActiveEmailId(email.id);
    setShowMobileList(false);
    if (!email.read) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
    }
  }, []);

  const updateEmail = useCallback((updated: Email) => {
    setEmails(prev => prev.map(e => e.id === updated.id ? updated : e));
  }, []);

  const deleteEmail = useCallback((emailId: string) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, folder: 'trash' as EmailFolder } : e));
    if (activeEmailId === emailId) setActiveEmailId(null);
  }, [activeEmailId]);

  const archiveEmail = useCallback((emailId: string) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, folder: 'archive' as EmailFolder } : e));
    if (activeEmailId === emailId) setActiveEmailId(null);
  }, [activeEmailId]);

  const starEmail = useCallback((emailId: string) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, starred: !e.starred } : e));
  }, []);

  const markRead = useCallback((emailId: string, read: boolean) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, read } : e));
  }, []);

  const sendEmail = useCallback((draft: Partial<Email>) => {
    const sent: Email = {
      id: crypto.randomUUID(),
      folder: 'sent',
      subject: draft.subject ?? '(no subject)',
      sender: 'Deven Goyal',
      senderEmail: 'deven@mailiq.dev',
      recipient: draft.recipient,
      recipientEmail: draft.recipientEmail,
      preview: (draft.body ?? '').slice(0, 100),
      body: draft.body ?? '',
      timestamp: new Date().toISOString(),
      read: true,
      starred: false,
      category: 'primary',
    };
    setEmails(prev => [sent, ...prev]);
    setShowCompose(false);
    setReplyToEmail(null);
  }, []);

  // Task actions
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
  }, []);

  const moveTask = useCallback((taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const createTaskFromEmail = useCallback((email: Email) => {
    const actionItems = email.extractedData?.actionItems ?? [email.subject];
    actionItems.forEach((item, idx) => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: item,
        description: `Extracted from: ${email.subject}`,
        status: 'todo',
        priority: email.aiAnalysis?.priority ?? 'medium',
        dueDate: email.extractedData?.deadlines?.[idx]?.date,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailId: email.id,
        emailSubject: email.subject,
        labels: email.labels,
      };
      setTasks(prev => [newTask, ...prev]);
    });
  }, []);

  // Notification actions
  const markNotificationRead = useCallback((notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Settings actions
  const updateSettings = useCallback((updates: Partial<MailSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const updateTheme = useCallback((theme: ThemeMode) => {
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  // Label actions
  const addLabel = useCallback((label: Omit<EmailLabel, 'id'>) => {
    const newLabel: EmailLabel = { ...label, id: crypto.randomUUID() };
    setLabels(prev => [...prev, newLabel]);
  }, []);

  const applyLabelToEmail = useCallback((emailId: string, labelName: string) => {
    setEmails(prev => prev.map(e => {
      if (e.id !== emailId) return e;
      const existing = e.labels ?? [];
      if (existing.includes(labelName)) return { ...e, labels: existing.filter(l => l !== labelName) };
      return { ...e, labels: [...existing, labelName] };
    }));
  }, []);

  return {
    // Data
    emails,
    filteredEmails,
    tasks,
    tasksByStatus,
    notifications,
    labels,
    settings,
    activeEmail,
    // Counts
    unreadCount,
    notificationCount,
    // UI State
    currentView,
    setCurrentView,
    activeFolder,
    setActiveFolder,
    activeEmailId,
    setActiveEmailId,
    searchFilters,
    setSearchFilters,
    showMobileList,
    setShowMobileList,
    showCompose,
    setShowCompose,
    replyToEmail,
    setReplyToEmail,
    gmailConnected,
    setGmailConnected,
    // Email actions
    openEmail,
    updateEmail,
    deleteEmail,
    archiveEmail,
    starEmail,
    markRead,
    sendEmail,
    // Task actions
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    createTaskFromEmail,
    // Notification actions
    markNotificationRead,
    markAllNotificationsRead,
    // Settings actions
    updateSettings,
    updateTheme,
    // Label actions
    addLabel,
    applyLabelToEmail,
  };
}

export type MailIQState = ReturnType<typeof useMailIQ>;
