const styles: Record<string, string> = {
  Q1: "bg-blue-50 text-blue-700",
  Q2: "bg-indigo-50 text-indigo-700",
  Q3: "bg-violet-50 text-violet-700",
  Q4: "bg-purple-50 text-purple-700",
};

interface BadgeProps {
  label: string;
  variant?: string;
}

export default function Badge({ label, variant }: BadgeProps) {
  const cls = variant ? styles[variant] ?? "bg-gray-100 text-gray-600" : "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide ${cls}`}>
      {label}
    </span>
  );
}
