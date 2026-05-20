import { NavLink, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import {
  IconDashboard,
  IconUsers,
  IconUserPlus,
  IconFileText,
  IconFilePlus,
  IconBell,
} from "./icons";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clients": "Clients",
  "/clients/new": "Add Client",
  "/reports": "Reports",
  "/reports/new": "Generate Report",
};

const navSections = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", Icon: IconDashboard }],
  },
  {
    label: "Clients",
    items: [
      { to: "/clients", label: "All Clients", Icon: IconUsers },
      { to: "/clients/new", label: "Add Client", Icon: IconUserPlus },
    ],
  },
  {
    label: "Reports",
    items: [
      { to: "/reports", label: "All Reports", Icon: IconFileText },
      { to: "/reports/new", label: "Generate Report", Icon: IconFilePlus },
    ],
  },
];

function NavItem({ to, label, Icon }: { to: string; label: string; Icon: React.FC<{ className?: string }> }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
          isActive
            ? "bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
            : "text-white/55 hover:bg-white/10 hover:text-white/90"
        }`
      }
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </NavLink>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? "";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col overflow-y-auto" style={{ backgroundColor: "#1e3a5f" }}>
        <div className="px-5 py-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/90 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-xs font-bold tracking-tight">AW</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">AW Portal</p>
              <p className="text-white/40 text-[11px] leading-tight mt-0.5">Financial Planning</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem key={item.to} {...item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 ring-1 ring-white/10">
              <span className="text-white/90 text-[11px] font-semibold">IU</span>
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-xs font-medium truncate">Isha Umar</p>
              <p className="text-white/35 text-[10px] truncate">Advisor</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top navbar */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <h1 className="text-sm font-semibold text-gray-800 tracking-[-0.01em]">{pageTitle}</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-150">
              <IconBell className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-blue-100">
              <span className="text-white text-[11px] font-semibold">AW</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
