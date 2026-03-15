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
  branchCity?: string;
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
  const html = `<!DOCTYPE html><html><head><title>Kuber Panel Receipt</title>
<style>body{font-family:Arial,sans-serif;max-width:500px;margin:30px auto;padding:20px;color:#111}
.header{text-align:center;border-bottom:2px solid #d4a017;padding-bottom:12px;margin-bottom:12px}
.brand{color:#d4a017;font-size:20px;font-weight:900;letter-spacing:3px}
.sub{color:#888;font-size:11px;letter-spacing:1px;margin-top:2px}
.receipt-title{display:inline-block;border:2px solid #22c55e;padding:3px 14px;font-weight:700;font-size:13px;letter-spacing:2px;color:#22c55e;margin-top:8px}
.amount{text-align:center;font-size:26px;font-weight:900;color:#d4a017;margin:12px 0 4px}
.ok{text-align:center;color:#22c55e;font-weight:700;font-size:14px;margin-bottom:12px}
table{width:100%;border-collapse:collapse;font-size:12px}td{padding:7px 8px;border-bottom:1px solid #eee}td:first-child{color:#666;width:140px}td:last-child{font-weight:600;font-family:monospace}
.footer{text-align:center;color:#aaa;font-size:10px;margin-top:14px;border-top:1px solid #ddd;padding-top:10px}
</style></head><body>
<div class="header">
<div class="brand">KUBER PANEL</div>
<div class="sub">Financial Management Platform</div>
<div class="receipt-title">WITHDRAWAL RECEIPT</div>
</div>
<div class="amount">₹${w.amount.toLocaleString("en-IN")}</div>
<div class="ok">✓ Transfer Successful</div>
<table>
<tr><td>UTR Number</td><td>${w.utrNumber}</td></tr>
<tr><td>Transaction ID</td><td>${w.transactionId || "N/A"}</td></tr>
<tr><td>Reference Number</td><td>${w.reference}</td></tr>
${w.bankName ? `<tr><td>Bank Name</td><td>${w.bankName}</td></tr>` : ""}
${w.accountNumber ? `<tr><td>Account Number</td><td>${w.accountNumber}</td></tr>` : ""}
${w.accountHolder ? `<tr><td>Account Holder</td><td>${w.accountHolder}</td></tr>` : ""}
${w.ifscCode ? `<tr><td>IFSC Code</td><td>${w.ifscCode}</td></tr>` : ""}
${w.branchCity ? `<tr><td>Branch / City</td><td>${w.branchCity}</td></tr>` : ""}
${w.upiId ? `<tr><td>UPI ID</td><td>${w.upiId}</td></tr>` : ""}
<tr><td>Date</td><td>${dateStr}</td></tr>
<tr><td>Time</td><td>${timeStr}</td></tr>
<tr><td>Status</td><td style="color:#22c55e;font-weight:bold">Transfer Successful ✓</td></tr>
</table>
<div class="footer">This is a computer generated receipt no signature required.<br/>© 2026 Kuber Panel. All rights reserved.</div>
</body></html>`;
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.print();
  }
}

