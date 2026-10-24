export type PortalRoute = 'dashboard' | 'academics' | 'finance' | 'attendance' | 'library' | 'settings';
export type FinanceTab = 'overview' | 'history' | 'pending' | 'scholarships';

export type AssistantMode = 'idle' | 'guide' | 'agent';

export type AgentStatus = 'idle' | 'running' | 'paused' | 'approval_required' | 'completed' | 'stopped';

export interface PaymentRecord {
  id: string;
  title: string;
  category: string;
  amount: number;
  formattedAmount: string;
  status: 'Paid' | 'Pending' | 'Processing';
  txnReference: string;
  paymentDate: string;
  paymentMode: string;
  receiptFileName: string;
  isTargetReceipt?: boolean;
}

export interface WorkflowStep {
  id: string;
  stepNumber: number;
  targetId: string;
  targetRoute: PortalRoute;
  targetSubTab?: FinanceTab;
  instruction: string;
  subText: string;
  tooltipText: string;
  whyThisStep: string;
  actionType: 'navigate' | 'tab' | 'action';
  isSensitive?: boolean;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  message: string;
  status: 'completed' | 'in_progress' | 'pending' | 'review' | 'warn';
  detail?: string;
}

export interface ApprovalDetails {
  title: string;
  summary: string;
  targetFile: string;
  completedActions: string[];
  pendingActions: string[];
  impactNotes: string[];
}

export interface CompletionDetails {
  title: string;
  message: string;
  highlights: string[];
  receiptFileName?: string;
}

export interface WorkflowDefinition {
  id: string;
  title: string;
  description: string;
  steps: WorkflowStep[];
  sensitiveStepIndex?: number;
  approvalDetails: ApprovalDetails;
  completionDetails: CompletionDetails;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export interface HighlightColorConfig {
  name: 'violet' | 'terracotta' | 'cyan' | 'amber';
  hex: string;
  glow: string;
  badgeBg: string;
  badgeText: string;
}
