import { useState } from "react";
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
  branch?: string;
  upiId?: string;
  walletAddress?: string;
  details: Record<string, string>;
}

function rand(n: number): string {
  return Math.floor(Math.random() * n)
    .toString()
    .padStart(String(n).length - 1, "0");
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

  const handleSubmit = (e: React.FormEvent) => {
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
      branch: selectedBank
        ? `${selectedBank.bankName} — Branch 0112`
        : undefined,
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
    setMessage({
      type: "ok",
      text: "Transfer Successful",
    });
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
          className="rounded-2xl p-5 mb-5"
          style={{
            background: "#0a1f0a",
            border: "1.5px solid #16a34a",
          }}
        >
          <div className="text-center mb-4">
            <div className="text-4xl mb-2" style={{ color: "#22c55e" }}>
              ✓
            </div>
            <div className="text-xl font-bold" style={{ color: "#22c55e" }}>
              Transfer Successful
            </div>
            <div
              className="text-2xl font-bold mt-1"
              style={{ color: "#f5c842" }}
            >
              ₹{lastWithdrawal.amount.toLocaleString("en-IN")}
            </div>
          </div>
          <div
            className="rounded-xl p-4 space-y-2 text-sm"
            style={{ background: "#111111", border: "1px solid #1a3a1a" }}
          >
            <div className="flex justify-between">
              <span style={{ color: "#9ca3af" }}>Transaction ID</span>
              <span className="font-mono text-white text-sm">
                {lastWithdrawal.transactionId}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#9ca3af" }}>UTR Number</span>
              <span className="font-mono text-white text-sm">
                {lastWithdrawal.utrNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#9ca3af" }}>Reference No.</span>
              <span className="font-mono text-white text-sm">
                {lastWithdrawal.reference}
              </span>
            </div>
            {lastWithdrawal.method === "bank" && lastWithdrawal.bankName && (
              <>
                <div className="flex justify-between">
                  <span style={{ color: "#9ca3af" }}>Bank Name</span>
                  <span className="text-white text-sm">
                    {lastWithdrawal.bankName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#9ca3af" }}>Account No.</span>
                  <span className="font-mono text-white text-sm">
                    {lastWithdrawal.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#9ca3af" }}>IFSC</span>
                  <span className="font-mono text-white text-sm">
                    {lastWithdrawal.ifscCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#9ca3af" }}>Mode</span>
                  <span className="text-white text-sm">
                    {lastWithdrawal.transferMode}
                  </span>
                </div>
              </>
            )}
            {lastWithdrawal.method === "upi" && lastWithdrawal.upiId && (
              <div className="flex justify-between">
                <span style={{ color: "#9ca3af" }}>UPI ID</span>
                <span className="text-white text-sm">
                  {lastWithdrawal.upiId}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span style={{ color: "#9ca3af" }}>Date & Time</span>
              <span className="text-white text-sm">
                {new Date(lastWithdrawal.approvedAt).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#9ca3af" }}>Status</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: "#16a34a30",
                  color: "#22c55e",
                  border: "1px solid #16a34a",
                }}
              >
                Transfer Successful
              </span>
            </div>
          </div>
          <button
            type="button"
            data-ocid="withdrawal.new.button"
            onClick={() => {
              setMessage(null);
              setLastWithdrawal(null);
            }}
            className="w-full mt-4 py-3 rounded-xl text-sm font-medium"
            style={{
              background: "#111111",
              border: "1px solid #333333",
              color: "#9ca3af",
            }}
          >
            New Withdrawal
          </button>
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
