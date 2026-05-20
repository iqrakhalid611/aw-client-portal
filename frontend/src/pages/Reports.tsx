import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { quarterlyReportsApi, clientsApi } from "../services/api";
import { formatDate } from "../utils/format";
import type { QuarterlyReport, Client } from "../types";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { IconFileText, IconPlus, IconDownload } from "../components/icons";

type PdfType = "sacs" | "tcc";
type DownloadKey = `${number}-${PdfType}`;

function SkeletonRow() {
  return (
    <tr>
      {[160, 80, 100, 160].map((w, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${w}px` }} />
        </td>
      ))}
    </tr>
  );
}

function Spinner() {
  return (
    <span className="w-3 h-3 rounded-full border-[1.75px] border-current border-t-transparent animate-spin inline-block" />
  );
}

export default function Reports() {
  const [reports, setReports] = useState<QuarterlyReport[]>([]);
  const [clientMap, setClientMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<Record<DownloadKey, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([quarterlyReportsApi.list(), clientsApi.list()])
      .then(([reps, clients]) => {
        setReports(reps);
        setClientMap(Object.fromEntries(clients.map((c: Client) => [c.id, c.client_name])));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDownload(reportId: number, type: PdfType) {
    const key: DownloadKey = `${reportId}-${type}`;
    setDownloading((prev) => ({ ...prev, [key]: true }));
    setError(null);
    try {
      await quarterlyReportsApi.downloadPdf(reportId, type);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading((prev) => ({ ...prev, [key]: false }));
    }
  }

  function isDownloading(reportId: number, type: PdfType) {
    return !!downloading[`${reportId}-${type}`];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">All Reports</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? "Loading…" : `${reports.length} report${reports.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          to="/reports/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <IconPlus className="w-3.5 h-3.5" />
          Generate Report
        </Link>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-xs text-red-400 hover:text-red-600 ml-4 flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <Card noPadding>
        {!loading && reports.length === 0 ? (
          <EmptyState
            title="No reports yet"
            description="Generate a financial report for one of your clients to get started."
            icon={<IconFileText className="w-5 h-5" />}
            action={
              <Link
                to="/reports/new"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <IconPlus className="w-3.5 h-3.5" />
                Generate Report
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Accounts</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Download PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50/70 transition-colors duration-100">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                          {clientMap[report.client_id] ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">
                          {report.entries.length}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap font-medium">
                          {formatDate(report.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {(["sacs", "tcc"] as PdfType[]).map((type) => {
                              const busy = isDownloading(report.id, type);
                              return (
                                <button
                                  key={type}
                                  onClick={() => handleDownload(report.id, type)}
                                  disabled={busy}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {busy ? (
                                    <Spinner />
                                  ) : (
                                    <IconDownload className="w-3 h-3" />
                                  )}
                                  {type.toUpperCase()}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
