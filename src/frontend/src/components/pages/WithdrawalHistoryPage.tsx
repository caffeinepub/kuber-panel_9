import { useState } from "react";
import type { AuthUser } from "../../App";
import PageHeader from "../ui/PageHeader";

interface Withdrawal {
  id: string;
  method: string;
  transferMode?: string;
  amount: number;
  status: "pending" | "approved";
  createdAt: string;
  approvedAt?: string;
  utrNumber: string;
  reference: string;
  details: Record<string, string>;
}

export default function WithdrawalHistoryPage({ user }: { user: AuthUser }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const withdrawals: Withdrawal[] = JSON.parse(
    localStorage.getItem(`kuber_withdrawals_${user.email}`) || "[]",
  );

  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = withdrawals.filter(
    (w) => new Date(w.createdAt).getTime() > cutoff,
  );
  const selected = recent.find((w) => w.id === selectedId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!selected) return;
    const text = `KUBER PANEL - WITHDRAWAL RECEIPT
====================================
Reference: ${selected.reference}
UTR Number: ${selected.utrNumber}
Amount: INR ${selected.amount.toLocaleString()}
Method: ${selected.method.toUpperCase()}${selected.transferMode ? ` (${selected.transferMode})` : ""}
Status: ${selected.status.toUpperCase()}
Date: ${new Date(selected.createdAt).toLocaleString()}
${selected.approvedAt ? `Approved: ${new Date(selected.approvedAt).toLocaleString()}` : ""}
Details: ${JSON.stringify(selected.details, null, 2)}
`;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `receipt_${selected.reference}.txt`;
    a.click();
  };

  return (
    <div>
      <PageHeader
        title="Withdrawal History"
        subtitle="Last 30 days withdrawal records"
      />

      {selected && (
        <div
          data-ocid="withdrawal_history.receipt.panel"
          className="bg-zinc-900 border border-amber-800 rounded-xl p-6 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-amber-400 font-bold text-lg">
                Withdrawal Receipt
              </div>
              <div className="text-xs text-zinc-500">
                {new Date(selected.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="withdrawal_history.print.button"
                onClick={handlePrint}
                className="text-xs bg-zinc-800 text-white px-3 py-1.5 rounded-lg hover:bg-zinc-700"
              >
                🖨️ Print
              </button>
              <button
                type="button"
                data-ocid="withdrawal_history.download.button"
                onClick={handleDownload}
                className="text-xs bg-amber-500 text-black font-bold px-3 py-1.5 rounded-lg hover:bg-amber-400"
              >
                ⬇️ Download
              </button>
              <button
                type="button"
                data-ocid="withdrawal_history.close.button"
                onClick={() => setSelectedId(null)}
                className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-lg hover:bg-zinc-700"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Reference", selected.reference],
              ["UTR Number", selected.utrNumber],
              ["Amount", `₹${selected.amount.toLocaleString()}`],
              [
                "Method",
                selected.method.toUpperCase() +
                  (selected.transferMode ? ` (${selected.transferMode})` : ""),
              ],
              ["Status", selected.status.toUpperCase()],
              ...(selected.approvedAt
                ? [
                    [
                      "Approved At",
                      new Date(selected.approvedAt).toLocaleString(),
                    ],
                  ]
                : []),
              ...Object.entries(selected.details).map(([k, v]) => [k, v]),
            ].map(([label, value]) => (
              <div key={label} className="bg-zinc-800 rounded-lg p-3">
                <div className="text-zinc-500 text-xs uppercase tracking-wider">
                  {label}
                </div>
                <div className="text-white font-mono text-sm break-all">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recent.length === 0 ? (
        <div
          data-ocid="withdrawal_history.empty_state"
          className="text-center text-zinc-600 py-16"
        >
          <div className="text-4xl mb-3">🧾</div>
          <p>No withdrawal history.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recent.map((w, i) => (
            <button
              type="button"
              key={w.id}
              data-ocid={`withdrawal_history.item.${i + 1}`}
              onClick={() => setSelectedId(selectedId === w.id ? null : w.id)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors text-left"
            >
              <div>
                <div className="text-white font-medium">
                  ₹{w.amount.toLocaleString()}
                </div>
                <div className="text-zinc-500 text-xs">
                  {w.method.toUpperCase()} |{" "}
                  {new Date(w.createdAt).toLocaleDateString()}
                </div>
                <div className="text-zinc-600 text-xs font-mono">
                  {w.utrNumber}
                </div>
              </div>
              <span
                className={`text-xs border px-2 py-1 rounded-full ${
                  w.status === "approved"
                    ? "text-green-400 bg-green-950/30 border-green-800"
                    : "text-amber-400 bg-amber-950/30 border-amber-800"
                }`}
              >
                {w.status.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
