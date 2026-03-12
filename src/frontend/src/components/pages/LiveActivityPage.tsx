import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthUser, Page } from "../../App";
import PageHeader from "../ui/PageHeader";

function generateUTR(): string {
  return String(Math.floor(Math.random() * 1e12)).padStart(12, "0");
}

const FUND_TYPES = ["gaming", "stock", "mix", "political"];
const COMMISSION_RATES: Record<string, number> = {
  gaming: 15,
  stock: 30,
  mix: 30,
  political: 25,
};
const FUND_LABELS: Record<string, string> = {
  gaming: "Gaming Fund",
  stock: "Stock Fund",
  mix: "Mix Fund",
  political: "Political Fund",
};

interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  mobile: string;
  upiId?: string;
  status: string;
}

interface LiveTx {
  id: string;
  utr: string;
  amount: number;
  type: "credit" | "debit";
  fundType: string;
  dateTime: string;
}

export default function LiveActivityPage({
  user,
  setCurrentPage,
}: {
  user: AuthUser;
  setCurrentPage?: (p: Page) => void;
}) {
  const [transactions, setTransactions] = useState<LiveTx[]>(() =>
    JSON.parse(localStorage.getItem(`kuber_live_${user.email}`) || "[]"),
  );

  const getActiveFunds = useCallback(() => {
    return FUND_TYPES.filter(
      (f) =>
        localStorage.getItem(`kuber_fund_toggle_${user.email}_${f}`) === "true",
    );
  }, [user.email]);

  const activeFunds = getActiveFunds();
  const anyFundOn = activeFunds.length > 0;
  const prevAnyFundOn = useRef(anyFundOn);

  // Keep refs so the effect closure can access latest values
  const activeFundsRef = useRef(activeFunds);
  activeFundsRef.current = activeFunds;

  const transactionsRef = useRef(transactions);
  transactionsRef.current = transactions;

  const getLinkedBank = useCallback((): BankAccount | null => {
    const banks: BankAccount[] = JSON.parse(
      localStorage.getItem(`kuber_banks_${user.email}`) || "[]",
    );
    return banks.find((b) => b.status === "approved") || banks[0] || null;
  }, [user.email]);

  // When fund turns OFF, save session then clear transactions
  useEffect(() => {
    if (prevAnyFundOn.current && !anyFundOn) {
      const currentTxs = transactionsRef.current;
      const currentFunds = activeFundsRef.current;
      const linkedBank = getLinkedBank();

      if (currentTxs.length > 0) {
        const sessionId = Date.now().toString();
        const session = {
          id: sessionId,
          sessionStart:
            currentTxs.length > 0
              ? currentTxs[currentTxs.length - 1].dateTime
              : new Date().toLocaleString(),
          sessionEnd: new Date().toLocaleString(),
          sessionEndTimestamp: Date.now(),
          fundTypes: currentFunds,
          accountDetails: linkedBank,
          transactions: currentTxs,
        };
        const existingSessions = JSON.parse(
          localStorage.getItem(`kuber_fund_sessions_${user.email}`) || "[]",
        );
        existingSessions.unshift(session);
        localStorage.setItem(
          `kuber_fund_sessions_${user.email}`,
          JSON.stringify(existingSessions),
        );
      }

      setTransactions([]);
      localStorage.setItem(`kuber_live_${user.email}`, "[]");
    }
    prevAnyFundOn.current = anyFundOn;
  }, [anyFundOn, user.email, getLinkedBank]);

  const linkedBank = getLinkedBank();

  useEffect(() => {
    if (!user.isAdmin) return;
    const interval = setInterval(() => {
      const active = getActiveFunds();
      if (active.length === 0) return;
      const fund = active[Math.floor(Math.random() * active.length)];

      const banks: BankAccount[] = JSON.parse(
        localStorage.getItem(`kuber_banks_${user.email}`) || "[]",
      );
      const bank = banks.find((b) => b.status === "approved") || banks[0];

      const tx: LiveTx = {
        id: Date.now().toString(),
        utr: generateUTR(),
        amount: Math.floor(Math.random() * 50000) + 1000,
        type: Math.random() > 0.4 ? "credit" : "debit",
        fundType: fund,
        dateTime: new Date().toLocaleString(),
      };

      setTransactions((prev) => {
        const updated = [tx, ...prev.slice(0, 49)];
        localStorage.setItem(
          `kuber_live_${user.email}`,
          JSON.stringify(updated),
        );

        const stmt = JSON.parse(
          localStorage.getItem(`kuber_statement_${user.email}`) || "[]",
        );
        const balance = stmt.length > 0 ? stmt[0].balance : 100000;
        const newBalance =
          tx.type === "credit" ? balance + tx.amount : balance - tx.amount;
        const stmtEntry = {
          id: tx.id,
          timestamp: Date.now(),
          date: new Date().toLocaleDateString(),
          description: `${FUND_LABELS[fund]} - ${tx.type === "credit" ? "Credit" : "Debit"}`,
          utrNumber: tx.utr,
          debit: tx.type === "debit" ? tx.amount : 0,
          credit: tx.type === "credit" ? tx.amount : 0,
          balance: newBalance,
          fundType: fund,
          bankName: bank?.bankName,
          accountHolder: bank?.accountHolder,
          accountNumber: bank?.accountNumber,
          ifscCode: bank?.ifscCode,
        };
        localStorage.setItem(
          `kuber_statement_${user.email}`,
          JSON.stringify([stmtEntry, ...stmt.slice(0, 99)]),
        );

        if (tx.type === "credit") {
          const comm = Math.floor(
            (tx.amount * (COMMISSION_RATES[fund] || 15)) / 100,
          );
          const commBalance = Number.parseInt(
            localStorage.getItem(`kuber_commission_${user.email}`) || "0",
          );
          localStorage.setItem(
            `kuber_commission_${user.email}`,
            String(commBalance + comm),
          );
          const history = JSON.parse(
            localStorage.getItem(`kuber_comm_history_${user.email}`) || "[]",
          );
          history.unshift({
            id: tx.id,
            fund,
            amount: comm,
            date: new Date().toLocaleString(),
            txAmount: tx.amount,
          });
          localStorage.setItem(
            `kuber_comm_history_${user.email}`,
            JSON.stringify(history.slice(0, 100)),
          );
        }
        return updated;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [user.isAdmin, user.email, getActiveFunds]);

  if (!user.isAdmin || !anyFundOn) {
    return (
      <div>
        <PageHeader
          title="Live Fund Activity"
          subtitle="Real-time fund transaction monitor"
          onBack={
            setCurrentPage ? () => setCurrentPage("dashboard") : undefined
          }
        />

        {/* Account Details Box — shown blank/offline */}
        <div
          className="rounded-xl p-4 mb-5"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <div
            className="text-xs font-bold uppercase tracking-wider mb-3"
            style={{ color: "#d4a017" }}
          >
            Account Details
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              "Bank Name",
              "Account Holder",
              "Account Number",
              "IFSC Code",
              "Mobile",
              "UPI ID",
            ].map((label) => (
              <div key={label}>
                <span style={{ color: "#555" }}>{label}</span>
                <div className="text-zinc-600 font-medium mt-0.5">—</div>
              </div>
            ))}
          </div>
        </div>

        <div
          data-ocid="live.offline_state"
          className="flex flex-col items-center justify-center py-20 text-center rounded-2xl"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-5"
            style={{ background: "#1a1a1a", border: "2px solid #333" }}
          >
            🔴
          </div>
          <div
            className="text-3xl font-extrabold tracking-widest mb-3"
            style={{ color: "#ef4444" }}
          >
            OFFLINE
          </div>
          <div className="text-sm max-w-xs" style={{ color: "#666" }}>
            {user.isAdmin
              ? "Turn ON a fund option to start live activity."
              : "Live Fund Activity is currently offline."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Live Fund Activity"
        subtitle="Real-time fund transactions"
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-bold text-green-400">LIVE</span>
        </div>
        {activeFunds.map((f) => (
          <span
            key={f}
            className="px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              background: "rgba(212,160,23,0.15)",
              border: "1px solid #d4a017",
              color: "#f5c842",
            }}
          >
            {FUND_LABELS[f]}
          </span>
        ))}
      </div>

      {linkedBank && (
        <div
          className="rounded-xl p-4 mb-5"
          style={{ background: "#111111", border: "1px solid #2a3a1a" }}
        >
          <div
            className="text-xs font-bold uppercase tracking-wider mb-3"
            style={{ color: "#d4a017" }}
          >
            Linked Bank Account
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span style={{ color: "#666" }}>Bank Name</span>
              <div className="text-white font-medium mt-0.5">
                {linkedBank.bankName}
              </div>
            </div>
            <div>
              <span style={{ color: "#666" }}>Account Holder</span>
              <div className="text-white font-medium mt-0.5">
                {linkedBank.accountHolder}
              </div>
            </div>
            <div>
              <span style={{ color: "#666" }}>Account Number</span>
              <div className="text-white font-mono text-xs mt-0.5">
                {linkedBank.accountNumber}
              </div>
            </div>
            <div>
              <span style={{ color: "#666" }}>IFSC Code</span>
              <div className="text-white font-mono text-xs mt-0.5">
                {linkedBank.ifscCode}
              </div>
            </div>
            <div>
              <span style={{ color: "#666" }}>Mobile</span>
              <div className="text-white font-medium mt-0.5">
                {linkedBank.mobile}
              </div>
            </div>
            {linkedBank.upiId && (
              <div>
                <span style={{ color: "#666" }}>UPI ID</span>
                <div className="text-white font-medium mt-0.5">
                  {linkedBank.upiId}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {transactions.length === 0 ? (
        <div
          data-ocid="live.empty_state"
          className="text-center py-16"
          style={{ color: "#888888" }}
        >
          <div className="text-4xl mb-3">⚡</div>
          <p>No live activity yet. Transactions will appear here shortly.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <div
              key={tx.id}
              data-ocid={`live.item.${i + 1}`}
              className="rounded-xl p-4"
              style={{ background: "#111111", border: "1px solid #333333" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <span
                    className="inline-block text-xs font-bold px-2 py-0.5 rounded mb-1"
                    style={{
                      background:
                        tx.type === "credit"
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(239,68,68,0.15)",
                      color: tx.type === "credit" ? "#10b981" : "#ef4444",
                      border: `1px solid ${
                        tx.type === "credit" ? "#10b98140" : "#ef444440"
                      }`,
                    }}
                  >
                    {tx.type === "credit" ? "CREDIT" : "DEBIT"}
                  </span>
                  <div
                    className="text-sm font-medium"
                    style={{ color: "#f5c842" }}
                  >
                    {FUND_LABELS[tx.fundType] || tx.fundType}
                  </div>
                  <div
                    className="text-xs font-mono mt-0.5"
                    style={{ color: "#888888" }}
                  >
                    UTR:{tx.utr}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#555" }}>
                    {tx.dateTime}
                  </div>
                </div>
                <div
                  className={`text-lg font-bold ml-3 ${
                    tx.type === "credit" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {tx.type === "credit" ? "+" : "-"}₹
                  {tx.amount.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
