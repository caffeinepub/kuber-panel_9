import { useState } from "react";
import type { Page } from "../../../App";
import PageHeader from "../../ui/PageHeader";

const FUND_TYPES = ["gaming", "stock", "mix", "political", "all"] as const;
const FUND_LABELS: Record<string, string> = {
  gaming: "Gaming Fund",
  stock: "Stock Fund",
  mix: "Mix Fund",
  political: "Political Fund",
  all: "All Funds",
};

interface ActivationCode {
  code: string;
  fundType: string;
  isUsed: boolean;
  usedBy?: string;
  createdAt: string;
}

function genCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 12 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export default function GeneratedCodesPage({
  setCurrentPage,
}: {
  setCurrentPage?: (p: Page) => void;
}) {
  const [codes, setCodes] = useState<ActivationCode[]>(() =>
    JSON.parse(localStorage.getItem("kuber_activation_codes") || "[]"),
  );
  const [copiedCode, setCopiedCode] = useState("");

  const generateCode = (fundType: string) => {
    const newCode: ActivationCode = {
      code: genCode(),
      fundType,
      isUsed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newCode, ...codes];
    setCodes(updated);
    localStorage.setItem("kuber_activation_codes", JSON.stringify(updated));
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const handleDelete = (code: string) => {
    const updated = codes.filter((c) => c.code !== code);
    setCodes(updated);
    localStorage.setItem("kuber_activation_codes", JSON.stringify(updated));
  };

  return (
    <div>
      <PageHeader
        title="Generated Codes"
        subtitle="Generate activation codes for users"
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {FUND_TYPES.map((fund) => (
          <button
            type="button"
            key={fund}
            data-ocid={`codes.generate_${fund}.button`}
            onClick={() => generateCode(fund)}
            className="rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:border-amber-500 text-white"
            style={{ background: "#111111", border: "1px solid #333333" }}
          >
            + Generate
            <br />
            <span className="text-amber-400 text-xs">{FUND_LABELS[fund]}</span>
          </button>
        ))}
      </div>

      {codes.length === 0 ? (
        <div
          data-ocid="codes.empty_state"
          className="text-center py-12"
          style={{ color: "#5a7ab0" }}
        >
          <p>No codes generated yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map((c, i) => (
            <div
              key={c.code}
              data-ocid={`codes.item.${i + 1}`}
              className="rounded-xl p-4 flex items-center justify-between"
              style={{
                background: "#111111",
                border: `1px solid ${c.isUsed ? "#2a2a2a" : "#333333"}`,
                opacity: c.isUsed ? 0.6 : 1,
              }}
            >
              <div>
                <div className="font-mono text-lg tracking-widest text-amber-400">
                  {c.code}
                </div>
                <div className="text-xs" style={{ color: "#5a7ab0" }}>
                  {FUND_LABELS[c.fundType]} |{" "}
                  {new Date(c.createdAt).toLocaleDateString()}
                  {c.isUsed && (
                    <span className="ml-2 text-red-400">
                      • Used by {c.usedBy}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!c.isUsed && (
                  <button
                    type="button"
                    data-ocid={`codes.copy.${i + 1}`}
                    onClick={() => handleCopy(c.code)}
                    className="text-xs text-white px-3 py-1.5 rounded-lg"
                    style={{
                      background: "#07112a",
                      border: "1px solid #333333",
                    }}
                  >
                    {copiedCode === c.code ? "✓ Copied" : "Copy"}
                  </button>
                )}
                <button
                  type="button"
                  data-ocid={`codes.delete_button.${i + 1}`}
                  onClick={() => handleDelete(c.code)}
                  className="text-xs text-red-400 border border-red-900 px-3 py-1.5 rounded-lg hover:bg-red-900/40"
                  style={{ background: "rgba(239,68,68,0.08)" }}
                >
                  Delete
                </button>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    c.isUsed
                      ? "text-red-400 bg-red-950/30 border border-red-900"
                      : "text-green-400 bg-green-950/30 border border-green-800"
                  }`}
                >
                  {c.isUsed ? "Used" : "Active"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
