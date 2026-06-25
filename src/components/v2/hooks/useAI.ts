'use client';

import { useState, useCallback } from 'react';
import type { Email, AIAnalysis, SmartReplyOption, AIAssistantMessage } from '../types';

// Simulated AI delay for realistic UX
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const SMART_REPLY_TEMPLATES: Record<string, SmartReplyOption[]> = {
  interview: [
    {
      label: 'Confirm Attendance',
      tone: 'professional',
      content: `Thank you for the interview invitation. I am pleased to confirm my attendance for the scheduled interview. I look forward to speaking with the team and am excited about this opportunity.\n\nBest regards,\nDeven Goyal`,
    },
    {
      label: 'Request Reschedule',
      tone: 'formal',
      content: `Thank you for reaching out. I appreciate the interview opportunity. However, I have a prior commitment at the scheduled time. Could we explore alternative times? I am available on most days next week.\n\nBest regards,\nDeven Goyal`,
    },
  ],
  patent: [
    {
      label: 'Acknowledge Receipt',
      tone: 'formal',
      content: `Dear Patent Examiner,\n\nThank you for your communication. I acknowledge receipt of the correspondence and will respond within the statutory period.\n\nRespectfully,\nDeven Goyal`,
    },
  ],
  default: [
    {
      label: 'Quick Reply',
      tone: 'quick',
      content: `Thank you for your email. I will review this and get back to you shortly.\n\nBest,\nDeven`,
    },
    {
      label: 'Professional Reply',
      tone: 'professional',
      content: `Dear [Name],\n\nThank you for reaching out. I appreciate you taking the time to contact me. I will carefully review the details you've shared and respond with a comprehensive reply soon.\n\nBest regards,\nDeven Goyal`,
    },
    {
      label: 'Friendly Reply',
      tone: 'friendly',
      content: `Hey!\n\nThanks for the email! This looks great — let me look it over and I'll be in touch shortly.\n\nCheers,\nDeven`,
    },
  ],
};

function generateSmartReplies(email: Email): SmartReplyOption[] {
  const subject = email.subject.toLowerCase();
  if (subject.includes('interview')) return SMART_REPLY_TEMPLATES.interview;
  if (subject.includes('patent')) return SMART_REPLY_TEMPLATES.patent;
  return MOCK_REPLY_TEMPLATES[Math.floor(Math.random() * MOCK_REPLY_TEMPLATES.length)] 
    ?? SMART_REPLY_TEMPLATES.default;
}

const MOCK_REPLY_TEMPLATES = [SMART_REPLY_TEMPLATES.default];

function generateSummary(email: Email): string {
  if (email.aiAnalysis?.summary) return email.aiAnalysis.summary;
  const wordCount = email.body.split(' ').length;
  if (wordCount < 50) return email.preview;
  // Fallback: use first 2 sentences
  const sentences = email.body.split(/[.!?]+/).filter(s => s.trim().length > 10);
  return sentences.slice(0, 2).join('. ') + '.';
}

export function useAI() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [chatMessages, setChatMessages] = useState<AIAssistantMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: 'Hi! I\'m your Mail-IQ AI Assistant. I can help you summarize emails, find important deadlines, draft replies, or answer questions about your inbox. What would you like to know?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const analyzeEmail = useCallback(async (email: Email): Promise<AIAnalysis> => {
    setIsAnalyzing(true);
    try {
      await simulateDelay(1200 + Math.random() * 800);
      // Return existing analysis or generate a simple one
      if (email.aiAnalysis) return email.aiAnalysis;
      return {
        priority: 'medium',
        sentiment: 'neutral',
        summary: generateSummary(email),
        actionItems: email.extractedData?.actionItems ?? [],
        suggestedLabels: email.labels ?? [],
        confidence: 0.82,
        generatedAt: new Date().toISOString(),
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const summarizeEmail = useCallback(async (email: Email): Promise<string> => {
    setIsSummarizing(true);
    try {
      await simulateDelay(1000 + Math.random() * 600);
      return generateSummary(email);
    } finally {
      setIsSummarizing(false);
    }
  }, []);

  const generateReplies = useCallback(async (email: Email): Promise<SmartReplyOption[]> => {
    setIsGeneratingReplies(true);
    try {
      await simulateDelay(800 + Math.random() * 400);
      return generateSmartReplies(email);
    } finally {
      setIsGeneratingReplies(false);
    }
  }, []);

  const translateEmail = useCallback(async (email: Email, targetLanguage: string): Promise<string> => {
    setIsTranslating(true);
    try {
      await simulateDelay(1500);
      return `[Translated to ${targetLanguage}]\n\n${email.body}\n\n[Translation powered by Mail-IQ AI]`;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const sendChatMessage = useCallback(async (message: string, emails: Email[]) => {
    const userMsg: AIAssistantMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      await simulateDelay(1200 + Math.random() * 800);
      
      // Smart mock responses based on query
      let response = '';
      const q = message.toLowerCase();
      
      if (q.includes('summar') || q.includes('important')) {
        const highPriority = emails.filter(e => e.aiAnalysis?.priority === 'high' && e.folder === 'inbox');
        response = `Here are your ${highPriority.length} high-priority emails this week:\n\n${highPriority.map((e, i) => `${i + 1}. **${e.subject}** — ${e.aiAnalysis?.summary ?? e.preview}`).join('\n\n')}`;
      } else if (q.includes('deadline') || q.includes('due')) {
        const withDeadlines = emails.filter(e => e.extractedData?.deadlines?.length);
        response = `I found ${withDeadlines.length} emails with upcoming deadlines:\n\n${withDeadlines.map(e => e.extractedData!.deadlines!.map(d => `📅 **${d.label}**: ${d.date} — from "${e.subject}"`).join('\n')).join('\n')}`;
      } else if (q.includes('unread')) {
        const unread = emails.filter(e => !e.read && e.folder === 'inbox');
        response = `You have **${unread.length} unread emails**. The most important: ${unread.slice(0, 3).map(e => e.subject).join(', ')}.`;
      } else if (q.includes('interview')) {
        const interviews = emails.filter(e => e.subject.toLowerCase().includes('interview'));
        response = interviews.length > 0 
          ? `Found ${interviews.length} interview-related email(s):\n\n${interviews.map(e => `📧 **${e.subject}** — ${e.preview.slice(0, 100)}...`).join('\n\n')}`
          : 'No interview emails found in your inbox.';
      } else if (q.includes('patent')) {
        const patents = emails.filter(e => e.subject.toLowerCase().includes('patent') || e.labels?.includes('Patent'));
        response = patents.length > 0
          ? `Found ${patents.length} patent-related email(s):\n\n${patents.map(e => `📄 **${e.subject}** — ${e.preview.slice(0, 100)}...`).join('\n\n')}`
          : 'No patent emails found.';
      } else {
        response = `I've analyzed your inbox and found ${emails.filter(e => e.folder === 'inbox').length} emails. I can help you:\n\n• 📊 Summarize important emails\n• 📅 Find upcoming deadlines\n• 🔍 Search for specific topics\n• ✍️ Draft smart replies\n• 🏷️ Auto-label your emails\n\nWhat would you like me to help with?`;
      }
      
      const assistantMsg: AIAssistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsChatLoading(false);
    }
  }, []);

  return {
    isAnalyzing,
    isSummarizing,
    isGeneratingReplies,
    isTranslating,
    chatMessages,
    isChatLoading,
    analyzeEmail,
    summarizeEmail,
    generateReplies,
    translateEmail,
    sendChatMessage,
  };
}
