import { useEffect, useRef, useState } from "react";
import LoginPage from "./components/auth/LoginPage";
import DashboardLayout from "./components/layout/DashboardLayout";

export interface AuthUser {
  email: string;
  isAdmin: boolean;
  userId: string;
}

export type Page =
  | "dashboard"
  | "add-bank"
  | "bank-statement"
  | "gaming-fund"
  | "stock-fund"
  | "mix-fund"
  | "political-fund"
  | "live-activity"
  | "commission"
  | "withdrawal"
  | "withdrawal-history"
  | "activation"
  | "help-support"
  | "generated-codes"
  | "user-management"
  | "bank-approval"
  | "change-support";

// ─── Shared constants ────────────────────────────────────────────────────────
export const FUND_TYPES = ["gaming", "stock", "mix", "political"];
export const COMMISSION_RATES: Record<string, number> = {
  gaming: 15,
  stock: 30,
  mix: 25,
  political: 30,
};
export const FUND_LABELS: Record<string, string> = {
  gaming: "Gaming Fund",
  stock: "Stock Fund",
  mix: "Mix Fund",
  political: "Political Fund",
};

function generateUTR(): string {
  return String(Math.floor(Math.random() * 1e12)).padStart(12, "0");
}

export interface LiveTx {
  id: string;
  utr: string;
  amount: number;
  type: "credit" | "debit";
  fundType: string;
  dateTime: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  mobile?: string;
  mobileNumber?: string;
  upiId?: string;
  status: string;
}

function getLinkedBank(email: string): BankAccount | null {
  const banks: BankAccount[] = JSON.parse(
    localStorage.getItem(`kuber_banks_${email}`) || "[]",
  );
  return banks.find((b) => b.status === "approved") || banks[0] || null;
}

