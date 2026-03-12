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

// Generate realistic mock data for display purposes
function getMockWithdrawals(): Withdrawal[] {
  const methods = [
    "bank",
    "upi",
    "usdt",
    "bank",
    "bank",
    "upi",
    "usdt",
    "bank",
  ];
  const banks = [
    {
      bankName: "State Bank of India",
      accountNumber: "4233629869979",
      accountHolder: "PREMLJIT LAKHANI",
      ifscCode: "SBIN0011214",
      branch: "State Bank of India — Branch 0112",
    },
    {
      bankName: "Indian Overseas Bank",
      accountNumber: "9876543219979",
      accountHolder: "RAJESH KUMAR",
      ifscCode: "IOBA0002345",
      branch: "Indian Overseas Bank — Branch 0456",
    },
    {
      bankName: "HDFC Bank",
      accountNumber: "5012345678888",
      accountHolder: "SURESH PATEL",
      ifscCode: "HDFC0001234",
      branch: "HDFC Bank — Branch 0789",
    },
  ];
  const upis = ["kushum7889@ybl", "8937262615@ptyes", "9998768706@ybl"];
  const amounts = [
    16850, 45280, 5500, 678054, 7854, 138148, 7000, 3540, 1587500, 45200, 500,
    23000, 8500, 12000, 65000, 9800, 34500, 78000, 15000, 42000, 6700, 89000,
    3200, 56000, 11000, 28000, 19500,
  ];

  return amounts.map((amt, i) => {
    const method = methods[i % methods.length];
    const bank = banks[i % banks.length];
    const upi = upis[i % upis.length];
    return {
      id: `mock_${i}`,
      method,
      transferMode:
        method === "bank" ? ["IMPS", "NEFT", "RTGS"][i % 3] : undefined,
      amount: amt,
      status: "approved" as const,
      createdAt: new Date(
        2026,
        2,
        11 - Math.floor(i / 3),
        11,
        30 - i,
        0,
      ).toISOString(),
      approvedAt: new Date(
        2026,
        2,
        11 - Math.floor(i / 3),
        11,
        40,
        0,
      ).toISOString(),
      transactionId: `0${String(Math.floor(Math.random() * 1e11)).padStart(12, "0")}`,
      rrn: String(Math.floor(Math.random() * 1e12)).padStart(12, "0"),
      utrNumber: String(Math.floor(Math.random() * 1e12)).padStart(12, "0"),
      reference: `REF${String(Math.floor(Math.random() * 1e10)).padStart(10, "0")}`,
      bankName: method === "bank" ? bank.bankName : undefined,
      accountNumber: method === "bank" ? bank.accountNumber : undefined,
      accountHolder: method === "bank" ? bank.accountHolder : undefined,
      ifscCode: method === "bank" ? bank.ifscCode : undefined,
      branch: method === "bank" ? bank.branch : undefined,
      upiId: method === "upi" ? upi : undefined,
      walletAddress:
        method === "usdt" ? "TRX9k8mN3pQwErTy2uLopAsBv..." : undefined,
      details: (method === "bank"
        ? { bankName: bank.bankName, accountNumber: bank.accountNumber }
        : method === "upi"
          ? { upiId: upi }
          : {
              walletAddress: "TRX9k8mN3pQwErTy2uLopAsBv...",
              network: "TRC20",
            }) as Record<string, string>,
    };
  });
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
  <tr><td>Transaction ID</td><td>${w.transactionId || w.reference}</td></tr>
  <tr><td>RRN (Reference)</td><td>${w.rrn || w.reference}</td></tr>
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
Transaction ID: ${w.transactionId || w.reference}
RRN (Reference): ${w.rrn || w.reference}
UTR Number: ${w.utrNumber}
${w.bankName ? `Bank Name: ${w.bankName}` : ""}
${w.accountNumber ? `Account Number: ${w.accountNumber}` : ""}
${w.accountHolder ? `Account Holder: ${w.accountHolder}` : ""}
${w.ifscCode ? `IFSC Code: ${w.ifscCode}` : ""}
${w.branch ? `Branch: ${w.branch}` : ""}
${w.upiId ? `UPI ID: ${w.upiId}` : ""}
Transfer Mode: ${w.transferMode || w.method.toUpperCase()}
Amount: ₹${w.amount.toLocaleString("en-IN")}
Date: ${dateStr}
Status: Transfer Successful

© 2026 Kuber Panel. All rights reserved.`;
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `kuber_receipt_${w.transactionId || w.reference}.txt`;
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

  const stored: Withdrawal[] = JSON.parse(
    localStorage.getItem(`kuber_withdrawals_${user.email}`) || "[]",
  );

  // Use stored data if exists, otherwise show mock data for display
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const storedRecent = stored.filter(
    (w) => new Date(w.createdAt).getTime() > cutoff,
  );
  const allWithdrawals =
    storedRecent.length > 0 ? storedRecent : getMockWithdrawals();

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
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #3e2800, #795548)" }}
        >
          <span className="text-2xl">🕐</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Withdrawal History</h1>
          <p className="text-zinc-400 text-sm">Last 30 days of withdrawals</p>
        </div>
      </div>

      {/* Withdrawal Details Modal */}
      {selected && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: modal overlay closes on outside click
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setSelectedId(null)}
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation on modal content */}
          <div
            className="w-full max-w-sm rounded-2xl p-5 overflow-y-auto"
            style={{
              background: "#111111",
              border: "1px solid #2a2a2a",
              maxHeight: "85vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
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

            {/* Detail rows */}
            <div className="space-y-0">
              {[
                [
                  "Transaction ID",
                  selected.transactionId || selected.reference,
                ],
                ["RRN (Reference)", selected.rrn || selected.reference],
                ["UTR Number", selected.utrNumber],
                ...(selected.bankName
                  ? [["Bank Name", selected.bankName]]
                  : []),
                ...(selected.accountNumber
                  ? [["Account No.", selected.accountNumber]]
                  : []),
                ...(selected.accountHolder
                  ? [["Holder Name", selected.accountHolder]]
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
                  <span className="text-zinc-400 text-sm">{label}</span>
                  <span className="text-white text-sm font-semibold text-right max-w-[55%] break-all">
                    {value}
                  </span>
                </div>
              ))}
              <div
                className="flex items-start justify-between py-3"
                style={{ borderBottom: "1px solid #333333" }}
              >
                <span className="text-zinc-400 text-sm">Amount</span>
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
                <span className="text-zinc-400 text-sm">Date</span>
                <span className="text-white text-sm font-semibold">
                  {dateStr(selected.createdAt)}
                </span>
              </div>
              <div
                className="flex items-start justify-between py-3"
                style={{ borderBottom: "1px solid #333333" }}
              >
                <span className="text-zinc-400 text-sm">Time</span>
                <span className="text-white text-sm font-semibold">
                  {timeStr(selected.createdAt)}
                </span>
              </div>
              <div className="flex items-start justify-between py-3">
                <span className="text-zinc-400 text-sm">Status</span>
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

            {/* Action buttons */}
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
      )}

      {/* Table card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#111111", border: "1px solid #333333" }}
      >
        {/* Count */}
        <div
          className="px-4 py-3"
          style={{ borderBottom: "1px solid #333333" }}
        >
          <span className="text-zinc-400 text-sm">
            {allWithdrawals.length} withdrawals found
          </span>
        </div>

        {/* Header row */}
        <div
          className="grid px-4 py-2 text-xs"
          style={{
            gridTemplateColumns: "70px 1fr 90px 80px 90px",
            color: "#71717a",
            borderBottom: "1px solid #333333",
          }}
        >
          <div>Type</div>
          <div>Bank / Method</div>
          <div>Account</div>
          <div>Amount</div>
          <div>Date</div>
        </div>

        {/* Rows */}
        {allWithdrawals.map((w, i) => {
          const badge = TYPE_BADGE[w.method] || TYPE_BADGE.bank;
          const methodLabel =
            w.method === "bank"
              ? w.bankName || "Bank Transfer"
              : w.method === "upi"
                ? w.upiId || "UPI"
                : w.walletAddress
                  ? "USDT TRC20"
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
              className="w-full grid px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors"
              style={{
                gridTemplateColumns: "70px 1fr 90px 80px 90px",
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
                className="text-white text-xs font-semibold truncate pr-2"
                style={{ paddingTop: "2px" }}
              >
                {methodLabel}
              </div>
              <div
                className="text-zinc-400 text-xs"
                style={{ paddingTop: "2px" }}
              >
                {accStr}
              </div>
              <div
                className="text-xs font-bold"
                style={{ color: "#f5c842", paddingTop: "2px" }}
              >
                {w.method === "usdt"
                  ? `₮ ${w.amount.toLocaleString()}`
                  : `₹${w.amount.toLocaleString()}`}
              </div>
              <div
                className="text-zinc-500 text-xs"
                style={{ paddingTop: "2px" }}
              >
                {dateStr(w.createdAt)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
