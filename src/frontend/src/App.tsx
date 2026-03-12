import { useEffect, useState } from "react";
import LoginPage from "./components/auth/LoginPage";
import DashboardLayout from "./components/layout/DashboardLayout";

export interface AuthUser {
  email: string;
  isAdmin: boolean;
  userId: string;
}

export type Page =
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
  const [currentPage, setCurrentPage] = useState<Page>("add-bank");

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
    setCurrentPage("add-bank");
  };

  const handleLogout = () => {
    localStorage.removeItem("kuber_user");
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout
      user={user}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      onLogout={handleLogout}
    />
  );
}
