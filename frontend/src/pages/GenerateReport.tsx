import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clientsApi, quarterlyReportsApi } from "../services/api";
import { formatCurrency } from "../utils/format";
import type { Client, Account, AccountCategory } from "../types";
import Card from "../components/Card";
import { IconArrowLeft, IconCheck } from "../components/icons";

type Balances = Record<number, string>;

const CATEGORIES: AccountCategory[] = ["retirement", "non_retirement", "trust", "liability"];

const CATEGORY_CFG: Record<AccountCategory, { label: string; dot: string; color: string }> = {
  retirement:     { label: "Retirement",     dot: "bg-blue-500",   color: "text-blue-700"   },
  non_retirement: { label: "Non-Retirement", dot: "bg-emerald-500", color: "text-emerald-700" },
  trust:          { label: "Trust",          dot: "bg-violet-500", color: "text-violet-700" },
  liability:      { label: "Liabilities",    dot: "bg-orange-400", color: "text-orange-700" },
};

function parse(v: string): number {
  return parseFloat(v.replace(/,/g, "")) || 0;
}

function CalcRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${value > 0 ? color : "text-gray-300"}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

export default function GenerateReport() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<number | "">("");
  const [balances, setBalances] = useState<Balances>({});
  const [prevBalances, setPrevBalances] = useState<Record<number, number>>({});
  const [prevLoading, setPrevLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [clientError, setClientError] = useState(false);
  const [balanceError, setBalanceError] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    clientsApi
      .list()
      .then(setClients)
      .catch(() => {})
      .finally(() => setClientsLoading(false));
  }, []);

  const selectedClient: Client | null = selectedClientId
    ? (clients.find((c) => c.id === selectedClientId) ?? null)
    : null;

  // When client changes, reset balances and load previous report values as placeholders
  useEffect(() => {
    setBalances({});
    setPrevBalances({});
    if (!selectedClientId) return;
    setPrevLoading(true);
    quarterlyReportsApi
      .list(Number(selectedClientId))
      .then((reports) => {
        if (reports.length === 0) return;
        const latest = reports[reports.length - 1];
        const prev: Record<number, number> = {};
        latest.entries.forEach((e) => { prev[e.account_id] = e.balance; });
        setPrevBalances(prev);
      })
      .catch(() => {})
      .finally(() => setPrevLoading(false));
  }, [selectedClientId]);

  const accountsByCategory = useMemo((): Record<AccountCategory, Account[]> => {
    const grouped: Record<AccountCategory, Account[]> = {
      retirement: [], non_retirement: [], trust: [], liability: [],
    };
    if (!selectedClient) return grouped;
    for (const acc of selectedClient.accounts) {
      grouped[acc.account_category].push(acc);
    }
    return grouped;
  }, [selectedClient]);

  const calcs = useMemo(() => {
    const sum = (cat: AccountCategory) =>
      (accountsByCategory[cat] ?? []).reduce((s, a) => s + parse(balances[a.id] ?? ""), 0);
    const retirement = sum("retirement");
    const non_retirement = sum("non_retirement");
    const trust = sum("trust");
    const liability = sum("liability");
    return {
      excess_cashflow: selectedClient
        ? selectedClient.monthly_salary - selectedClient.monthly_expenses
        : 0,
      retirement_total: retirement,
      non_retirement_total: non_retirement,
      trust_total: trust,
      liabilities_total: liability,
      grand_total: retirement + non_retirement + trust,
    };
  }, [balances, accountsByCategory, selectedClient]);

  const hasAccounts = !!selectedClient && selectedClient.accounts.length > 0;
  const anyBalance = Object.values(balances).some((v) => v !== "" && parse(v) > 0);

  function handleClientChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setSelectedClientId(val === "" ? "" : Number(val));
    setClientError(false);
    setBalanceError(false);
    setSubmitError(null);
  }

  function handleBalance(accountId: number, value: string) {
    setBalances((prev) => ({ ...prev, [accountId]: value }));
    setBalanceError(false);
    setSubmitError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClientId) { setClientError(true); return; }
    if (!anyBalance) { setBalanceError(true); return; }

    const entries = Object.entries(balances)
      .filter(([, v]) => v !== "" && parse(v) >= 0)
      .map(([id, v]) => ({ account_id: Number(id), balance: parse(v) }));

    setSubmitting(true);
    setSubmitError(null);
    try {
      await quarterlyReportsApi.create({ client_id: Number(selectedClientId), entries });
      setSuccess(true);
      setTimeout(() => navigate("/reports"), 1600);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to generate report");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link
        to="/reports"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
      >
        <IconArrowLeft className="w-3.5 h-3.5" />
        Back to Reports
      </Link>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Generate Report</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Enter account balances for a quarterly financial snapshot.
        </p>
      </div>

      {success && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 flex-shrink-0">
            <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-emerald-800">Report generated — redirecting…</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-6 items-start">
          {/* ── Left column: inputs ───────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Client selector */}
            <Card title="Client">
              <div>
                <select
                  value={selectedClientId}
                  onChange={handleClientChange}
                  disabled={clientsLoading}
                  className={`block w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 transition-all duration-150 ${
                    clientError
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:border-blue-400 focus:ring-blue-100 hover:border-gray-300"
                  } ${clientsLoading ? "opacity-60 cursor-wait" : ""}`}
                >
                  <option value="">
                    {clientsLoading ? "Loading clients…" : "Select a client…"}
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.client_name}{c.spouse_name ? ` & ${c.spouse_name}` : ""}
                    </option>
                  ))}
                </select>
                {clientError && (
                  <p className="mt-1.5 text-xs text-red-500">Please select a client</p>
                )}
              </div>
            </Card>

            {/* No accounts state */}
            {selectedClient && !hasAccounts && (
              <div className="rounded-xl border border-gray-100 bg-white px-6 py-8 text-center">
                <p className="text-sm font-medium text-gray-600">This client has no accounts</p>
                <p className="text-xs text-gray-400 mt-1">
                  Add accounts to this client before generating a report.
                </p>
              </div>
            )}

            {/* Account groups */}
            {hasAccounts && (
              <>
                {prevLoading && (
                  <p className="text-xs text-gray-400 italic">Loading previous values…</p>
                )}

                {balanceError && (
                  <p className="text-xs text-red-500 -mb-1">
                    Enter at least one account balance to continue.
                  </p>
                )}

                {CATEGORIES.map((cat) => {
                  const accounts = accountsByCategory[cat];
                  if (accounts.length === 0) return null;
                  const cfg = CATEGORY_CFG[cat];
                  const catTotal = accounts.reduce(
                    (s, a) => s + parse(balances[a.id] ?? ""),
                    0
                  );

                  return (
                    <Card key={cat}>
                      {/* Section header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className={`text-sm font-semibold ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({accounts.length})
                          </span>
                        </div>
                        {catTotal > 0 && (
                          <span className="text-sm font-semibold text-gray-700 tabular-nums">
                            {formatCurrency(catTotal)}
                          </span>
                        )}
                      </div>

                      {/* Account rows */}
                      <div className="space-y-3">
                        {accounts.map((acc) => {
                          const hasPrev = prevBalances[acc.id] != null;
                          return (
                            <div key={acc.id} className="flex items-end gap-3">
                              <div className="flex-1 min-w-0">
                                <label className="block text-xs font-medium text-gray-600 mb-1 truncate">
                                  {acc.account_name}
                                  {acc.last_four && (
                                    <span className="ml-1.5 text-gray-400 font-normal">
                                      ···{acc.last_four}
                                    </span>
                                  )}
                                  {acc.is_joint && (
                                    <span className="ml-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                                      Joint
                                    </span>
                                  )}
                                </label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none select-none">
                                    $
                                  </span>
                                  <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={balances[acc.id] ?? ""}
                                    placeholder={
                                      hasPrev ? String(prevBalances[acc.id]) : "0"
                                    }
                                    onChange={(e) => handleBalance(acc.id, e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 pl-6 pr-3 py-2 text-sm font-mono text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 hover:border-gray-300 transition-all duration-150"
                                  />
                                </div>
                              </div>

                              {/* Previous value badge */}
                              {hasPrev && (
                                <div className="flex-shrink-0 pb-0.5 text-right">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                    prev
                                  </p>
                                  <p className="text-xs font-medium text-gray-500 tabular-nums">
                                    {formatCurrency(prevBalances[acc.id])}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}

                {submitError && (
                  <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={submitting || success}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Generating…
                      </>
                    ) : (
                      "Generate Report"
                    )}
                  </button>
                  <Link
                    to="/reports"
                    className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* ── Right column: live calculations ──────────────────────────── */}
          {selectedClient && (
            <div className="w-72 flex-shrink-0 sticky top-0">
              <div className="bg-white rounded-xl border border-gray-200/70 shadow-card overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Live Calculations
                  </p>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-gray-400 font-medium">Live</span>
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Excess cashflow */}
                  <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3.5">
                    <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1.5">
                      Excess Cashflow
                    </p>
                    <p
                      className={`text-[22px] font-bold tabular-nums leading-none ${
                        calcs.excess_cashflow >= 0 ? "text-blue-800" : "text-red-700"
                      }`}
                    >
                      {formatCurrency(calcs.excess_cashflow)}
                    </p>
                    <p className="text-[10px] text-blue-400 mt-1">per month</p>
                  </div>

                  {/* Asset totals */}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                      Asset Totals
                    </p>
                    <CalcRow
                      label="Retirement"
                      value={calcs.retirement_total}
                      color="text-blue-600"
                    />
                    <CalcRow
                      label="Non-Retirement"
                      value={calcs.non_retirement_total}
                      color="text-emerald-600"
                    />
                    <CalcRow
                      label="Trust"
                      value={calcs.trust_total}
                      color="text-violet-600"
                    />
                  </div>

                  {/* Grand total */}
                  <div className="rounded-lg bg-gray-900 px-4 py-3.5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">
                      Grand Total
                    </p>
                    <p className="text-[22px] font-bold text-white tabular-nums leading-none">
                      {formatCurrency(calcs.grand_total)}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Retirement + Non-Ret + Trust
                    </p>
                  </div>

                  {/* Liabilities */}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                      Liabilities
                    </p>
                    <div className="rounded-lg bg-orange-50 border border-orange-100 px-4 py-3.5">
                      <p className="text-[22px] font-bold text-orange-700 tabular-nums leading-none">
                        {formatCurrency(calcs.liabilities_total)}
                      </p>
                      <p className="text-[10px] text-orange-400 mt-1">
                        Not deducted from net worth
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
