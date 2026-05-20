import type { Client, Report } from "../types";

export const mockClients: Client[] = [
  { id: 1, client_name: "Sarah Mitchell", spouse_name: "James Mitchell", monthly_salary: 15000, monthly_expenses: 6000, accounts: [], created_at: "2024-01-15T10:00:00Z" },
  { id: 2, client_name: "James Thornton", monthly_salary: 20000, monthly_expenses: 7916, accounts: [], created_at: "2024-02-03T10:00:00Z" },
  { id: 3, client_name: "Elena Rodriguez", spouse_name: "Carlos Rodriguez", monthly_salary: 10000, monthly_expenses: 4833, accounts: [], created_at: "2024-02-20T10:00:00Z" },
  { id: 4, client_name: "Michael Chen", monthly_salary: 25833, monthly_expenses: 11666, accounts: [], created_at: "2024-03-08T10:00:00Z" },
  { id: 5, client_name: "Priya Nair", spouse_name: "Raj Nair", monthly_salary: 7916, monthly_expenses: 3750, accounts: [], created_at: "2024-03-22T10:00:00Z" },
  { id: 6, client_name: "David Okafor", monthly_salary: 14583, monthly_expenses: 6833, accounts: [], created_at: "2024-04-10T10:00:00Z" },
  { id: 7, client_name: "Rachel Kim", monthly_salary: 7333, monthly_expenses: 3500, accounts: [], created_at: "2024-05-05T10:00:00Z" },
  { id: 8, client_name: "Thomas Webb", spouse_name: "Linda Webb", monthly_salary: 18750, monthly_expenses: 8750, accounts: [], created_at: "2024-05-18T10:00:00Z" },
];

export const mockReports: Report[] = [
  { id: 1, client_id: 1, year: 2024, quarter: "Q1", income: 185000, expenses: 72000, assets: 1250000, liabilities: 320000, net_income: 113000, net_worth: 930000, notes: "Strong income growth. Reviewed investment allocation.", created_at: "2024-04-05T10:00:00Z" },
  { id: 2, client_id: 1, year: 2024, quarter: "Q2", income: 192000, expenses: 68000, assets: 1310000, liabilities: 305000, net_income: 124000, net_worth: 1005000, notes: "Net worth crossed $1M milestone.", created_at: "2024-07-08T10:00:00Z" },
  { id: 3, client_id: 2, year: 2024, quarter: "Q1", income: 240000, expenses: 95000, assets: 2100000, liabilities: 480000, net_income: 145000, net_worth: 1620000, created_at: "2024-04-10T10:00:00Z" },
  { id: 4, client_id: 2, year: 2024, quarter: "Q2", income: 255000, expenses: 88000, assets: 2280000, liabilities: 460000, net_income: 167000, net_worth: 1820000, created_at: "2024-07-12T10:00:00Z" },
  { id: 5, client_id: 3, year: 2024, quarter: "Q1", income: 120000, expenses: 58000, assets: 890000, liabilities: 210000, net_income: 62000, net_worth: 680000, created_at: "2024-04-15T10:00:00Z" },
  { id: 6, client_id: 4, year: 2024, quarter: "Q1", income: 310000, expenses: 140000, assets: 3200000, liabilities: 650000, net_income: 170000, net_worth: 2550000, created_at: "2024-04-18T10:00:00Z" },
  { id: 7, client_id: 4, year: 2024, quarter: "Q2", income: 325000, expenses: 135000, assets: 3450000, liabilities: 620000, net_income: 190000, net_worth: 2830000, created_at: "2024-07-20T10:00:00Z" },
  { id: 8, client_id: 5, year: 2024, quarter: "Q1", income: 95000, expenses: 45000, assets: 620000, liabilities: 180000, net_income: 50000, net_worth: 440000, created_at: "2024-04-20T10:00:00Z" },
  { id: 9, client_id: 6, year: 2024, quarter: "Q1", income: 175000, expenses: 82000, assets: 1100000, liabilities: 290000, net_income: 93000, net_worth: 810000, created_at: "2024-04-25T10:00:00Z" },
  { id: 10, client_id: 7, year: 2023, quarter: "Q4", income: 88000, expenses: 42000, assets: 540000, liabilities: 160000, net_income: 46000, net_worth: 380000, created_at: "2024-01-12T10:00:00Z" },
];

export const mockStats = {
  totalClients: mockClients.length,
  totalReports: mockReports.length,
  totalNetWorth: 7965000,
  avgNetWorth: 1137857,
};
