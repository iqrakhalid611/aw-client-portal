import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  icon: ReactNode;
  iconBg?: string;
}

export default function StatCard({ label, value, delta, icon, iconBg = "bg-blue-50 text-blue-600" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/70 shadow-card p-6">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-[28px] font-semibold text-gray-900 tracking-tight tabular-nums leading-none">{value}</p>
          {delta && <p className="mt-1.5 text-xs text-gray-400 font-medium">{delta}</p>}
        </div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
