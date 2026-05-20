import axios from "axios";
import type { Client, ClientCreate, Account, AccountCreate, Report, ReportCreate, QuarterlyReport, QuarterlyReportWithCalcs, QuarterlyReportCreate } from "../types";

const base = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "/api";

const api = axios.create({ baseURL: base });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err.response?.data?.detail ?? err.message ?? "Request failed";
    return Promise.reject(new Error(typeof detail === "string" ? detail : JSON.stringify(detail)));
  }
);

// ── Clients ───────────────────────────────────────────────────────────────────

export const clientsApi = {
  list: () => api.get<Client[]>("/clients/").then((r) => r.data),
  get: (id: number) => api.get<Client>(`/clients/${id}`).then((r) => r.data),
  create: (data: ClientCreate) => api.post<Client>("/clients/", data).then((r) => r.data),
  update: (id: number, data: Partial<ClientCreate>) =>
    api.patch<Client>(`/clients/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/clients/${id}`),
};

// ── Accounts ─────────────────────────────────────────────────────────────────

export const accountsApi = {
  list: (clientId?: number) =>
    api
      .get<Account[]>("/accounts/", { params: clientId ? { client_id: clientId } : undefined })
      .then((r) => r.data),
  create: (data: AccountCreate) => api.post<Account>("/accounts/", data).then((r) => r.data),
  update: (id: number, data: Partial<AccountCreate>) =>
    api.patch<Account>(`/accounts/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/accounts/${id}`),
};

// ── Reports ───────────────────────────────────────────────────────────────────

export const quarterlyReportsApi = {
  list: (clientId?: number) =>
    api
      .get<QuarterlyReport[]>("/reports/", { params: clientId ? { client_id: clientId } : undefined })
      .then((r) => r.data),
  create: (data: QuarterlyReportCreate) =>
    api.post<QuarterlyReportWithCalcs>("/reports/", data).then((r) => r.data),
  downloadPdf: async (id: number, type: "sacs" | "tcc") => {
    const res = await api.get(`/reports/${id}/pdf`, { params: { type }, responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${id}_${type}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

export const reportsApi = {
  list: (clientId?: number) =>
    api
      .get<Report[]>("/reports/", { params: clientId ? { client_id: clientId } : undefined })
      .then((r) => r.data),
  get: (id: number) => api.get<Report>(`/reports/${id}`).then((r) => r.data),
  create: (data: ReportCreate) => api.post<Report>("/reports/", data).then((r) => r.data),
  update: (id: number, data: Partial<ReportCreate>) =>
    api.patch<Report>(`/reports/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/reports/${id}`),
  downloadPdf: (id: number) => `/api/reports/${id}/pdf`,
};
