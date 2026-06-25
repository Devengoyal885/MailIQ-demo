// Mail-IQ 2.0 — Complete Type Definitions

export type EmailFolder = 'inbox' | 'sent' | 'archive' | 'trash' | 'starred' | 'drafts';
export type EmailPriority = 'high' | 'medium' | 'low';
export type EmailSentiment = 'positive' | 'neutral' | 'negative' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type ThemeMode = 'dark' | 'light' | 'system';
export type AIModel = 'gemini' | 'gpt-4' | 'gpt-3.5';
export type SummaryLength = 'short' | 'medium' | 'detailed';
export type NotificationCategory = 'email' | 'deadline' | 'ai' | 'system';

export interface EmailLabel {
  id: string;
  name: string;
  color: string;
  count?: number;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: number; // bytes
  type: string;
  url?: string;
}

export interface ExtractedData {
  patentTitle?: string;
  submissionId?: string;
  inventorName?: string;
  otp?: string;
  dates?: string[];
  deadlines?: { label: string; date: string }[];
  keywords?: string[];
  links?: { label: string; url: string }[];
  meetingDetails?: { title: string; date: string; time?: string; location?: string };
  actionItems?: string[];
  summary?: string;
}

export interface AIAnalysis {
  priority: EmailPriority;
  sentiment: EmailSentiment;
  summary?: string;
  actionItems?: string[];
  suggestedLabels?: string[];
  confidence: number;
  generatedAt?: string;
}

export interface Email {
  id: string;
  folder: EmailFolder;
  subject: string;
  sender: string;
  senderEmail: string;
  recipient?: string;
  recipientEmail?: string;
  preview: string;
  body: string;
  bodyHtml?: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  labels?: string[];
  attachments?: EmailAttachment[];
  extractedData?: ExtractedData;
  aiAnalysis?: AIAnalysis;
  threadId?: string;
  messageId?: string;
  replyTo?: string;
  category?: 'primary' | 'social' | 'promotions' | 'updates' | 'forums';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  emailId?: string;
  emailSubject?: string;
  labels?: string[];
  assignee?: string;
}

export interface MailNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  read: boolean;
  timestamp: string;
  emailId?: string;
  actionUrl?: string;
}

export interface MailSettings {
  theme: ThemeMode;
  fontSize: 'sm' | 'base' | 'lg';
  aiModel: AIModel;
  summaryLength: SummaryLength;
  autoSummarize: boolean;
  autoExtract: boolean;
  emailAlerts: boolean;
  deadlineAlerts: boolean;
  showPreview: boolean;
  compactMode: boolean;
  defaultFolder: EmailFolder;
}

export interface AnalyticsData {
  totalEmails: number;
  unreadEmails: number;
  priorityEmails: number;
  upcomingDeadlines: number;
  aiActionsToday: number;
  productivityScore: number;
  weeklyActivity: { day: string; received: number; sent: number; processed: number }[];
  categoryBreakdown: { name: string; value: number; color: string }[];
  priorityBreakdown: { name: string; value: number; color: string }[];
  sentimentBreakdown: { name: string; value: number; color: string }[];
}

export interface GmailConnectionStatus {
  connected: boolean;
  email?: string;
  name?: string;
  avatar?: string;
  lastSync?: string;
  totalMessages?: number;
}

export interface SmartReplyOption {
  label: string;
  tone: 'professional' | 'friendly' | 'formal' | 'quick';
  content: string;
}

export interface AIAssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SearchFilters {
  query: string;
  sender?: string;
  subject?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: Email['category'];
  priority?: EmailPriority;
  hasAttachments?: boolean;
  labels?: string[];
  isUnread?: boolean;
  isStarred?: boolean;
}

export type MailIQView = 
  | 'inbox' 
  | 'dashboard' 
  | 'tasks' 
  | 'search' 
  | 'settings' 
  | 'notifications'
  | 'compose'
  | 'assistant';
