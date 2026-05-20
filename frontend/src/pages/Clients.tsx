import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { clientsApi } from "../services/api";
import { formatDate, formatCurrency, getInitials } from "../utils/format";
import type { Client } from "../types";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { IconUsers, IconPlus } from "../components/icons";

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: i === 1 ? "140px" : i === 2 ? "110px" : i === 3 ? "130px" : "80px" }} />
        </td>
      ))}
    </tr>
  );
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientsApi.list().then(setClients).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">All Clients</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? "Loading…" : `${clients.length} client${clients.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          to="/clients/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <IconPlus className="w-3.5 h-3.5" />
          Add Client
        </Link>
      </div>

      <Card noPadding>
        {!loading && clients.length === 0 ? (
          <EmptyState
            title="No clients yet"
            description="Add your first client to get started tracking financial plans."
            icon={<IconUsers className="w-5 h-5" />}
            action={
              <Link
                to="/clients/new"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <IconPlus className="w-3.5 h-3.5" />
                Add Client
              </Link>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Spouse</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Monthly Salary</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50/70 transition-colors duration-100">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 text-xs font-semibold">
                              {getInitials(client.client_name)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{client.client_name}</p>
                            {client.spouse_name && (
                              <p className="text-xs text-gray-400 md:hidden">{client.spouse_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                        {client.spouse_name ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-right hidden lg:table-cell font-semibold tabular-nums">
                        {formatCurrency(client.monthly_salary)}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap font-medium">
                        {formatDate(client.created_at)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
