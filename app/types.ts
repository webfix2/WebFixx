// Generic JSON object type
export interface JSONObject {
  [key: string]: any;
}

// USER DASHBOARD PAGE TYPES
export interface LoginData {
  id: string;
  timestamp: string;
  email: string;
  domain: string;
  password: string;
  ipData: JSONObject;
  deviceData: JSONObject;
  verified: boolean;
  cookie: string;
  memo?: string;
}

export interface FilterOptions {
  verified: boolean | null;
  hasCookie: boolean | null;
  hasMemo: boolean | null;
  search: string;
}

// EMAIL CAMPAIGN PAGE TYPES
export interface SMTPSetting {
  id?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  status?: 'active' | 'inactive';
}

// Alias for backward compatibility
export type SMTPConfig = SMTPSetting;

export interface Campaign {
  id: string; // Made required
  name: string;
  type: 'general' | 'email_logs' | 'bank_logs';
  subject: string;
  smtpSettings: SMTPSetting[];
  fileUrl: string; // Made required
  summary?: string;
  template?: string;
  created_at: string; // Added
  status: 'draft' | 'scheduled' | 'running' | 'completed'; // Made required
  analytics?: {
      totalRows: number;
      sent: number;
      delivered: number;
      failed: number;
  };
}

export interface CSVAnalytics {
  totalRows: number;
  headers: string[];
  preview: string[][];
  summary: string;
}

// Campaign creation type (for new campaigns)
export interface NewCampaign extends Omit<Campaign, 'id' | 'created_at' | 'status'> {
  id?: string;
  created_at?: string;
  status?: Campaign['status'];
}
