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
  status: "pending" | "approved";
  createdAt: string;
  approvedAt?: string;
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

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const updated = withdrawals.map((w) => {
        if (
          w.status === "pending" &&
          now - new Date(w.createdAt).getTime() >= 10 * 60 * 1000
        ) {
          return {
            ...w,
            status: "approved" as const,
            approvedAt: new Date().toISOString(),
          };
        }
        return w;
      });
      if (JSON.stringify(updated) !== JSON.stringify(withdrawals)) {
        setWithdrawals(updated);
        localStorage.setItem(
          `kuber_withdrawals_${user.email}`,
          JSON.stringify(updated),
        );
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [withdrawals, user.email]);

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

    const w: Withdrawal = {
      id: Date.now().toString(),
      method: tab,
      transferMode: tab === "bank" ? transferMode : undefined,
      amount: amt,
      status: "pending",
      createdAt: new Date().toISOString(),
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
      text: `₹${amt.toLocaleString()} withdrawal submitted. Auto-approved in 10 minutes.`,
    });
    setAmount("");
  };

  const inp =
    "w-full rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none text-sm";
  const inpStyle = { background: "#07112a", border: "1px solid #333333" };

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

      {/* Main card */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "#111111", border: "1px solid #333333" }}
      >
        {/* Tabs */}
        <div
          className="flex rounded-xl p-1 mb-6"
          style={{ background: "#07112a" }}
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
                color: tab === t ? "#000" : "#8899c0",
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
                <div className="text-sm mb-2" style={{ color: "#8899c0" }}>
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
                          transferMode === m.id ? "#1a1500" : "#07112a",
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
                      <div className="text-xs" style={{ color: "#5a7ab0" }}>
                        {m.sub2}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm mb-2" style={{ color: "#8899c0" }}>
                  Select Bank Account <span className="text-red-500">*</span>
                </div>
                {approvedBanks.length === 0 ? (
                  <div
                    className="rounded-xl px-4 py-3 text-sm"
                    style={{
                      background: "#07112a",
                      border: "1px solid #333333",
                      color: "#5a7ab0",
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
              <div className="text-sm mb-2" style={{ color: "#8899c0" }}>
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
              <div className="text-sm mb-2" style={{ color: "#8899c0" }}>
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
            <div className="text-sm mb-2" style={{ color: "#8899c0" }}>
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
            <div className="text-xs mt-1" style={{ color: "#5a7ab0" }}>
              Available: ₹{commBalance.toLocaleString("en-IN")}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              data-ocid={
                message.type === "ok"
                  ? "withdrawal.success_state"
                  : "withdrawal.error_state"
              }
              className="text-sm rounded-xl px-4 py-3"
              style={{
                background:
                  message.type === "ok"
                    ? "rgba(16,185,129,0.08)"
                    : "rgba(239,68,68,0.08)",
                border: `1px solid ${message.type === "ok" ? "#10b98130" : "#ef444430"}`,
                color: message.type === "ok" ? "#10b981" : "#ef4444",
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
    </div>
  );
}
