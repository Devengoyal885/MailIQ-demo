/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ThemeType = 'light' | 'dark' | 'night';

export interface User {
  id: string;
  firebase_uid: string;
  phone_number: string;
  email?: string;
  gmail_access_token?: string;
  gmail_refresh_token?: string;
  gmail_token_expiry?: string;
  gmail_history_id?: string;
  last_scanned_at?: string;
  created_at: string;
}

export interface Email {
  id: string;
  gmail_id: string;
  subject: string;
  sender: string;
  sender_email: string;
  body: string;
  date: string;
  snippet: string;
  is_read: boolean;
  has_unsubscribe: boolean;
  is_bulk: boolean;
  analysis?: EmailAnalysis;
}

export interface EmailAnalysis {
  id: string;
  email_id: string;
  is_real_deadline: boolean;
  action_required: string | null;
  deadline_datetime: string | null;
  trigger_call: boolean;
  urgency_score: number; // 1 to 10
  confidence: number; // 0.0 to 1.0
  processed_at: string;
}

export interface KeywordRule {
  id: string;
  label: string;
  keyword: string;
  created_at: string;
}

export interface VoiceCall {
  id: string;
  email_id: string;
  subject: string;
  twilio_call_sid?: string;
  status: string;
  called_at: string;
}

export interface SecurityLog {
  id: string;
  email_id: string;
  subject: string;
  reason: string;
  logged_at: string;
}

export interface DashboardStats {
  totalEmails: number;
  activeDeadlines: number;
  totalPockets: number;
  securityIncidents: number;
}
