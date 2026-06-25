import type { Email, Task, MailNotification, AnalyticsData, EmailLabel } from '../types';

export const MOCK_LABELS: EmailLabel[] = [
  { id: 'l1', name: 'Urgent', color: '#ef4444', count: 3 },
  { id: 'l2', name: 'Patent', color: '#6366f1', count: 7 },
  { id: 'l3', name: 'Meeting', color: '#10b981', count: 4 },
  { id: 'l4', name: 'Invoice', color: '#f59e0b', count: 2 },
  { id: 'l5', name: 'Research', color: '#8b5cf6', count: 5 },
  { id: 'l6', name: 'Interview', color: '#06b6d4', count: 2 },
];

export const MOCK_EMAILS: Email[] = [
  {
    id: 'e1',
    folder: 'inbox',
    subject: 'Patent Application Approved — US2024/089432',
    sender: 'USPTO Office',
    senderEmail: 'notifications@uspto.gov',
    preview: 'We are pleased to inform you that your patent application has been approved for examination...',
    body: `Dear Deven Goyal,

We are pleased to inform you that your patent application has been approved for examination review.

Application Number: US2024/089432
Title: AI-Powered Email Intelligence System with Dynamic Deadline Detection
Filing Date: March 15, 2024
Examiner: Dr. Sarah Mitchell

Your application has been assigned to Art Unit 2168 for examination. The estimated first office action date is September 2024.

Next Steps:
1. Review the official filing receipt attached to this email
2. Ensure all claims are properly formatted per USPTO guidelines
3. Respond to any office actions within the 3-month window

You can track the status of your application at patents.google.com using your application number.

Important Deadline: Response to first office action due by October 15, 2024.

For any inquiries, please contact the USPTO Customer Service Center at 1-800-786-9199.

Best regards,
USPTO Office of Patent Application Processing`,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    read: false,
    starred: true,
    labels: ['Patent', 'Urgent'],
    category: 'primary',
    extractedData: {
      patentTitle: 'AI-Powered Email Intelligence System with Dynamic Deadline Detection',
      submissionId: 'US2024/089432',
      inventorName: 'Deven Goyal',
      dates: ['March 15, 2024', 'September 2024', 'October 15, 2024'],
      deadlines: [{ label: 'Office Action Response', date: 'October 15, 2024' }],
      keywords: ['Patent', 'USPTO', 'AI', 'Email Intelligence', 'Examination'],
      links: [
        { label: 'Track Application', url: 'https://patents.google.com' },
        { label: 'USPTO Portal', url: 'https://patentcenter.uspto.gov' },
      ],
      actionItems: [
        'Review official filing receipt',
        'Format claims per USPTO guidelines',
        'Prepare response to office actions',
      ],
    },
    aiAnalysis: {
      priority: 'high',
      sentiment: 'positive',
      summary: 'Your patent application US2024/089432 for AI-powered email intelligence has been approved for examination. Key deadline: October 15, 2024 for office action response.',
      actionItems: ['Review filing receipt', 'Format claims', 'Monitor first office action'],
      suggestedLabels: ['Patent', 'Urgent', 'Legal'],
      confidence: 0.97,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'e2',
    folder: 'inbox',
    subject: 'Interview Confirmation — Senior SWE at Google DeepMind',
    sender: 'Google Recruiting',
    senderEmail: 'recruiting@google.com',
    preview: 'Congratulations! We would like to invite you for a technical interview for the Senior Software Engineer position...',
    body: `Hi Deven,

Congratulations! We're excited to move you forward in our hiring process for the Senior Software Engineer, AI Infrastructure role at Google DeepMind.

Interview Details:
- Date: July 10, 2024
- Time: 10:00 AM - 2:00 PM PST
- Format: Virtual (Google Meet)
- Duration: 4 rounds × 45 minutes each

Round Structure:
1. Data Structures & Algorithms
2. System Design (Distributed Systems)
3. Machine Learning Fundamentals
4. Behavioral / Leadership

Your interviewer panel includes engineers from the DeepMind Infrastructure team. Please come prepared with examples of large-scale system design and ML pipeline optimization.

Meeting Link: meet.google.com/xyz-abc-def
Confirmation Code: GDM-2024-SW-8834

Please confirm your availability by July 5, 2024.

Next Steps:
- Reply to confirm attendance
- Review our engineering blog at research.google
- Prepare system design examples

Best,
Google Technical Recruiting`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
    starred: true,
    labels: ['Interview', 'Urgent'],
    category: 'primary',
    extractedData: {
      dates: ['July 10, 2024', 'July 5, 2024'],
      deadlines: [{ label: 'Confirm Attendance', date: 'July 5, 2024' }],
      keywords: ['Interview', 'Google', 'DeepMind', 'Senior SWE', 'AI Infrastructure'],
      links: [
        { label: 'Join Meeting', url: 'https://meet.google.com/xyz-abc-def' },
        { label: 'Research Blog', url: 'https://research.google' },
      ],
      meetingDetails: {
        title: 'Google DeepMind Technical Interview',
        date: 'July 10, 2024',
        time: '10:00 AM PST',
        location: 'Google Meet (Virtual)',
      },
      actionItems: [
        'Confirm attendance by July 5',
        'Review DS&A concepts',
        'Prepare system design examples',
        'Review ML fundamentals',
      ],
    },
    aiAnalysis: {
      priority: 'high',
      sentiment: 'positive',
      summary: 'Google DeepMind interview scheduled July 10, 2024. 4 rounds covering algorithms, system design, ML, and behavioral. Confirm by July 5.',
      actionItems: ['Confirm attendance', 'Prepare DS&A', 'System design prep', 'ML review'],
      suggestedLabels: ['Interview', 'Urgent', 'Career'],
      confidence: 0.99,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'e3',
    folder: 'inbox',
    subject: 'Research Paper Review — ICML 2024 Submission',
    sender: 'ICML Program Committee',
    senderEmail: 'reviews@icml2024.org',
    preview: 'Your paper "Temporal Attention Mechanisms in Large Language Models" has received its peer reviews...',
    body: `Dear Author,

We are writing to inform you that the peer reviews for your ICML 2024 submission are now available.

Paper ID: ICML24-7832
Title: Temporal Attention Mechanisms in Large Language Models: A Scalable Approach
Status: Under Revision (Borderline Accept)

Review Summary:
- Reviewer 1: 6/10 — Strong technical contribution, requires minor experiments
- Reviewer 2: 7/10 — Novel approach, well-written
- Reviewer 3: 5/10 — Needs more ablation studies

Key Feedback:
1. Add comparison with BERT-based temporal models
2. Include computational complexity analysis
3. Expand related work section on attention mechanisms
4. Address efficiency concerns for >100B parameter models

Important Deadlines:
- Author Rebuttal Period: June 30 - July 7, 2024
- Final Decision: July 20, 2024
- Camera Ready Deadline: August 1, 2024

Access your reviews at: openreview.net/forum?id=icml24-7832

We encourage all authors to address reviewer concerns in the rebuttal period.

Best regards,
ICML 2024 Program Committee`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: false,
    starred: false,
    labels: ['Research'],
    category: 'primary',
    extractedData: {
      submissionId: 'ICML24-7832',
      dates: ['June 30, 2024', 'July 7, 2024', 'July 20, 2024', 'August 1, 2024'],
      deadlines: [
        { label: 'Author Rebuttal', date: 'July 7, 2024' },
        { label: 'Camera Ready', date: 'August 1, 2024' },
      ],
      keywords: ['ICML', 'Research', 'LLM', 'Attention', 'Peer Review'],
      links: [{ label: 'View Reviews', url: 'https://openreview.net' }],
      actionItems: [
        'Write author rebuttal by July 7',
        'Add BERT comparison experiments',
        'Include complexity analysis',
        'Expand related work section',
      ],
    },
    aiAnalysis: {
      priority: 'high',
      sentiment: 'neutral',
      summary: 'ICML 2024 paper borderline accepted. Three reviewers with mixed scores. Must submit rebuttal by July 7 addressing ablation studies and efficiency concerns.',
      actionItems: ['Write rebuttal', 'Run additional experiments', 'Update related work'],
      suggestedLabels: ['Research', 'Academic', 'Deadline'],
      confidence: 0.94,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'e4',
    folder: 'inbox',
    subject: 'OTP Verification Code — 847291',
    sender: 'Security Team',
    senderEmail: 'security@accounts.google.com',
    preview: 'Your verification code is 847291. This code expires in 10 minutes...',
    body: `Your Google verification code is:

847291

This code expires in 10 minutes. Do not share this code with anyone.

If you didn't request this code, your account may be at risk. Visit g.co/account for help.

Google Security Team`,
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    read: true,
    starred: false,
    labels: [],
    category: 'updates',
    extractedData: {
      otp: '847291',
      keywords: ['OTP', 'Security', 'Verification'],
    },
    aiAnalysis: {
      priority: 'medium',
      sentiment: 'neutral',
      summary: 'Google verification OTP: 847291. Expires in 10 minutes.',
      confidence: 0.99,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'e5',
    folder: 'inbox',
    subject: 'GitHub Actions CI Build Failed — Mail-IQ/main',
    sender: 'GitHub',
    senderEmail: 'noreply@github.com',
    preview: 'The workflow "CI/CD Pipeline" on branch main has failed. 3 tests failing...',
    body: `The workflow run "CI/CD Pipeline" triggered by push to main has failed.

Repository: Devengoyal885/Mail-IQ
Branch: main
Commit: a3f8d92 — "feat: add AI summarization endpoint"
Status: ❌ FAILED

Failed Jobs:
1. test (ubuntu-latest) — 3 tests failing
   - EmailProcessor.test.ts: TypeError: Cannot read property 'analyze' of undefined
   - AIService.test.ts: API timeout after 5000ms
   - Integration.test.ts: Database connection refused

View full logs: github.com/Devengoyal885/Mail-IQ/actions/runs/9284756

To fix: Check environment variables and ensure TEST_DATABASE_URL is set.

GitHub Actions`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: true,
    starred: false,
    labels: [],
    category: 'updates',
    extractedData: {
      keywords: ['GitHub', 'CI/CD', 'Build Failed', 'Tests'],
      links: [{ label: 'View Logs', url: 'https://github.com/Devengoyal885/Mail-IQ/actions' }],
      actionItems: ['Fix TypeErrors in tests', 'Set TEST_DATABASE_URL env var', 'Fix API timeout'],
    },
    aiAnalysis: {
      priority: 'high',
      sentiment: 'negative',
      summary: 'CI build failed on main branch with 3 test failures: TypeError, API timeout, and DB connection issue.',
      actionItems: ['Fix EmailProcessor test', 'Set env vars', 'Debug DB connection'],
      suggestedLabels: ['Dev', 'Bug', 'Urgent'],
      confidence: 0.96,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'e6',
    folder: 'inbox',
    subject: 'Invoice #INV-2024-0089 — AWS Services June 2024',
    sender: 'AWS Billing',
    senderEmail: 'aws-billing@amazon.com',
    preview: 'Your AWS invoice for June 2024 is ready. Total amount: $247.83 due July 15, 2024...',
    body: `Dear Deven Goyal,

Your AWS invoice for June 2024 is now available.

Invoice Details:
Invoice Number: INV-2024-0089
Billing Period: June 1 - June 30, 2024
Total Amount: $247.83
Due Date: July 15, 2024

Service Breakdown:
- EC2 Instances (t3.medium × 2): $89.40
- RDS PostgreSQL (db.t3.micro): $43.20
- S3 Storage (250 GB): $5.75
- CloudFront (500 GB data transfer): $42.50
- Lambda Invocations (2.4M): $4.80
- Elastic Load Balancer: $18.25
- Route 53 DNS: $0.50
- Data Transfer: $43.43

Payment will be automatically charged to the credit card ending in 4892 on July 15, 2024.

View detailed invoice: console.aws.amazon.com/billing

Amazon Web Services`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    starred: false,
    labels: ['Invoice'],
    category: 'updates',
    extractedData: {
      submissionId: 'INV-2024-0089',
      dates: ['July 15, 2024'],
      deadlines: [{ label: 'Payment Due', date: 'July 15, 2024' }],
      keywords: ['AWS', 'Invoice', 'Billing', '$247.83'],
      links: [{ label: 'View Invoice', url: 'https://console.aws.amazon.com/billing' }],
    },
    aiAnalysis: {
      priority: 'medium',
      sentiment: 'neutral',
      summary: 'AWS June invoice: $247.83 due July 15. Top costs: EC2 ($89), RDS ($43), CloudFront ($42).',
      actionItems: ['Verify billing amounts', 'Consider Reserved Instances to reduce EC2 cost'],
      suggestedLabels: ['Invoice', 'AWS', 'Finance'],
      confidence: 0.98,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'e7',
    folder: 'inbox',
    subject: 'Team Standup Notes — Sprint 24 Planning',
    sender: 'Priya Sharma',
    senderEmail: 'priya.sharma@startup.io',
    preview: 'Hi Deven, sharing the standup notes from today. We need your input on the AI module architecture...',
    body: `Hi Deven,

Sharing notes from today's Sprint 24 planning standup:

Attendees: Deven, Priya, Arjun, Sneha, Marcus

Discussed:
1. AI Module Architecture — Need your decision on transformer vs BERT approach by Friday
2. Database schema finalization — Sneha needs sign-off on migrations
3. API Gateway configuration — Marcus blocked on AWS IAM permissions
4. Frontend review scheduled for Thursday 3 PM

Action Items for Deven:
- Review AI module architecture proposal (doc shared in Notion)
- Approve database migration PR #43
- Unblock Marcus by providing IAM role ARN

Blockers:
- ONNX model integration waiting on GPU instance provisioning
- Supabase edge functions deployment facing cold start issues

Next Standup: Tomorrow 10 AM IST (meet.google.com/abc-xyz)

Thanks,
Priya`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    read: false,
    starred: false,
    labels: ['Meeting'],
    category: 'primary',
    extractedData: {
      keywords: ['Standup', 'Sprint', 'AI Module', 'Architecture'],
      actionItems: [
        'Review AI module architecture by Friday',
        'Approve database migration PR #43',
        'Provide IAM role ARN to Marcus',
      ],
      meetingDetails: {
        title: 'Team Standup',
        date: 'Tomorrow',
        time: '10:00 AM IST',
        location: 'Google Meet',
      },
      links: [{ label: 'Join Standup', url: 'https://meet.google.com/abc-xyz' }],
    },
    aiAnalysis: {
      priority: 'high',
      sentiment: 'neutral',
      summary: 'Sprint 24 standup: 3 action items for you — AI architecture decision by Friday, approve PR #43, unblock Marcus with IAM ARN.',
      actionItems: ['Review AI architecture', 'Approve PR #43', 'Provide IAM ARN'],
      suggestedLabels: ['Meeting', 'Team', 'Sprint'],
      confidence: 0.92,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'e8',
    folder: 'inbox',
    subject: 'Hackathon Winner — Best AI Innovation, HackBLR 2024',
    sender: 'HackBLR Organizers',
    senderEmail: 'awards@hackblr.dev',
    preview: 'Congratulations! Your project "MailIQ — Intelligent Email OS" has won Best AI Innovation...',
    body: `Dear Deven,

We are thrilled to announce that your project has been selected as the winner!

🏆 Award: Best AI Innovation
Project: MailIQ — Intelligent Email OS
Team: Deven Goyal (Solo)
Hackathon: HackBLR 2024

Prize Details:
- Cash Prize: ₹1,50,000
- AWS Credits: $5,000
- Mentorship: 3 months with Google engineers
- Incubation: Opportunity to join T-Hub Hyderabad

Your project impressed our panel of judges with:
- Novel application of LLMs for email intelligence
- Real-time deadline detection accuracy (94.7%)
- Scalable architecture design
- Clean, production-quality code

Next Steps:
1. Prize distribution ceremony: July 20, 2024
2. Demo showcase at Bangalore Tech Week: August 5, 2024
3. Submit banking details by June 28 for prize transfer

Certificate and media kit will be shared separately.

Congratulations once again!

HackBLR 2024 Team`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    read: false,
    starred: true,
    labels: [],
    category: 'primary',
    extractedData: {
      dates: ['July 20, 2024', 'August 5, 2024', 'June 28'],
      deadlines: [{ label: 'Submit Banking Details', date: 'June 28' }],
      keywords: ['Hackathon', 'Winner', 'AI', 'Award', '₹1,50,000'],
      actionItems: ['Submit banking details by June 28', 'Attend ceremony July 20'],
    },
    aiAnalysis: {
      priority: 'high',
      sentiment: 'positive',
      summary: 'Won Best AI Innovation at HackBLR 2024! Prize: ₹1.5L + $5K AWS credits + Google mentorship. Submit banking details by June 28.',
      actionItems: ['Submit banking details', 'Confirm ceremony attendance'],
      suggestedLabels: ['Achievement', 'Hackathon', 'Important'],
      confidence: 0.99,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'e9',
    folder: 'inbox',
    subject: 'LinkedIn: 3 people viewed your profile today',
    sender: 'LinkedIn',
    senderEmail: 'notifications@linkedin.com',
    preview: 'Software Engineer at Microsoft, Recruiter at Atlassian, and 1 other viewed your profile...',
    body: `Hi Deven,

3 people viewed your LinkedIn profile this week.

Recent Profile Viewers:
- Ananya Mehta — Senior Recruiter at Atlassian
- Rahul Kumar — Engineering Manager at Microsoft
- [Incognito User]

Your profile is appearing in search results for: "AI Engineer", "Full Stack React", "Patent Technology"

Tip: Strengthen your profile by adding your latest project "Mail-IQ" to the Featured section.

LinkedIn`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    read: true,
    starred: false,
    labels: [],
    category: 'social',
    aiAnalysis: {
      priority: 'low',
      sentiment: 'positive',
      summary: 'LinkedIn: Recruiter from Atlassian and Manager from Microsoft viewed your profile.',
      confidence: 0.89,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'e10',
    folder: 'inbox',
    subject: 'Internship Offer — AI Research Intern, OpenAI',
    sender: 'OpenAI Recruiting',
    senderEmail: 'recruiting@openai.com',
    preview: 'We are pleased to extend an offer for our AI Research Internship program starting September 2024...',
    body: `Dear Deven,

We are excited to extend an offer for the AI Research Internship at OpenAI.

Position: AI Research Intern
Team: Alignment Research
Duration: September 2024 - December 2024 (4 months)
Location: San Francisco, CA (Hybrid)
Stipend: $8,500/month + housing allowance

Responsibilities:
- Work directly with research scientists on alignment problems
- Contribute to red-teaming and safety evaluation pipelines
- Publish findings in collaboration with the team

Requirements:
- Accept by July 1, 2024
- Background check completion by July 15
- Visa documentation (if applicable) by August 1

Please respond with your decision to this email or via the portal at openai.com/careers/intern-portal.

We're excited about the possibility of you joining us!

OpenAI Recruiting Team`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    read: false,
    starred: true,
    labels: ['Urgent'],
    category: 'primary',
    extractedData: {
      dates: ['July 1, 2024', 'July 15, 2024', 'August 1, 2024', 'September 2024'],
      deadlines: [{ label: 'Offer Acceptance', date: 'July 1, 2024' }],
      keywords: ['OpenAI', 'Internship', 'AI Research', '$8,500/month'],
      links: [{ label: 'Intern Portal', url: 'https://openai.com/careers/intern-portal' }],
      actionItems: [
        'Accept or decline by July 1',
        'Complete background check by July 15',
        'Prepare visa documents',
      ],
    },
    aiAnalysis: {
      priority: 'high',
      sentiment: 'positive',
      summary: 'OpenAI AI Research Internship offer: $8,500/month, Sep-Dec 2024, SF. Must accept by July 1.',
      actionItems: ['Accept offer by July 1', 'Background check prep', 'Visa documents'],
      suggestedLabels: ['Internship', 'OpenAI', 'Urgent', 'Career'],
      confidence: 0.98,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'e11',
    folder: 'sent',
    subject: 'Re: Patent Application Status Inquiry',
    sender: 'Deven Goyal',
    senderEmail: 'deven@mailiq.dev',
    recipient: 'Patent Examiner',
    recipientEmail: 'examiner@uspto.gov',
    preview: 'Thank you for your response. I am writing to confirm receipt of the office action...',
    body: `Dear Patent Examiner,

Thank you for your communication regarding application US2024/089432.

I am writing to confirm receipt of the office action dated June 10, 2024. I will respond within the statutory period.

Please find attached:
1. Power of Attorney form
2. Updated claims (amended)
3. Declaration of inventorship

Best regards,
Deven Goyal
Inventor, US2024/089432`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
    starred: false,
    labels: ['Patent'],
    category: 'primary',
  },
  {
    id: 'e12',
    folder: 'archive',
    subject: 'Acceptance — NeurIPS 2023 Workshop',
    sender: 'NeurIPS Program',
    senderEmail: 'program@neurips.cc',
    preview: 'Your workshop paper has been accepted for presentation at NeurIPS 2023...',
    body: `Congratulations! Your paper has been accepted to the NeurIPS 2023 Workshop on Large Language Models.

Paper: Efficient Context Window Management in Transformer Architectures
Type: Poster Presentation
Venue: New Orleans, December 2023`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    read: true,
    starred: false,
    labels: ['Research'],
    category: 'primary',
    aiAnalysis: {
      priority: 'low',
      sentiment: 'positive',
      summary: 'NeurIPS 2023 workshop paper accepted for poster presentation.',
      confidence: 0.95,
      generatedAt: new Date().toISOString(),
    },
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Write ICML author rebuttal',
    description: 'Address reviewer concerns: ablation studies, BERT comparison, efficiency analysis',
    status: 'in_progress',
    priority: 'high',
    dueDate: 'July 7, 2024',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    emailId: 'e3',
    emailSubject: 'Research Paper Review — ICML 2024',
    labels: ['Research', 'Academic'],
  },
  {
    id: 't2',
    title: 'Accept OpenAI Internship Offer',
    description: 'Confirm acceptance via portal or email before July 1 deadline',
    status: 'todo',
    priority: 'high',
    dueDate: 'July 1, 2024',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updatedAt: new Date().toISOString(),
    emailId: 'e10',
    emailSubject: 'Internship Offer — OpenAI',
    labels: ['Career', 'Urgent'],
  },
  {
    id: 't3',
    title: 'Fix CI/CD pipeline failures',
    description: 'Fix 3 failing tests: TypeErrors, API timeout, DB connection',
    status: 'todo',
    priority: 'high',
    dueDate: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    emailId: 'e5',
    emailSubject: 'GitHub Actions CI Build Failed',
    labels: ['Dev', 'Bug'],
  },
  {
    id: 't4',
    title: 'Review AI module architecture proposal',
    description: 'Decide between transformer vs BERT approach for email intelligence',
    status: 'todo',
    priority: 'medium',
    dueDate: 'Friday',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
    emailId: 'e7',
    emailSubject: 'Team Standup Notes — Sprint 24',
    labels: ['Team', 'Architecture'],
  },
  {
    id: 't5',
    title: 'Confirm Google DeepMind interview attendance',
    description: 'Reply to confirm and prepare for 4 technical rounds on July 10',
    status: 'done',
    priority: 'high',
    dueDate: 'July 5, 2024',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    emailId: 'e2',
    emailSubject: 'Interview Confirmation — Google DeepMind',
    labels: ['Interview', 'Career'],
  },
  {
    id: 't6',
    title: 'Submit banking details for HackBLR prize',
    description: 'Send banking information for ₹1,50,000 prize transfer',
    status: 'todo',
    priority: 'medium',
    dueDate: 'June 28',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date().toISOString(),
    emailId: 'e8',
    emailSubject: 'Hackathon Winner — HackBLR 2024',
    labels: ['Achievement'],
  },
];

export const MOCK_NOTIFICATIONS: MailNotification[] = [
  {
    id: 'n1',
    title: 'Deadline Alert',
    message: 'OpenAI offer acceptance due in 8 days (July 1)',
    category: 'deadline',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    emailId: 'e10',
  },
  {
    id: 'n2',
    title: 'AI Analysis Complete',
    message: 'Patent email analyzed: High priority, 3 action items extracted',
    category: 'ai',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    emailId: 'e1',
  },
  {
    id: 'n3',
    title: 'New High Priority Email',
    message: 'Google DeepMind interview confirmation received',
    category: 'email',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    emailId: 'e2',
  },
  {
    id: 'n4',
    title: 'Build Failed',
    message: 'GitHub Actions CI failed on main branch',
    category: 'system',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    emailId: 'e5',
  },
];

export const MOCK_ANALYTICS: AnalyticsData = {
  totalEmails: 247,
  unreadEmails: 5,
  priorityEmails: 6,
  upcomingDeadlines: 4,
  aiActionsToday: 12,
  productivityScore: 87,
  weeklyActivity: [
    { day: 'Mon', received: 34, sent: 8, processed: 34 },
    { day: 'Tue', received: 28, sent: 12, processed: 28 },
    { day: 'Wed', received: 41, sent: 6, processed: 38 },
    { day: 'Thu', received: 22, sent: 15, processed: 22 },
    { day: 'Fri', received: 38, sent: 9, processed: 35 },
    { day: 'Sat', received: 15, sent: 3, processed: 15 },
    { day: 'Sun', received: 8, sent: 1, processed: 8 },
  ],
  categoryBreakdown: [
    { name: 'Primary', value: 58, color: '#6366f1' },
    { name: 'Updates', value: 22, color: '#10b981' },
    { name: 'Social', value: 12, color: '#f59e0b' },
    { name: 'Promotions', value: 8, color: '#8b5cf6' },
  ],
  priorityBreakdown: [
    { name: 'High', value: 6, color: '#ef4444' },
    { name: 'Medium', value: 18, color: '#f59e0b' },
    { name: 'Low', value: 76, color: '#10b981' },
  ],
  sentimentBreakdown: [
    { name: 'Positive', value: 45, color: '#10b981' },
    { name: 'Neutral', value: 38, color: '#6366f1' },
    { name: 'Negative', value: 10, color: '#ef4444' },
    { name: 'Urgent', value: 7, color: '#f59e0b' },
  ],
};
