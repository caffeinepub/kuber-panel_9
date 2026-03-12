import { useState } from "react";
import type { AuthUser, Page } from "../../App";
import PageHeader from "../ui/PageHeader";

interface Withdrawal {
  id: string;
  method: string;
  transferMode?: string;
  amount: number;
  status: "pending" | "approved";
  createdAt: string;
  approvedAt?: string;
  transactionId?: string;
  rrn?: string;
  utrNumber: string;
  reference: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  ifscCode?: string;
  branch?: string;
  upiId?: string;
  walletAddress?: string;
  details: Record<string, string>;
}

const TYPE_BADGE: Record<string, { bg: string; color: string; label: string }> =
  {
    upi: { bg: "#1e3a8a", color: "#93c5fd", label: "UPI" },
    bank: { bg: "#14532d", color: "#86efac", label: "BANK" },
    usdt: { bg: "#4a1d96", color: "#c4b5fd", label: "USDT" },
  };

function printReceipt(w: Withdrawal) {
  const dateStr = new Date(w.createdAt).toLocaleDateString("en-IN");
  const timeStr = new Date(w.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const html = `<!DOCTYPE html>
<html>
<head><title>Kuber Panel Receipt</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
  .header { text-align: center; margin-bottom: 20px; }
  .brand { color: #d4a017; font-size: 22px; font-weight: bold; letter-spacing: 2px; }
  .sub { color: #666; font-size: 12px; }
  .badge { display: inline-block; background: #d4a017; color: #000; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; letter-spacing: 1px; margin-top: 4px; }
  .divider { border: 1px solid #d4a017; margin: 16px 0; }
  .stamp { border: 3px solid #22c55e; display: inline-block; padding: 4px 16px; font-weight: bold; font-size: 16px; letter-spacing: 2px; color: #22c55e; transform: rotate(-3deg); margin: 10px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  tr:nth-child(even) td { background: #f9f9f9; }
  td { padding: 8px 10px; border-bottom: 1px solid #eee; }
  td:first-child { color: #666; width: 40%; }
  td:last-child { font-weight: 500; }
  .amount-val { color: #d4a017; font-weight: bold; }
  .status-val { color: #22c55e; font-weight: bold; }
  .footer { text-align: center; font-size: 11px; color: #999; margin-top: 30px; }
</style>
</head>
<body>
<div class="header">
  <div class="brand">KUBER PANEL</div>
  <div class="sub">Financial Management Platform</div>
  <div class="badge">WITHDRAWAL RECEIPT</div>
</div>
<hr class="divider"/>
<div style="text-align:center; margin: 16px 0;">
  <span class="stamp">TRANSFER SUCCESSFUL</span>
</div>
<table>
  <tr><td>Transaction ID</td><td>${w.transactionId || "N/A"}</td></tr>
  <tr><td>Reference Number</td><td>${w.reference}</td></tr>
  <tr><td>UTR Number</td><td>${w.utrNumber}</td></tr>
  ${w.bankName ? `<tr><td>Bank Name</td><td>${w.bankName}</td></tr>` : ""}
  ${w.accountNumber ? `<tr><td>Account Number</td><td>${w.accountNumber}</td></tr>` : ""}
  ${w.accountHolder ? `<tr><td>Account Holder</td><td>${w.accountHolder}</td></tr>` : ""}
  ${w.ifscCode ? `<tr><td>IFSC Code</td><td>${w.ifscCode}</td></tr>` : ""}
  ${w.branch ? `<tr><td>Branch</td><td>${w.branch}</td></tr>` : ""}
  ${w.upiId ? `<tr><td>UPI ID</td><td>${w.upiId}</td></tr>` : ""}
  ${w.walletAddress ? `<tr><td>Wallet Address</td><td>${w.walletAddress}</td></tr>` : ""}
  <tr><td>Transfer Mode</td><td>${w.transferMode || w.method.toUpperCase()}</td></tr>
  <tr><td>Amount</td><td class="amount-val">₹${w.amount.toLocaleString("en-IN")}</td></tr>
  <tr><td>Date</td><td>${dateStr}</td></tr>
  <tr><td>Time</td><td>${timeStr}</td></tr>
  <tr><td>Status</td><td class="status-val">Transfer Successful ✓</td></tr>
</table>
<div class="footer">
  <p>This is a computer generated receipt. No signature required.</p>
  <p>© 2026 Kuber Panel. All rights reserved.</p>
</div>
</body>
</html>`;
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.print();
  }
}