function downloadReceipt(w: Withdrawal) {
  const dateStr = new Date(w.createdAt).toLocaleDateString("en-IN");
  const text = `KUBER PANEL - WITHDRAWAL RECEIPT\n${"=".repeat(36)}\nTransaction ID: ${w.transactionId || "N/A"}\nReference: ${w.reference}\nUTR: ${w.utrNumber}\n${w.bankName ? `Bank: ${w.bankName}\n` : ""}${w.accountNumber ? `Account: ${w.accountNumber}\n` : ""}${w.accountHolder ? `Holder: ${w.accountHolder}\n` : ""}${w.upiId ? `UPI: ${w.upiId}\n` : ""}Amount: ₹${w.amount.toLocaleString("en-IN")}\nDate: ${dateStr}\nStatus: Transfer Successful\n\n© 2026 Kuber Panel`;
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
  const timeStr = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  // Full screen detail view
  if (selected) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          background: "#000",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "#000",
            borderBottom: "1px solid #1a1a1a",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#f5c842", fontSize: 18 }}>🕐</span>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>
              Withdrawal Details
            </span>
          </div>
          <button
            type="button"
            data-ocid="withdrawal_history.close.button"
            onClick={() => setSelectedId(null)}
            style={{
              color: "#888",
              fontSize: 22,
              fontWeight: 700,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable content - full screen */}
        <div style={{ flex: 1, overflowY: "auto", background: "#000" }}>
          <div style={{ padding: "0 0 20px 0" }}>
            {[
              ["Transaction ID", selected.transactionId || "N/A"],
              ["Reference Number", selected.reference],
              ["UTR Number", selected.utrNumber],
              ...(selected.bankName ? [["Bank Name", selected.bankName]] : []),
              ...(selected.accountNumber
                ? [["Account No.", selected.accountNumber]]
                : []),
              ...(selected.accountHolder
                ? [["Account Holder", selected.accountHolder]]
                : []),
              ...(selected.ifscCode ? [["IFSC Code", selected.ifscCode]] : []),
              ...(selected.branch ? [["Branch", selected.branch]] : []),
              ...(selected.branchCity
                ? [["Branch / City", selected.branchCity]]
                : []),
              ...(selected.upiId ? [["UPI ID", selected.upiId]] : []),
              ...(selected.walletAddress
                ? [["Wallet", selected.walletAddress]]
                : []),
              [
                "Transfer Mode",
                selected.transferMode || selected.method.toUpperCase(),
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "9px 14px",
                  borderBottom: "1px solid #111",
                }}
              >
                <span
                  style={{
                    color: "#888",
                    fontSize: 12,
                    minWidth: 110,
                    flexShrink: 0,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    textAlign: "right",
                    wordBreak: "break-all",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "13px 16px",
                borderBottom: "1px solid #111",
              }}
            >
              <span style={{ color: "#888", fontSize: 14, minWidth: 130 }}>
                Amount
              </span>
              <span style={{ color: "#f5c842", fontSize: 14, fontWeight: 700 }}>
                ₹{selected.amount.toLocaleString("en-IN")}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "13px 16px",
                borderBottom: "1px solid #111",
              }}
            >
              <span style={{ color: "#888", fontSize: 14, minWidth: 130 }}>
                Date
              </span>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                {dateStr(selected.createdAt)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "13px 16px",
                borderBottom: "1px solid #111",
              }}
            >
              <span style={{ color: "#888", fontSize: 14, minWidth: 130 }}>
                Time
              </span>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                {timeStr(selected.createdAt)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "13px 16px",
              }}
            >
              <span style={{ color: "#888", fontSize: 14, minWidth: 130 }}>
                Status
              </span>
              <span style={{ color: "#22c55e", fontSize: 14, fontWeight: 700 }}>
                ✓ Transfer Successful
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12, padding: "16px 16px 0" }}>
              <button
                type="button"
                data-ocid="withdrawal_history.print.button"
                onClick={() => printReceipt(selected)}
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: 12,
                  border: "1.5px solid #d4a017",
                  color: "#f5c842",
                  background: "transparent",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                🖨️ Print Receipt
              </button>
              <button
                type="button"
                data-ocid="withdrawal_history.download.button"
                onClick={() => downloadReceipt(selected)}
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #d4a017, #f5c842)",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: 14,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ⬇️ Download
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view - full width
  return (
    <div style={{ background: "#000", minHeight: "100%" }}>
      <PageHeader
        title="Withdrawal History"
        subtitle="All your withdrawal transactions"
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      {allWithdrawals.length === 0 ? (
        <div
          data-ocid="withdrawal_history.empty_state"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            textAlign: "center",
            background: "#0a0a0a",
            borderRadius: 16,
            border: "1px solid #1a1a1a",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🕐</div>
          <div
            style={{
              color: "#d4a017",
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            No Withdrawal History
          </div>
          <div style={{ color: "#444", fontSize: 13 }}>
            Your withdrawal transactions will appear here.
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "#0a0a0a",
            border: "1px solid #1a1a1a",
            borderRadius: 16,
            overflow: "hidden",
            width: "100%",
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 80px 80px",
              padding: "10px 14px",
              borderBottom: "1px solid #1a1a1a",
              color: "#555",
              fontSize: 12,
            }}
          >
            <div>Type</div>
            <div>Method</div>
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
                  : "USDT";

            return (
              <button
                key={w.id}
                type="button"
                data-ocid={`withdrawal_history.item.${i + 1}`}
                onClick={() => setSelectedId(w.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 80px 80px",
                  width: "100%",
                  padding: "13px 14px",
                  textAlign: "left",
                  background: "transparent",
                  borderBottom: "1px solid #111",
                  cursor: "pointer",
                }}
              >
                <div>
                  <span
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
                <div
                  style={{
                    color: "#e5e5e5",
                    fontSize: 13,
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    paddingRight: 8,
                    paddingTop: 2,
                  }}
                >
                  {methodLabel}
                </div>
                <div
                  style={{
                    color: "#f5c842",
                    fontSize: 13,
                    fontWeight: 700,
                    paddingTop: 2,
                  }}
                >
                  {w.method === "usdt"
                    ? `₮${w.amount.toLocaleString()}`
                    : `₹${w.amount.toLocaleString()}`}
                </div>
                <div style={{ color: "#555", fontSize: 12, paddingTop: 3 }}>
                  {dateStr(w.createdAt)}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
