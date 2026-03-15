import { useMemo, useState } from "react";
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

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const FUND_LABELS: Record<string, string> = {
  gaming: "Gaming Fund",
  stock: "Stock Fund",
  mix: "Mix Fund",
  political: "Political Fund",
};

function getBankKey(session: FundSession): string {
  const b = session.accountDetails;
  if (!b) return "unknown";
  return `${b.accountNumber}_${b.bankName}`;
}

function getBankLabel(session: FundSession): string {
  const b = session.accountDetails;
  if (!b) return "Unknown Bank";
  return `${b.bankName} — ${b.accountHolder} (${b.accountNumber})`;
}

export default function BankStatementPage({
  user,
  setCurrentPage,
}: {
  user: AuthUser;
  setCurrentPage?: (p: Page) => void;
}) {
  const [expandedBank, setExpandedBank] = useState<string | null>(null);

  const sessions = useMemo(() => {
    const all: FundSession[] = JSON.parse(
      localStorage.getItem(`kuber_fund_sessions_${user.email}`) || "[]",
    );
    const now = Date.now();
    return all.filter((s) => now - s.sessionEndTimestamp <= THIRTY_DAYS_MS);
  }, [user.email]);

  // Group sessions by bank account
  const bankGroups = useMemo(() => {
    const map = new Map<string, { label: string; sessions: FundSession[] }>();
    for (const s of sessions) {
      const key = getBankKey(s);
      if (!map.has(key)) {
        map.set(key, { label: getBankLabel(s), sessions: [] });
      }
      map.get(key)!.sessions.push(s);
    }
    return Array.from(map.entries());
  }, [sessions]);

  return (
    <div>
      <PageHeader
        title="Bank Account Statement"
        subtitle="Last 30 days — per bank history"
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      {bankGroups.length === 0 ? (
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
      ) : (
        <div className="space-y-4">
          {bankGroups.map(([bankKey, { sessions: bankSessions }], gi) => {
            const isOpen = expandedBank === bankKey;
            const totalSessions = bankSessions.length;
            const totalCredit = bankSessions.reduce(
              (s, sess) =>
                s +
                sess.transactions
                  .filter((t) => t.type === "credit")
                  .reduce((a, t) => a + t.amount, 0),
              0,
            );
            const totalDebit = bankSessions.reduce(
              (s, sess) =>
                s +
                sess.transactions
                  .filter((t) => t.type === "debit")
                  .reduce((a, t) => a + t.amount, 0),
              0,
            );
            const bank = bankSessions[0]?.accountDetails;

            return (
              <div
                key={bankKey}
                data-ocid={`statement.item.${gi + 1}`}
                className="rounded-2xl overflow-hidden"
                style={{
                  border: `2px solid ${isOpen ? "#d4a017" : "#333"}`,
                  background: "#0d0d0d",
                  transition: "border-color 0.2s",
                }}
              >
                {/* Bank folder header (clickable) */}
                <button
                  type="button"
                  data-ocid={`statement.bank.toggle.${gi + 1}`}
                  onClick={() => setExpandedBank(isOpen ? null : bankKey)}
                  className="w-full text-left"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="px-5 py-4 flex items-center justify-between gap-3"
                    style={{
                      background: isOpen ? "#1a1500" : "#111",
                      borderBottom: isOpen ? "1px solid #d4a01730" : "none",
                      transition: "background 0.2s",
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="flex items-center justify-center rounded-full flex-shrink-0"
                        style={{
                          width: 44,
                          height: 44,
                          background: isOpen
                            ? "rgba(212,160,23,0.15)"
                            : "#1a1a1a",
                          border: `1px solid ${isOpen ? "#d4a017" : "#333"}`,
                          fontSize: 22,
                        }}
                      >
                        🏦
                      </div>
                      <div className="min-w-0">
                        <div
                          className="font-bold text-sm"
                          style={{ color: isOpen ? "#f5c842" : "#ccc" }}
                        >
                          {bank?.bankName || "Bank"}
                        </div>
                        <div
                          className="text-xs mt-0.5 truncate"
                          style={{ color: "#888", maxWidth: 200 }}
                        >
                          {bank?.accountHolder} · A/C: {bank?.accountNumber}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#555" }}
                        >
                          {totalSessions} session
                          {totalSessions !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs" style={{ color: "#4ade80" }}>
                        +₹{totalCredit.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs" style={{ color: "#f87171" }}>
                        -₹{totalDebit.toLocaleString("en-IN")}
                      </div>
                      <div
                        className="text-xs mt-1"
                        style={{ color: isOpen ? "#d4a017" : "#555" }}
                      >
                        {isOpen ? "▲ Close" : "▼ View"}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded: all sessions for this bank */}
                {isOpen && (
                  <div className="divide-y" style={{ borderColor: "#1a1a1a" }}>
                    {/* Bank details strip */}
                    {bank && (
                      <div
                        className="px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-2"
                        style={{
                          background: "#111",
                          borderBottom: "1px solid #222",
                        }}
                      >
                        <div
                          className="text-xs font-bold uppercase tracking-widest col-span-2 mb-1"
                          style={{ color: "#d4a017" }}
                        >
                          Account Details
                        </div>
                        {[
                          ["Bank Name", bank.bankName],
                          ["Account Holder", bank.accountHolder],
                          ["Account Number", bank.accountNumber],
                          ["IFSC Code", bank.ifscCode],
                          ["Mobile", bank.mobile || bank.mobileNumber || "—"],
                          ["UPI ID", bank.upiId || "—"],
                        ].map(([label2, val]) => (
                          <div key={label2}>
                            <div className="text-xs" style={{ color: "#555" }}>
                              {label2}
                            </div>
                            <div
                              className="text-xs font-semibold"
                              style={{ color: "#e5e5e5" }}
                            >
                              {val}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sessions list */}
                    {bankSessions.map((session, si) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        sessionNumber={bankSessions.length - si}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
  const txs = session.transactions;

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

  return (
    <div
      data-ocid={`statement.session.${sessionNumber}`}
      style={{ background: "#0d0d0d" }}
    >
      {/* Session header */}
      <div
        className="px-5 py-3"
        style={{
          background: "#141400",
          borderBottom: "1px solid #d4a01720",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold" style={{ color: "#f5c842" }}>
                Session #{sessionNumber}
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid #22c55e",
                  color: "#22c55e",
                }}
              >
                ✓ Approved
              </span>
              {session.fundTypes.map((f) => (
                <span
                  key={f}
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(212,160,23,0.12)",
                    border: "1px solid #d4a017",
                    color: "#f5c842",
                  }}
                >
                  {FUND_LABELS[f] || f}
                </span>
              ))}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#666" }}>
              {session.sessionStart} → {session.sessionEnd}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: "#4ade80" }}>
              Credit: ₹{totalCredit.toLocaleString("en-IN")}
            </div>
            <div className="text-xs" style={{ color: "#f87171" }}>
              Debit: ₹{totalDebit.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction table */}
      {txs.length === 0 ? (
        <div
          className="px-5 py-6 text-center text-xs"
          style={{ color: "#555" }}
        >
          No transactions in this session.
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            background: "#0d0d0d",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "90px 1fr 80px 80px 90px",
              minWidth: 570,
              padding: "7px 16px",
              background: "#1a1500",
              color: "#d4a017",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderBottom: "1px solid #2a2a2a",
            }}
          >
            <div>Date</div>
            <div>Description</div>
            <div style={{ textAlign: "right" }}>Debit</div>
            <div style={{ textAlign: "right" }}>Credit</div>
            <div style={{ textAlign: "right" }}>Balance</div>
          </div>

          {tableRows.map(({ tx, balance }, i) => (
            <div
              key={tx.id}
              data-ocid={`statement.row.${i + 1}`}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 80px 80px 90px",
                minWidth: 570,
                padding: "9px 16px",
                borderBottom:
                  i < tableRows.length - 1 ? "1px solid #1a1a1a" : "none",
                background: i % 2 === 0 ? "#0d0d0d" : "#111111",
                fontSize: 11,
              }}
            >
              <div style={{ color: "#888", whiteSpace: "nowrap" }}>
                {tx.dateTime.split(",")[0]}
              </div>
              <div style={{ paddingRight: 8 }}>
                <div
                  style={{
                    color: "#f5c842",
                    fontFamily: "monospace",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  UTR: {tx.utr}
                </div>
                <div
                  style={{ color: "#ffffff", fontWeight: 500, marginTop: 2 }}
                >
                  {FUND_LABELS[tx.fundType] || tx.fundType} —{" "}
                  {tx.type === "credit" ? "Credit" : "Debit"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {tx.type === "debit" ? (
                  <span style={{ color: "#f87171", fontWeight: 700 }}>
                    ₹{tx.amount.toLocaleString("en-IN")}
                  </span>
                ) : (
                  <span style={{ color: "#333" }}>—</span>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                {tx.type === "credit" ? (
                  <span style={{ color: "#4ade80", fontWeight: 700 }}>
                    ₹{tx.amount.toLocaleString("en-IN")}
                  </span>
                ) : (
                  <span style={{ color: "#333" }}>—</span>
                )}
              </div>
              <div
                style={{
                  textAlign: "right",
                  color: "#f5c842",
                  fontWeight: 600,
                }}
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
