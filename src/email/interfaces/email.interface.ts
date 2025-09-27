export interface EmailConfig {
  apiKey: string;
  senderEmail: string;
  senderName: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailJobData {
  to: string;
  subject: string;
  htmlContent: string;
  sentById: number;
  emailLogId: number;
}
