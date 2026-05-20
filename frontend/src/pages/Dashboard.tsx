import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { clientsApi, reportsApi } from "../services/api";
import type { Client } from "../types";
import { getInitials, formatDate } from "../utils/format";
import StatCard from "../components/StatCard";
import { IconUsers, IconFileText, IconBarChart, IconFilePlus } from "../components/icons";

interface SlimReport {
  id: number;
  client_id: number;
  created_at: string;
}

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [reports, setReports] = useState<SlimReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([clientsApi.list(), reportsApi.list()])
      .then(([c, r]) => {
        setClients(c);
        setReports(r as unknown as SlimReport[]);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const lastReportMap: Record<number, string> = {};
  for (const r of reports) {
    const existing = lastReportMap[r.client_id];
    if (!existing || r.created_at > existing) {
      lastReportMap[r.client_id] = r.created_at;
    }
  }

  const totalAccounts = clients.reduce((sum, c) => sum + c.accounts.length, 0);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center">
        <p className="text-sm font-medium text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-xs text-red-600 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Clients"
          value={String(clients.length)}
          delta="Clients on record"
          icon={<IconUsers className="w-4 h-4" />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Total Accounts"
          value={String(totalAccounts)}
          delta="Across all clients"
          icon={<IconBarChart className="w-4 h-4" />}
          iconBg="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Total Reports"
          value={String(reports.length)}
          delta="Quarterly reports"
          icon={<IconFileText className="w-4 h-4" />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Client Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800 tracking-[-0.01em]">Clients</h2>
          <Link
            to="/clients"
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-150"
          >
            View all →
          </Link>
        </div>

        {clients.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                lastReportDate={lastReportMap[client.id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClientCard({
  client,
  lastReportDate,
}: {
  client: Client;
  lastReportDate?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/70 shadow-card p-5 flex flex-col gap-4 hover:shadow-card-hover hover:border-gray-200 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 text-xs font-bold">
            {getInitials(client.client_name)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
            {client.client_name}
          </p>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {client.spouse_name ?? <span className="text-gray-300 italic">No spouse on file</span>}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
          {client.accounts.length === 1
            ? "1 account"
            : `${client.accounts.length} accounts`}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
          {lastReportDate
            ? `Last report ${formatDate(lastReportDate)}`
            : "No reports yet"}
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100">
        <Link
          to={`/reports/new?client=${client.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors duration-150"
        >
          <IconFilePlus className="w-3.5 h-3.5" />
          Generate Report
        </Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/40 px-6 py-16 text-center">
      <div className="mx-auto w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <IconUsers className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-700">No clients yet</p>
      <p className="mt-1 text-xs text-gray-400">
        Add your first client to get started.
      </p>
      <Link
        to="/clients/new"
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Add Client
      </Link>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-100" />
        ))}
      </div>
      <div>
        <div className="h-4 w-24 rounded bg-gray-100 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