export function generateTransaction(
  email: string,
  activeFunds: string[],
): LiveTx | null {
  if (activeFunds.length === 0) return null;
  const fund = activeFunds[Math.floor(Math.random() * activeFunds.length)];
  const bank = getLinkedBank(email);
  const tx: LiveTx = {
    id: Date.now().toString() + Math.random(),
    utr: generateUTR(),
    amount: Math.floor(Math.random() * 50000) + 1000,
    type: Math.random() > 0.4 ? "credit" : "debit",
    fundType: fund,
    dateTime: new Date().toLocaleString(),
  };

  // Update bank statement
  const stmt = JSON.parse(
    localStorage.getItem(`kuber_statement_${email}`) || "[]",
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
    `kuber_statement_${email}`,
    JSON.stringify([stmtEntry, ...stmt.slice(0, 99)]),
  );

  // Accumulate commission for credit transactions
  if (tx.type === "credit") {
    const comm = Math.floor((tx.amount * (COMMISSION_RATES[fund] || 15)) / 100);
    // Total commission balance
    const commBalance = Number.parseInt(
      localStorage.getItem(`kuber_commission_${email}`) || "0",
    );
    localStorage.setItem(
      `kuber_commission_${email}`,
      String(commBalance + comm),
    );

    // Per-fund current session commission
    const sessionComm: Record<string, number> = JSON.parse(
      localStorage.getItem(`kuber_session_comm_${email}`) || "{}",
    );
    sessionComm[fund] = (sessionComm[fund] || 0) + comm;
    localStorage.setItem(
      `kuber_session_comm_${email}`,
      JSON.stringify(sessionComm),
    );
  }

  // Append tx to live list
  const live: LiveTx[] = JSON.parse(
    localStorage.getItem(`kuber_live_${email}`) || "[]",
  );
  const updated = [tx, ...live.slice(0, 49)];
  localStorage.setItem(`kuber_live_${email}`, JSON.stringify(updated));

  return tx;
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [showWelcome, setShowWelcome] = useState(false);

  // Track previous fund-on state for ON/OFF transitions
  const prevAnyFundOn = useRef(false);
  const prevActiveFunds = useRef<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("kuber_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("kuber_user");
      }
    }
  }, []);

  // ─── Global background transaction engine ──────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const email = user.email;

    const getActiveFunds = () =>
      FUND_TYPES.filter(
        (f) =>
          localStorage.getItem(`kuber_fund_toggle_${email}_${f}`) === "true",
      );

    const handleFundOn = (activeFunds: string[]) => {
      // Record session start
      const currentBalance = Number(
        localStorage.getItem(`kuber_commission_${email}`) || "0",
      );
      const linkedBank = getLinkedBank(email);
      localStorage.setItem(
        `kuber_comm_session_start_${email}`,
        JSON.stringify({
          time: new Date().toLocaleString(),
          timestamp: Date.now(),
          balance: currentBalance,
          activeFunds,
          bank: linkedBank,
        }),
      );
      // Reset session commission tracker
      localStorage.setItem(`kuber_session_comm_${email}`, "{}");
      // Clear old live transactions for a fresh session
      localStorage.setItem(`kuber_live_${email}`, "[]");

      // Fire INSTANT first transaction
      generateTransaction(email, activeFunds);
    };

    const handleFundOff = (lastActiveFunds: string[]) => {
      const linkedBank = getLinkedBank(email);
      const currentTxs: LiveTx[] = JSON.parse(
        localStorage.getItem(`kuber_live_${email}`) || "[]",
      );

      // Save bank statement session
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
          fundTypes: lastActiveFunds,
          accountDetails: linkedBank,
          transactions: currentTxs,
        };
        const existingSessions = JSON.parse(
          localStorage.getItem(`kuber_fund_sessions_${email}`) || "[]",
        );
        existingSessions.unshift(session);
        localStorage.setItem(
          `kuber_fund_sessions_${email}`,
          JSON.stringify(existingSessions),
        );
      }

      // Save ONE commission cycle entry
      const sessionStartData = JSON.parse(
        localStorage.getItem(`kuber_comm_session_start_${email}`) || "null",
      );
      const currentCommBalance = Number(
        localStorage.getItem(`kuber_commission_${email}`) || "0",
      );
      if (sessionStartData) {
        const earned = currentCommBalance - (sessionStartData.balance || 0);
        if (earned > 0) {
          const cycles = JSON.parse(
            localStorage.getItem(`kuber_comm_cycles_${email}`) || "[]",
          );
          cycles.unshift({
            id: Date.now().toString(),
            fundTypes: sessionStartData.activeFunds || lastActiveFunds,
            sessionStart: sessionStartData.time,
            sessionEnd: new Date().toLocaleString(),
            sessionEndTimestamp: Date.now(),
            totalCommission: earned,
            bank: sessionStartData.bank || linkedBank,
          });
          localStorage.setItem(
            `kuber_comm_cycles_${email}`,
            JSON.stringify(cycles),
          );
        }
        localStorage.removeItem(`kuber_comm_session_start_${email}`);
      }
      // Reset session commission tracker
      localStorage.setItem(`kuber_session_comm_${email}`, "{}");
      // Clear live transactions
      localStorage.setItem(`kuber_live_${email}`, "[]");
    };

    // Initialize refs from current state
    const initActive = getActiveFunds();
    prevAnyFundOn.current = initActive.length > 0;
    prevActiveFunds.current = initActive;

    // If funds are already ON when we mount (e.g. page refresh), start session
    if (initActive.length > 0) {
      const existingSession = localStorage.getItem(
        `kuber_comm_session_start_${email}`,
      );
      if (!existingSession) {
        handleFundOn(initActive);
      }
    }

    const interval = setInterval(() => {
      const activeFunds = getActiveFunds();
      const anyOn = activeFunds.length > 0;
      const wasOn = prevAnyFundOn.current;

      // OFF → ON transition
      if (!wasOn && anyOn) {
        handleFundOn(activeFunds);
      }

      // ON → OFF transition
      if (wasOn && !anyOn) {
        handleFundOff(prevActiveFunds.current);
      }

      // Generate transaction if any fund is ON
      if (anyOn) {
        generateTransaction(email, activeFunds);
      }

      prevAnyFundOn.current = anyOn;
      prevActiveFunds.current = activeFunds;
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const handleLogin = (u: AuthUser) => {
    localStorage.setItem("kuber_user", JSON.stringify(u));
    setUser(u);
    setCurrentPage("dashboard");
    setShowWelcome(true);
    setTimeout(() => setShowWelcome(false), 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem("kuber_user");
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div
      onCopy={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: "none" }}
    >
      <DashboardLayout
        user={user}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      />
      {showWelcome && (
        <div
          data-ocid="welcome.modal"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.85)" }}
        >
          <div
            className="flex flex-col items-center gap-5 rounded-2xl p-10 text-center"
            style={{
              background: "#111111",
              border: "2px solid #d4a017",
              boxShadow: "0 0 60px rgba(212,160,23,0.35)",
              minWidth: 320,
              maxWidth: 420,
            }}
          >
            <img
              src="/assets/uploads/IMG_20260311_153559_128-1.jpg"
              alt="Kuber Panel"
              className="w-20 h-20 rounded-full object-cover"
              style={{ border: "2px solid #d4a017" }}
            />
            <div>
              <div
                className="text-xl font-bold mb-1"
                style={{
                  color: "#d4a017",
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: "0.02em",
                }}
              >
                Thanks For Joining
              </div>
              <div
                className="text-2xl font-extrabold"
                style={{
                  color: "#f5c842",
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: "0.04em",
                }}
              >
                Kuber Panel
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-semibold tracking-widest">
                LIVE
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
