import { useEffect, useState } from "react";
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

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [showWelcome, setShowWelcome] = useState(false);

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
    <div onCopy={(e) => e.preventDefault()} style={{ userSelect: "none" }}>
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
              background: "#080f2a",
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
