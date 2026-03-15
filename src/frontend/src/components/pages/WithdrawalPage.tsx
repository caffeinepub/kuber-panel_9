import { useEffect, useState } from "react";
import type { AuthUser, Page } from "../../App";
import PageHeader from "../ui/PageHeader";

interface BankAccount {
  id: string;
  accountType: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  mobileNumber: string;
  upiId: string;
  status: "pending" | "approved" | "rejected";
}

interface Withdrawal {
  id: string;
  method: "upi" | "bank" | "usdt";
  transferMode?: string;
  amount: number;
  status: "approved";
  createdAt: string;
  approvedAt: string;
  transactionId: string;
  rrn: string;
  utrNumber: string;
  reference: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  ifscCode?: string;
  branchCity?: string;
  upiId?: string;
  walletAddress?: string;
  details: Record<string, string>;
}

function rand(n: number): string {
  return Math.floor(Math.random() * n)
    .toString()
    .padStart(String(n).length - 1, "0");
}

async function fetchBranchCity(ifsc: string): Promise<string> {
  try {
    const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
    if (!res.ok) return "";
    const data = await res.json();
    return data.CITY ? `${data.BRANCH}, ${data.CITY}` : data.BRANCH || "";
  } catch {
    return "";
  }
}

export default function WithdrawalPage({
  user,
  setCurrentPage,
}: {
  user: AuthUser;
  setCurrentPage?: (p: Page) => void;
}) {
  const [tab, setTab] = useState<"upi" | "bank" | "usdt">("bank");
  const [transferMode, setTransferMode] = useState<"IMPS" | "NEFT" | "RTGS">(
    "IMPS",
  );
  const [selectedBankId, setSelectedBankId] = useState("");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [lastWithdrawal, setLastWithdrawal] = useState<Withdrawal | null>(null);
  const [branchCity, setBranchCity] = useState("");

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() =>
    JSON.parse(localStorage.getItem(`kuber_withdrawals_${user.email}`) || "[]"),
  );

  const banks: BankAccount[] = JSON.parse(
    localStorage.getItem(`kuber_banks_${user.email}`) || "[]",
  );
  const approvedBanks = banks.filter((b) => b.status === "approved");
  const selectedBank = approvedBanks.find((b) => b.id === selectedBankId);

  const commBalance = Number.parseFloat(
    localStorage.getItem(`kuber_commission_${user.email}`) || "0",
  );

  // Fetch branch city when bank changes
  useEffect(() => {
    setBranchCity("");
    if (selectedBank?.ifscCode) {
      fetchBranchCity(selectedBank.ifscCode).then(setBranchCity);
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  }, [selectedBank?.ifscCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number.parseFloat(amount);
    if (Number.isNaN(amt) || amt <= 0) {
      setMessage({ type: "err", text: "Invalid amount" });
      return;
    }
    if (amt > commBalance) {
      setMessage({ type: "err", text: "Insufficient commission balance" });
      return;
    }
    if (tab === "bank" && !selectedBankId) {
      setMessage({ type: "err", text: "Please select a bank account" });
      return;
    }

    let branch = branchCity;
    if (tab === "bank" && selectedBank?.ifscCode && !branch) {
      branch = await fetchBranchCity(selectedBank.ifscCode);
    }

    const now = new Date().toISOString();
    const w: Withdrawal = {
      id: Date.now().toString(),
      method: tab,
      transferMode: tab === "bank" ? transferMode : undefined,
      amount: amt,
      status: "approved",
      createdAt: now,
      approvedAt: now,
      transactionId: `0${rand(1000000000000)}`,
      rrn: `${rand(1000000000000)}`,
      utrNumber: `${rand(1000000000000)}`,
      reference: `REF${rand(10000000000)}`,
      bankName: selectedBank?.bankName,
      accountNumber: selectedBank?.accountNumber,
      accountHolder: selectedBank?.accountHolder,
      ifscCode: selectedBank?.ifscCode,
      branchCity: branch || undefined,
      upiId: tab === "upi" ? upiId : undefined,
      walletAddress: tab === "usdt" ? walletAddress : undefined,
      details:
        tab === "upi"
          ? { upiId }
          : tab === "bank"
            ? {
                bankName: selectedBank?.bankName || "",
                accountNumber: selectedBank?.accountNumber || "",
                ifsc: selectedBank?.ifscCode || "",
                transferMode,
              }
            : { walletAddress },
    };

    const updated = [w, ...withdrawals];
    setWithdrawals(updated);
    setLastWithdrawal(w);
    localStorage.setItem(
      `kuber_withdrawals_${user.email}`,
      JSON.stringify(updated),
    );
    localStorage.setItem(
      `kuber_commission_${user.email}`,
      String(commBalance - amt),
    );
    setMessage({ type: "ok", text: "Transfer Successful" });
    setAmount("");
    setSelectedBankId("");
    setUpiId("");
    setWalletAddress("");
  };

  const inp =
    "w-full rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none text-sm";
  const inpStyle = { background: "#111111", border: "1px solid #333333" };

  const MODES = [
    {
      id: "IMPS" as const,
      title: "IMPS",
      sub1: "Up to ₹5 Lakh",
      sub2: "Instant 24x7",
    },
    {
      id: "NEFT" as const,
      title: "NEFT",
      sub1: "No Limit",
      sub2: "Mon–Sat (Hourly)",
    },
    {
      id: "RTGS" as const,
      title: "RTGS",
      sub1: "Min ₹2 Lakh",
      sub2: "High Value",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Withdrawal"
        subtitle="Request a withdrawal from your account"
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      {/* Transfer Successful confirmation card */}
      {message?.type === "ok" && lastWithdrawal && (
        <div
          data-ocid="withdrawal.success_state"
          className="rounded-2xl mb-5"
          style={{ background: "#000", border: "1.5px solid #d4a017" }}
        >
          {/* Receipt Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #1a1200, #0d0d00)",
              borderBottom: "1px solid #2a2000",
              padding: "14px 16px",
              textAlign: "center",
              borderRadius: "14px 14px 0 0",
            }}
          >
            <img
              src="/assets/uploads/IMG_20260311_153614_686-removebg-preview-1.png"
              alt="Kuber Panel"
              loading="eager"
              style={{
                width: 60,
                height: "auto",
                objectFit: "contain",
                marginBottom: 4,
              }}
            />
            <div
              style={{
                color: "#f5c842",
                fontWeight: 900,
                fontSize: 15,
                letterSpacing: "0.1em",
              }}
            >
              KUBER PANEL
            </div>
            <div
              style={{
                color: "#d4a017",
                fontSize: 10,
                letterSpacing: "0.05em",
                marginTop: 1,
              }}
            >
              Financial Management Platform
            </div>
            <div
              style={{
                marginTop: 8,
                display: "inline-block",
                border: "1.5px solid #22c55e",
                color: "#22c55e",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                padding: "3px 14px",
                borderRadius: 4,
              }}
            >
              WITHDRAWAL RECEIPT
            </div>
          </div>

          {/* Amount */}
          <div style={{ textAlign: "center", padding: "10px 16px 8px" }}>
            <div style={{ color: "#22c55e", fontSize: 22, fontWeight: 900 }}>
              ✓ Transfer Successful
            </div>
            <div
              style={{
                color: "#f5c842",
                fontSize: 24,
                fontWeight: 900,
                marginTop: 2,
              }}
            >
              ₹{lastWithdrawal.amount.toLocaleString("en-IN")}
            </div>
          </div>

          {/* Details - compact grid */}
          <div style={{ padding: "0 12px 8px" }}>
            <div
              style={{
                background: "#0d0d0d",
                border: "1px solid #1a1a1a",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {[
                ["UTR Number", lastWithdrawal.utrNumber],
                ["Transaction ID", lastWithdrawal.transactionId],
                ["Reference No.", lastWithdrawal.reference],
                ...(lastWithdrawal.method === "bank" && lastWithdrawal.bankName
                  ? [
                      ["Bank Name", lastWithdrawal.bankName],
                      ["Account No.", lastWithdrawal.accountNumber || ""],
                      ["Account Holder", lastWithdrawal.accountHolder || ""],
                      ["IFSC Code", lastWithdrawal.ifscCode || ""],
                      ...(lastWithdrawal.branchCity
                        ? [["Branch / City", lastWithdrawal.branchCity]]
                        : []),
                      ["Mode", lastWithdrawal.transferMode || ""],
                    ]
                  : []),
                ...(lastWithdrawal.method === "upi" && lastWithdrawal.upiId
                  ? [["UPI ID", lastWithdrawal.upiId]]
                  : []),
                [
                  "Date & Time",
                  new Date(lastWithdrawal.approvedAt).toLocaleString("en-IN"),
                ],
                ["Status", "Transfer Successful ✓"],
              ].map(([label, value], i) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "7px 12px",
                    borderBottom: "1px solid #111",
                    background: i % 2 === 0 ? "#0d0d0d" : "#111",
                  }}
                >
                  <span
                    style={{
                      color: "#888",
                      fontSize: 11,
                      minWidth: 100,
                      flexShrink: 0,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      color:
                        label === "Status"
                          ? "#22c55e"
                          : label === "UTR Number"
                            ? "#f5c842"
                            : "#fff",
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "monospace",
                      textAlign: "right",
                      wordBreak: "break-all",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              padding: "8px 16px 14px",
              color: "#555",
              fontSize: 9,
              borderTop: "1px solid #1a1a1a",
              marginTop: 4,
              letterSpacing: "0.02em",
            }}
          >
            This is a computer generated receipt no signature required.
          </div>

          <div style={{ padding: "0 12px 12px" }}>
            <button
              type="button"
              data-ocid="withdrawal.new.button"
              onClick={() => {
                setMessage(null);
                setLastWithdrawal(null);
              }}
              className="w-full py-3 rounded-xl text-sm font-medium"
              style={{
                background: "#111111",
                border: "1px solid #333333",
                color: "#9ca3af",
              }}
            >
              New Withdrawal
            </button>
          </div>
        </div>
      )}

      {/* Main form - hide after success */}
      {!message?.type || message.type === "err" ? (
        <div
          className="rounded-2xl p-5"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          {/* Tabs */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: "#111111" }}
          >
            {(["upi", "bank", "usdt"] as const).map((t) => (
              <button
                key={t}
                type="button"
                data-ocid={`withdrawal.${t}.tab`}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all"
                style={{
                  background:
                    tab === t
                      ? "linear-gradient(135deg, #d4a017, #f5c842)"
                      : "transparent",
                  color: tab === t ? "#000" : "#9ca3af",
                }}
              >
                {t === "upi" ? "UPI" : t === "bank" ? "Bank Account" : "USDT"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Bank-specific fields */}
            {tab === "bank" && (
              <>
                <div>
                  <div className="text-sm mb-2" style={{ color: "#9ca3af" }}>
                    Transfer Mode <span className="text-red-500">*</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {MODES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        data-ocid={`withdrawal.${m.id.toLowerCase()}.toggle`}
                        onClick={() => setTransferMode(m.id)}
                        className="rounded-xl p-3 text-left transition-all"
                        style={{
                          background:
                            transferMode === m.id ? "#1a1500" : "#111111",
                          border:
                            transferMode === m.id
                              ? "1.5px solid #d4a017"
                              : "1px solid #333333",
                        }}
                      >
                        <div
                          className="font-bold text-sm"
                          style={{
                            color: transferMode === m.id ? "#f5c842" : "#fff",
                          }}
                        >
                          {m.title}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#f5c842", opacity: 0.8 }}
                        >
                          {m.sub1}
                        </div>
                        <div className="text-xs" style={{ color: "#888888" }}>
                          {m.sub2}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm mb-2" style={{ color: "#9ca3af" }}>
                    Select Bank Account <span className="text-red-500">*</span>
                  </div>
                  {approvedBanks.length === 0 ? (
                    <div
                      className="rounded-xl px-4 py-3 text-sm"
                      style={{
                        background: "#111111",
                        border: "1px solid #333333",
                        color: "#888888",
                      }}
                    >
                      No approved bank accounts. Add a bank account first.
                    </div>
                  ) : (
                    <select
                      data-ocid="withdrawal.bank.select"
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(e.target.value)}
                      required
                      className={inp}
                      style={inpStyle}
                    >
                      <option value="">Choose approved bank account</option>
                      {approvedBanks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} — {b.accountNumber.slice(-4)}
                        </option>
                      ))}
                    </select>
                  )}
                  {/* Show branch city */}
                  {branchCity && (
                    <div
                      className="text-xs mt-1.5 px-1"
                      style={{ color: "#d4a017" }}
                    >
                      Branch: {branchCity}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* UPI field */}
            {tab === "upi" && (
              <div>
                <div className="text-sm mb-2" style={{ color: "#9ca3af" }}>
                  UPI ID <span className="text-red-500">*</span>
                </div>
                <input
                  type="text"
                  data-ocid="withdrawal.upi.input"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required
                  placeholder="yourname@bank"
                  className={inp}
                  style={inpStyle}
                />
              </div>
            )}

            {/* USDT field */}
            {tab === "usdt" && (
              <div>
                <div className="text-sm mb-2" style={{ color: "#9ca3af" }}>
                  USDT Wallet Address (TRC20){" "}
                  <span className="text-red-500">*</span>
                </div>
                <input
                  type="text"
                  data-ocid="withdrawal.usdt.input"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  required
                  placeholder="USDT TRC20 wallet address"
                  className={inp}
                  style={inpStyle}
                />
              </div>
            )}

            {/* Amount */}
            <div>
              <div className="text-sm mb-2" style={{ color: "#9ca3af" }}>
                Amount (₹) <span className="text-red-500">*</span>
              </div>
              <input
                type="number"
                data-ocid="withdrawal.amount.input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="Enter withdrawal amount"
                min="1"
                className={inp}
                style={inpStyle}
              />
              <div className="text-xs mt-1" style={{ color: "#888888" }}>
                Available: ₹{commBalance.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Error message */}
            {message?.type === "err" && (
              <div
                data-ocid="withdrawal.error_state"
                className="text-sm rounded-xl px-4 py-3"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid #ef444430",
                  color: "#ef4444",
                }}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              data-ocid="withdrawal.submit.button"
              className="w-full py-4 rounded-xl font-bold text-black text-base"
              style={{
                background: "linear-gradient(135deg, #d4a017, #f5c842)",
              }}
            >
              {tab === "upi"
                ? "Request UPI Withdrawal"
                : tab === "bank"
                  ? "Request Bank Withdrawal"
                  : "Request USDT Withdrawal"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
