export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
export type AccountCategory = "retirement" | "non_retirement" | "liability" | "trust";

export interface Account {
  id: number;
  client_id: number;
  account_name: string;
  account_category: AccountCategory;
  last_four?: string;
  is_joint: boolean;
  created_at: string;
}

export interface AccountCreate {
  client_id: number;
  account_name: string;
  account_category: AccountCategory;
  last_four?: string;
  is_joint: boolean;
}

export interface Client {
  id: number;
  client_name: string;
  spouse_name?: string;
  monthly_salary: number;
  monthly_expenses: number;
  created_at: string;
  accounts: Account[];
}

export interface ClientCreate {
  client_name: string;
  spouse_name?: string;
  monthly_salary: number;
  monthly_expenses: number;
}

export interface Report {
  id: number;
  client_id: number;
  year: number;
  quarter: Quarter;
  income: number;
  expenses: number;
  assets: number;
  liabilities: number;
  net_income: number;
  net_worth: number;
  notes?: string;
  created_at: string;
}

export interface ReportCreate {
  client_id: number;
  year: number;
  quarter: Quarter;
  income: number;
  expenses: number;
  assets: number;
  liabilities: number;
  notes?: string;
}

// ── Quarterly Report (account-based, actual backend schema) ───────────────────

export interface ReportEntry {
  id: number;
  report_id: number;
  account_id: number;
  balance: number;
  account: Account;
}

export interface ReportCalculations {
  excess_cashflow: number;
  retirement_total: number;
  non_retirement_total: number;
  trust_total: number;
  liabilities_total: number;
  grand_total_net_worth: number;
}

export interface QuarterlyReport {
  id: number;
  client_id: number;
  created_at: string;
  entries: ReportEntry[];
}

export interface QuarterlyReportWithCalcs extends QuarterlyReport {
  calculations: ReportCalculations;
}

export interface QuarterlyReportCreate {
  client_id: number;
  entries: { account_id: number; balance: number }[];
}
