interface P { className?: string }

const base = "fill-none stroke-current stroke-[1.75] [stroke-linecap:round] [stroke-linejoin:round]";

export function IconDashboard({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export function IconUsers({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconUserPlus({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="17" y1="11" x2="23" y2="11" />
    </svg>
  );
}

export function IconFileText({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

export function IconFilePlus({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

export function IconTrendingUp({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export function IconDollar({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export function IconBarChart({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export function IconArrowLeft({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function IconBell({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function IconCheck({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-none stroke-current [stroke-width:2.5] [stroke-linecap:round] [stroke-linejoin:round] ${className}`}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconPlus({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function IconTrash({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export function IconDownload({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
