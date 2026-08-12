export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'number'
  | 'date'
  | 'file'
  | 'image';

export interface FormOption {
  id: string;
  label: string;
  value: string;
}

export interface FormFieldCondition {
  fieldId: string;
  value: string | string[]; // value that triggers visibility
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: FormOption[]; // For select, radio, checkbox
  helpText?: string;
  defaultValue?: string;
  accept?: string; // e.g., ".pdf,.jpg,.png" or "image/*"
  maxSizeMb?: number; // e.g., 5 for 5MB limit
  section?: string; // Section heading grouping, e.g., "Section A: Personal Details"
  conditionalOn?: FormFieldCondition; // Optional field dependency
}

export interface FormNoticeBox {
  title: string;
  description: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    amount: string;
  };
}

export interface FormConfig {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fields: FormField[];
  category?: 'Sales' | 'Rentals' | 'Property Management' | 'KYC & Engagement' | 'Tenancy' | 'General';
  headerNotice?: string;
  noticeBox?: FormNoticeBox;
}

export type ResponseStatus =
  | 'New'
  | 'Contacted'
  | 'In Progress'
  | 'Closed/Converted'
  | 'Not Interested';

export interface StaffNote {
  id: string;
  createdAt: string;
  author: string;
  content: string;
}

export interface FileDataValue {
  fileName: string;
  fileType: string;
  fileSizeMb: number;
  dataUrl?: string; // Base64 data URL for display/preview
}

export interface FormResponse {
  id: string; // e.g., "JOK-2026-1042"
  formId: string;
  formTitle: string;
  submittedAt: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string;
  status: ResponseStatus;
  notes: StaffNote[];
  fieldValues: Record<string, string | string[] | number | boolean | FileDataValue>;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  whatsappNumber: string; // international format without + e.g. "2348034567890"
  enableEmailNotifications: boolean;
  workingHours: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: string;
  isAuthenticated: boolean;
}