function downloadReceipt(w: Withdrawal) {
  const dateStr = new Date(w.createdAt).toLocaleDateString("en-IN");
  const text = `KUBER PANEL - WITHDRAWAL RECEIPT
====================================
Transaction ID    : ${w.transactionId || "N/A"}
Reference Number  : ${w.reference}
UTR Number        : ${w.utrNumber}
${w.bankName ? `Bank Name         : ${w.bankName}` : ""}
${w.accountNumber ? `Account Number    : ${w.accountNumber}` : ""}
${w.accountHolder ? `Account Holder    : ${w.accountHolder}` : ""}
${w.ifscCode ? `IFSC Code         : ${w.ifscCode}` : ""}
${w.branch ? `Branch            : ${w.branch}` : ""}
${w.upiId ? `UPI ID            : ${w.upiId}` : ""}
Transfer Mode     : ${w.transferMode || w.method.toUpperCase()}
Amount            : ₹${w.amount.toLocaleString("en-IN")}
Date              : ${dateStr}
Status            : Transfer Successful

© 2026 Kuber Panel. All rights reserved.`;
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `kuber_receipt_${w.id}.txt`;
  a.click();
}

export default function WithdrawalHistoryPage({
  user,
  setCurrentPage,
}: {
  user: AuthUser;
  setCurrentPage?: (p: Page) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Only show real withdrawals from localStorage — no mock data
  const stored: Withdrawal[] = JSON.parse(
    localStorage.getItem(`kuber_withdrawals_${user.email}`) || "[]",
  );
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const allWithdrawals = stored.filter(
    (w) => new Date(w.createdAt).getTime() > cutoff,
  );

  const selected = allWithdrawals.find((w) => w.id === selectedId);

  const dateStr = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };
  const timeStr = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div>
      <PageHeader
        title="Withdrawal History"
        subtitle="All your withdrawal transactions"
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      {selected && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "#0a0a0a" }}
        >
          {/* Sticky header bar */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{
              background: "#111111",
              borderBottom: "1px solid #2a2a2a",
            }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: "#f5c842" }}>🕐</span>
              <span className="text-white font-bold text-lg">
                Withdrawal Details
              </span>
            </div>
            <button
              type="button"
              data-ocid="withdrawal_history.close.button"
              onClick={() => setSelectedId(null)}
              className="text-zinc-400 hover:text-white text-xl font-bold"
            >
              ×
            </button>
          </div>
          <div
            className="flex-1 overflow-y-auto"
            style={{ background: "#0a0a0a" }}
          >
            <div className="p-5">
              <div className="space-y-0">
                {[
                  ["Transaction ID", selected.transactionId || "N/A"],
                  ["Reference Number", selected.reference],
                  ["UTR Number", selected.utrNumber],
                  ...(selected.bankName
                    ? [["Bank Name", selected.bankName]]
                    : []),
                  ...(selected.accountNumber
                    ? [["Account No.", selected.accountNumber]]
                    : []),
                  ...(selected.accountHolder
                    ? [["Account Holder", selected.accountHolder]]
                    : []),
                  ...(selected.ifscCode
                    ? [["IFSC Code", selected.ifscCode]]
                    : []),
                  ...(selected.branch ? [["Branch", selected.branch]] : []),
                  ...(selected.upiId ? [["UPI ID", selected.upiId]] : []),
                  ...(selected.walletAddress
                    ? [["Wallet Address", selected.walletAddress]]
                    : []),
                  [
                    "Transfer Mode",
                    selected.transferMode || selected.method.toUpperCase(),
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-start justify-between py-3"
                    style={{ borderBottom: "1px solid #333333" }}
                  >
                    <span
                      className="text-zinc-400 text-sm flex-shrink-0 mr-4"
                      style={{ minWidth: 130 }}
                    >
                      {label}
                    </span>
                    <span className="text-white text-sm font-semibold text-right break-all">
                      {value}
                    </span>
                  </div>
                ))}
                <div
                  className="flex items-start justify-between py-3"
                  style={{ borderBottom: "1px solid #333333" }}
                >
                  <span
                    className="text-zinc-400 text-sm flex-shrink-0 mr-4"
                    style={{ minWidth: 130 }}
                  >
                    Amount
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#f5c842" }}
                  >
                    ₹{selected.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div
                  className="flex items-start justify-between py-3"
                  style={{ borderBottom: "1px solid #333333" }}
                >
                  <span
                    className="text-zinc-400 text-sm flex-shrink-0 mr-4"
                    style={{ minWidth: 130 }}
                  >
                    Date
                  </span>
                  <span className="text-white text-sm font-semibold">
                    {dateStr(selected.createdAt)}
                  </span>
                </div>
                <div
                  className="flex items-start justify-between py-3"
                  style={{ borderBottom: "1px solid #333333" }}
                >
                  <span
                    className="text-zinc-400 text-sm flex-shrink-0 mr-4"
                    style={{ minWidth: 130 }}
                  >
                    Time
                  </span>
                  <span className="text-white text-sm font-semibold">
                    {timeStr(selected.createdAt)}
                  </span>
                </div>
                <div className="flex items-start justify-between py-3">
                  <span
                    className="text-zinc-400 text-sm flex-shrink-0 mr-4"
                    style={{ minWidth: 130 }}
                  >
                    Status
                  </span>
                  <span
                    className="flex items-center gap-1.5 text-sm font-bold"
                    style={{ color: "#22c55e" }}
                  >
                    <span>✓</span>
                    {selected.status === "approved"
                      ? "Transfer Successful"
                      : "Pending"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  data-ocid="withdrawal_history.print.button"
                  onClick={() => printReceipt(selected)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                  style={{
                    border: "1.5px solid #d4a017",
                    color: "#f5c842",
                    background: "transparent",
                  }}
                >
                  🖨️ Print Receipt
                </button>
                <button
                  type="button"
                  data-ocid="withdrawal_history.download.button"
                  onClick={() => downloadReceipt(selected)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-black"
                  style={{
                    background: "linear-gradient(135deg, #d4a017, #f5c842)",
                  }}
                >
                  ⬇️ Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {allWithdrawals.length === 0 ? (
        <div
          data-ocid="withdrawal_history.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center rounded-2xl"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <div className="text-5xl mb-4">🕐</div>
          <div className="text-lg font-bold mb-2" style={{ color: "#d4a017" }}>
            No Withdrawal History
          </div>
          <div className="text-sm max-w-xs" style={{ color: "#666" }}>
            Your withdrawal transactions will appear here once you make a
            withdrawal request.
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid #333333" }}
          >
            <span className="text-zinc-400 text-sm">
              {allWithdrawals.length} withdrawal
              {allWithdrawals.length > 1 ? "s" : ""} found
            </span>
          </div>

          <div
            style={{
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              background: "#111",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr 90px 80px 90px",
                minWidth: 420,
                padding: "8px 16px",
                color: "#71717a",
                fontSize: 12,
                borderBottom: "1px solid #333333",
              }}
            >
              <div>Type</div>
              <div>Bank / Method</div>
              <div>Account</div>
              <div>Amount</div>
              <div>Date</div>
            </div>

            {allWithdrawals.map((w, i) => {
              const badge = TYPE_BADGE[w.method] || TYPE_BADGE.bank;
              const methodLabel =
                w.method === "bank"
                  ? w.bankName || "Bank Transfer"
                  : w.method === "upi"
                    ? w.upiId || "UPI"
                    : "USDT TRC20";
              const accStr =
                w.method === "bank" && w.accountNumber
                  ? `...${w.accountNumber.slice(-3)}`
                  : "—";

              return (
                <button
                  key={w.id}
                  type="button"
                  data-ocid={`withdrawal_history.item.${i + 1}`}
                  onClick={() => setSelectedId(w.id)}
                  className="w-full text-left hover:bg-zinc-800/50 transition-colors"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "70px 1fr 90px 80px 90px",
                    minWidth: 420,
                    padding: "12px 16px",
                    borderBottom: "1px solid #1a1a1a",
                  }}
                >
                  <div>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div
                    className="text-white text-xs font-semibold"
                    style={{
                      paddingTop: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      paddingRight: 8,
                    }}
                  >
                    {methodLabel}
                  </div>
                  <div
                    className="text-zinc-400 text-xs"
                    style={{ paddingTop: 2 }}
                  >
                    {accStr}
                  </div>
                  <div
                    className="text-xs font-bold"
                    style={{ color: "#f5c842", paddingTop: 2 }}
                  >
                    {w.method === "usdt"
                      ? `₮ ${w.amount.toLocaleString()}`
                      : `₹${w.amount.toLocaleString()}`}
                  </div>
                  <div
                    className="text-zinc-500 text-xs"
                    style={{ paddingTop: 2 }}
                  >
                    {dateStr(w.createdAt)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
