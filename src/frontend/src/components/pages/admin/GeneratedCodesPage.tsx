import { useState } from "react";
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

export default function GeneratedCodesPage() {
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
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {FUND_TYPES.map((fund) => (
          <button
            type="button"
            key={fund}
            data-ocid={`codes.generate_${fund}.button`}
            onClick={() => generateCode(fund)}
            className="bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors"
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
          className="text-center text-zinc-600 py-12"
        >
          <p>No codes generated yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map((c, i) => (
            <div
              key={c.code}
              data-ocid={`codes.item.${i + 1}`}
              className={`bg-zinc-900 border rounded-xl p-4 flex items-center justify-between ${
                c.isUsed ? "border-zinc-800 opacity-60" : "border-zinc-700"
              }`}
            >
              <div>
                <div className="font-mono text-lg tracking-widest text-amber-400">
                  {c.code}
                </div>
                <div className="text-xs text-zinc-500">
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
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg"
                  >
                    {copiedCode === c.code ? "✓ Copied" : "Copy"}
                  </button>
                )}
                <button
                  type="button"
                  data-ocid={`codes.delete_button.${i + 1}`}
                  onClick={() => handleDelete(c.code)}
                  className="text-xs bg-red-950/30 text-red-400 border border-red-900 px-3 py-1.5 rounded-lg hover:bg-red-900/40"
                >
                  Delete
                </button>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${c.isUsed ? "text-red-400 bg-red-950/30 border border-red-900" : "text-green-400 bg-green-950/30 border border-green-800"}`}
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
