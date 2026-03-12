import { useMemo } from "react";
import type { AuthUser, Page } from "../../App";
import PageHeader from "../ui/PageHeader";

interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  mobile?: string;
  mobileNumber?: string;
  upiId?: string;
  accountType?: string;
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

interface FundSession {
  id: string;
  sessionStart: string;
  sessionEnd: string;
  sessionEndTimestamp: number;
  fundTypes: string[];
  accountDetails: BankAccount | null;
  transactions: LiveTx[];
}

interface LegacyTransaction {
  id: string;
  date: string;
  description: string;
  utrNumber: string;
  debit: number;
  credit: number;
  balance: number;
  timestamp?: number;
  fundType?: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifscCode?: string;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const FUND_LABELS: Record<string, string> = {
  gaming: "Gaming Fund",
  stock: "Stock Fund",
  mix: "Mix Fund",
  political: "Political Fund",
};

export default function BankStatementPage({
  user,
  setCurrentPage,
}: {
  user: AuthUser;
  setCurrentPage?: (p: Page) => void;
}) {
  const sessions = useMemo(() => {
    const all: FundSession[] = JSON.parse(
      localStorage.getItem(`kuber_fund_sessions_${user.email}`) || "[]",
    );
    const now = Date.now();
    return all.filter((s) => now - s.sessionEndTimestamp <= THIRTY_DAYS_MS);
  }, [user.email]);

  const legacyTransactions = useMemo((): LegacyTransaction[] => {
    if (sessions.length > 0) return [];
    const all: LegacyTransaction[] = JSON.parse(
      localStorage.getItem(`kuber_statement_${user.email}`) || "[]",
    );
    const now = Date.now();
    return all.filter((t) => {
      const ts = t.timestamp ?? Number.parseInt(t.id);
      return now - ts <= THIRTY_DAYS_MS;
    });
  }, [user.email, sessions.length]);

  return (
    <div>
      <PageHeader
        title="Bank Account Statement"
        subtitle="Last 30 days — session-wise history"
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      {sessions.length === 0 && legacyTransactions.length === 0 ? (
        <div
          data-ocid="statement.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center rounded-2xl"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <div className="text-5xl mb-4">📄</div>
          <div className="text-lg font-bold mb-2" style={{ color: "#d4a017" }}>
            No Bank Statements Yet
          </div>
          <div className="text-sm max-w-xs" style={{ color: "#666" }}>
            Fund activity sessions will appear here when Live Fund Activity is
            turned off.
          </div>
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-6">
          {sessions.map((session, sessionIndex) => (
            <SessionCard
              key={session.id}
              session={session}
              sessionNumber={sessions.length - sessionIndex}
            />
          ))}
        </div>
      ) : (
        <LegacyStatementView transactions={legacyTransactions} />
      )}
    </div>
  );
}

function SessionCard({
  session,
  sessionNumber,
}: {
  session: FundSession;
  sessionNumber: number;
}) {
  const bank = session.accountDetails;
  const txs = session.transactions;

  // Build running balance table
  let runningBalance = 100000;
  const tableRows = [...txs].reverse().map((tx) => {
    if (tx.type === "credit") {
      runningBalance += tx.amount;
    } else {
      runningBalance -= tx.amount;
    }
    return { tx, balance: runningBalance };
  });
  tableRows.reverse();

  const totalCredit = txs
    .filter((t) => t.type === "credit")
    .reduce((s, t) => s + t.amount, 0);
  const totalDebit = txs
    .filter((t) => t.type === "debit")
    .reduce((s, t) => s + t.amount, 0);
  const netBalance = totalCredit - totalDebit;

  return (
    <div
      data-ocid={`statement.item.${sessionNumber}`}
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid #d4a01730" }}
    >
      {/* Session Header */}
      <div
        className="px-5 py-4"
        style={{ background: "#1a1500", borderBottom: "1px solid #d4a01730" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div
              className="text-base font-bold tracking-wide"
              style={{ color: "#f5c842" }}
            >
              Fund Session #{sessionNumber}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#888" }}>
              {session.sessionStart} → {session.sessionEnd}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {session.fundTypes.map((f) => (
              <span
                key={f}
                className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{
                  background: "rgba(212,160,23,0.15)",
                  border: "1px solid #d4a017",
                  color: "#f5c842",
                }}
              >
                {FUND_LABELS[f] || f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div
        className="px-5 py-4"
        style={{ background: "#111111", borderBottom: "1px solid #222" }}
      >
        <div
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: "#d4a017" }}
        >
          Account Details
        </div>
        {bank ? (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div style={{ color: "#555" }}>Bank Name</div>
              <div className="text-white font-medium mt-0.5">
                {bank.bankName}
              </div>
            </div>
            <div>
              <div style={{ color: "#555" }}>Account Holder</div>
              <div className="text-white font-medium mt-0.5">
                {bank.accountHolder}
              </div>
            </div>
            <div>
              <div style={{ color: "#555" }}>Account Number</div>
              <div className="text-white font-mono mt-0.5">
                {bank.accountNumber}
              </div>
            </div>
            <div>
              <div style={{ color: "#555" }}>IFSC Code</div>
              <div className="text-white font-mono mt-0.5">{bank.ifscCode}</div>
            </div>
            <div>
              <div style={{ color: "#555" }}>Mobile</div>
              <div className="text-white font-medium mt-0.5">
                {bank.mobile || bank.mobileNumber || "—"}
              </div>
            </div>
            {bank.upiId && (
              <div>
                <div style={{ color: "#555" }}>UPI ID</div>
                <div className="text-white font-medium mt-0.5">
                  {bank.upiId}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm" style={{ color: "#555" }}>
            Bank details not available
          </div>
        )}
      </div>

      {/* Summary */}
      <div
        className="grid grid-cols-3 gap-0"
        style={{ borderBottom: "1px solid #222" }}
      >
        <div
          className="px-4 py-3 text-center"
          style={{ borderRight: "1px solid #222" }}
        >
          <div className="text-xs" style={{ color: "#555" }}>
            Total Credit
          </div>
          <div className="text-green-400 font-bold text-sm mt-0.5">
            +₹{totalCredit.toLocaleString("en-IN")}
          </div>
        </div>
        <div
          className="px-4 py-3 text-center"
          style={{ borderRight: "1px solid #222" }}
        >
          <div className="text-xs" style={{ color: "#555" }}>
            Total Debit
          </div>
          <div className="text-red-400 font-bold text-sm mt-0.5">
            -₹{totalDebit.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="text-xs" style={{ color: "#555" }}>
            Net Balance
          </div>
          <div
            className={`font-bold text-sm mt-0.5 ${
              netBalance >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {netBalance >= 0 ? "+" : "-"}₹
            {Math.abs(netBalance).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      {tableRows.length > 0 && (
        <div style={{ background: "#0d0d0d", overflowX: "auto" }}>
          {/* Table Header */}
          <div
            className="grid px-4 py-2 text-xs font-bold uppercase tracking-wider"
            style={{
              gridTemplateColumns: "100px 1fr 120px 70px 70px 85px",
              minWidth: 500,
              color: "#d4a017",
              borderBottom: "1px solid #222",
              background: "#111111",
            }}
          >
            <div>Date</div>
            <div>Description</div>
            <div>UTR</div>
            <div className="text-right">Debit</div>
            <div className="text-right">Credit</div>
            <div className="text-right">Balance</div>
          </div>
          {tableRows.map(({ tx, balance }, i) => (
            <div
              key={tx.id}
              data-ocid={`statement.row.${i + 1}`}
              className="grid px-4 py-3"
              style={{
                gridTemplateColumns: "100px 1fr 120px 70px 70px 85px",
                borderBottom:
                  i < tableRows.length - 1 ? "1px solid #1a1a1a" : "none",
                background: i % 2 === 0 ? "#0d0d0d" : "#111111",
              }}
            >
              <div className="text-xs" style={{ color: "#888" }}>
                {tx.dateTime.split(",")[0]}
              </div>
              <div className="pr-2">
                <div className="text-white text-xs font-medium leading-snug">
                  {FUND_LABELS[tx.fundType] || tx.fundType} —{" "}
                  {tx.type === "credit" ? "Credit" : "Debit"}
                </div>
              </div>
              <div
                className="text-xs font-mono break-all"
                style={{ color: "#888" }}
              >
                {tx.utr}
              </div>
              <div className="text-right">
                {tx.type === "debit" ? (
                  <span className="text-red-400 text-xs font-bold">
                    ₹{tx.amount.toLocaleString("en-IN")}
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: "#444" }}>
                    —
                  </span>
                )}
              </div>
              <div className="text-right">
                {tx.type === "credit" ? (
                  <span className="text-green-400 text-xs font-bold">
                    ₹{tx.amount.toLocaleString("en-IN")}
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: "#444" }}>
                    —
                  </span>
                )}
              </div>
              <div
                className="text-right text-xs font-medium"
                style={{ color: "#f5c842" }}
              >
                ₹{balance.toLocaleString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LegacyStatementView({
  transactions,
}: {
  transactions: LegacyTransaction[];
}) {
  const totalCredit = transactions.reduce((s, t) => s + (t.credit || 0), 0);
  const totalDebit = transactions.reduce((s, t) => s + (t.debit || 0), 0);
  const openingBalance =
    transactions.length > 0
      ? transactions[transactions.length - 1].balance
      : 100000;
  const closingBalance =
    transactions.length > 0 ? transactions[0].balance : openingBalance;

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid #10b98130",
          }}
        >
          <div className="text-xs" style={{ color: "#10b981" }}>
            Total Credit
          </div>
          <div className="text-green-400 font-bold text-lg mt-1">
            +₹{totalCredit.toLocaleString("en-IN")}
          </div>
        </div>
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid #ef444430",
          }}
        >
          <div className="text-xs" style={{ color: "#ef4444" }}>
            Total Debit
          </div>
          <div className="text-red-400 font-bold text-lg mt-1">
            -₹{totalDebit.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Balances */}
      <div
        className="rounded-xl p-4 mb-5 grid grid-cols-2 gap-3"
        style={{ background: "#111111", border: "1px solid #333" }}
      >
        <div className="text-center">
          <div className="text-xs" style={{ color: "#555" }}>
            Opening Balance
          </div>
          <div className="font-bold text-sm text-white mt-0.5">
            ₹{openingBalance.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs" style={{ color: "#555" }}>
            Closing Balance
          </div>
          <div
            className="font-bold text-sm mt-0.5"
            style={{ color: "#f5c842" }}
          >
            ₹{closingBalance.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-t-xl px-4 py-2 grid text-xs font-bold uppercase tracking-wider"
        style={{
          background: "#1a1500",
          border: "1px solid #d4a01740",
          borderBottom: "none",
          gridTemplateColumns: "80px 1fr 80px 80px 90px",
          color: "#d4a017",
        }}
      >
        <div>Date</div>
        <div>Description</div>
        <div className="text-right">Debit</div>
        <div className="text-right">Credit</div>
        <div className="text-right">Balance</div>
      </div>
      <div
        className="rounded-b-xl overflow-hidden"
        style={{ border: "1px solid #333" }}
      >
        {transactions.map((t, i) => (
          <div
            key={t.id}
            data-ocid={`statement.row.${i + 1}`}
            className="grid px-4 py-3"
            style={{
              gridTemplateColumns: "80px 1fr 80px 80px 90px",
              borderBottom:
                i < transactions.length - 1 ? "1px solid #1a1a1a" : "none",
              background: i % 2 === 0 ? "#111111" : "#0d0d0d",
            }}
          >
            <div className="text-xs" style={{ color: "#888" }}>
              {t.date}
            </div>
            <div className="pr-2">
              <div className="text-white text-xs font-medium leading-snug">
                {t.description}
              </div>
              <div
                className="text-xs font-mono mt-0.5"
                style={{ color: "#888888" }}
              >
                UTR:{t.utrNumber}
              </div>
            </div>
            <div className="text-right">
              {t.debit > 0 ? (
                <span className="text-red-400 text-xs font-bold">
                  ₹{t.debit.toLocaleString("en-IN")}
                </span>
              ) : (
                <span className="text-xs" style={{ color: "#444" }}>
                  —
                </span>
              )}
            </div>
            <div className="text-right">
              {t.credit > 0 ? (
                <span className="text-green-400 text-xs font-bold">
                  ₹{t.credit.toLocaleString("en-IN")}
                </span>
              ) : (
                <span className="text-xs" style={{ color: "#444" }}>
                  —
                </span>
              )}
            </div>
            <div
              className="text-right text-xs font-medium"
              style={{ color: "#f5c842" }}
            >
              ₹{t.balance.toLocaleString("en-IN")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
