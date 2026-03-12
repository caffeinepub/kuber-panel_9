import type { Page } from "../../App";

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export default function PageHeader({ title, subtitle, onBack }: Props) {
  return (
    <div className="mb-6">
      {onBack && (
        <button
          type="button"
          data-ocid="page.back_to_dashboard.button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold mb-3 px-3 py-1.5 rounded-lg transition-colors"
          style={{
            background: "rgba(212,160,23,0.15)",
            border: "1px solid rgba(212,160,23,0.35)",
            color: "#f5c842",
          }}
        >
          ← Dashboard
        </button>
      )}
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {subtitle && (
        <p className="text-sm mt-1" style={{ color: "#8899c0" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export type { Page };
