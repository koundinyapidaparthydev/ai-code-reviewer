// Type definitions for the application

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Finding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line: number | null;
  message: string;
  evidence: string;
  suggestion: string;
  rule?: string;
}

export interface ToolCallRecord {
  name: string;
  input: Record<string, unknown>;
  outputPreview: string;
  durationMs: number;
  ok: boolean;
}

export interface Validation {
  id: string;
  commitHash: string;
  commitMessage: string;
  repositoryName: string;
  branchName: string;
  status: 'pending' | 'completed' | 'failed' | 'success' | 'processing';
  timestamp: string;
  overallScore?: number;
  filesAnalyzed?: number;
  findings?: Finding[];
  toolCalls?: ToolCallRecord[];
  reviewMode?: string;
  aiSummary?: string;
}

export interface ValidationDetail extends Validation {
  author: string;
  files: FileAnalysis[];
  aiFeedback: AIFeedback;
}

export interface FileAnalysis {
  fileName: string;
  linesChanged: number;
  status: 'success' | 'warning' | 'error';
  issues: Issue[];
  qualityScore: number;
  diff?: string;
}

export interface Issue {
  line: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  category: 'security' | 'performance' | 'style' | 'best-practice';
}

export interface AIFeedback {
  generalComments: string[];
  bestPractices: string[];
  securityConcerns: string[];
  performanceRecommendations: string[];
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  owner: string;
  branch: string;
  lastValidation?: string;
  totalValidations: number;
  isConnected: boolean;
  webhookStatus: 'active' | 'inactive' | 'error';
  autoValidate: boolean;
}

export interface RepositorySettings {
  autoValidateOnPush: boolean;
  validateOnPullRequest: boolean;
  notifyOnComplete: boolean;
  fileExtensions: string[];
  maxFilesPerCommit: number;
  aiModel: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface Settings {
  profile: {
    name: string;
    email: string;
    profilePicture?: string;
  };
  notifications: {
    emailEnabled: boolean;
    slackWebhook?: string;
    discordWebhook?: string;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  apiKeys: {
    githubToken?: string;
    aiProviderKey?: string;
  };
  validationPreferences: {
    defaultModel: string;
    sensitivity: 'strict' | 'moderate' | 'lenient';
    includeExtensions: string[];
    excludeExtensions: string[];
    maxFiles: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface FilterParams {
  status?: 'pending' | 'completed' | 'failed';
  repository?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ValidationStatistics {
  totalValidations: number;
  successRate: number;
  failedValidations: number;
  pendingReviews: number;
  averageScore: number;
}
