import { useCallback, useEffect, useState } from "react";
import type { AuthUser, Page } from "../../App";
import PageHeader from "../ui/PageHeader";

function generateUTR(): string {
  return `UTR${Math.floor(Math.random() * 1e12)
    .toString()
    .padStart(12, "0")}`;
}

const FUND_TYPES = ["gaming", "stock", "mix", "political"];
const COMMISSION_RATES: Record<string, number> = {
  gaming: 15,
  stock: 30,
  mix: 30,
  political: 25,
};

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

  const anyFundOn = getActiveFunds().length > 0;

  useEffect(() => {
    if (!user.isAdmin) return;
    const interval = setInterval(() => {
      const activeFunds = getActiveFunds();
      if (activeFunds.length === 0) return;
      const fund = activeFunds[Math.floor(Math.random() * activeFunds.length)];
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
          date: new Date().toLocaleDateString(),
          description: `${fund.toUpperCase()} Fund Transaction`,
          utrNumber: tx.utr,
          debit: tx.type === "debit" ? tx.amount : 0,
          credit: tx.type === "credit" ? tx.amount : 0,
          balance: newBalance,
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

  if (!user.isAdmin) {
    return (
      <div>
        <PageHeader
          title="Live Fund Activity"
          subtitle="Real-time fund transaction monitor"
          onBack={
            setCurrentPage ? () => setCurrentPage("dashboard") : undefined
          }
        />
        <div
          data-ocid="live.offline_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4"
            style={{ background: "#111111", border: "1px solid #333333" }}
          >
            🔴
          </div>
          <div className="text-2xl font-bold mb-2" style={{ color: "#5a7ab0" }}>
            OFFLINE
          </div>
          <div className="text-sm" style={{ color: "#5a7ab0" }}>
            Live Fund Activity is currently offline.
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

      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-2.5 h-2.5 rounded-full ${anyFundOn ? "bg-green-500 animate-pulse" : "bg-zinc-600"}`}
        />
        <span
          className={`text-sm font-medium ${anyFundOn ? "text-green-400" : "text-zinc-500"}`}
        >
          {anyFundOn ? "LIVE" : "OFFLINE"}
        </span>
      </div>

      {transactions.length === 0 ? (
        <div
          data-ocid="live.empty_state"
          className="text-center py-16"
          style={{ color: "#5a7ab0" }}
        >
          <div className="text-4xl mb-3">⚡</div>
          <p>No live activity yet. Turn on a fund option to start.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <div
              key={tx.id}
              data-ocid={`live.item.${i + 1}`}
              className="rounded-xl p-4 flex items-center justify-between"
              style={{ background: "#111111", border: "1px solid #333333" }}
            >
              <div>
                <div className="text-xs font-mono" style={{ color: "#5a7ab0" }}>
                  {tx.utr}
                </div>
                <div className="text-sm mt-0.5" style={{ color: "#8899c0" }}>
                  {tx.fundType.toUpperCase()} Fund
                </div>
                <div className="text-xs" style={{ color: "#5a7ab0" }}>
                  {tx.dateTime}
                </div>
              </div>
              <div
                className={`text-lg font-bold ${
                  tx.type === "credit" ? "text-green-400" : "text-red-400"
                }`}
              >
                {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
