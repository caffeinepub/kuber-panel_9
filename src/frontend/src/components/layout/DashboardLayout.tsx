import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AuthUser, Page } from "../../App";
import ActivationPage from "../pages/ActivationPage";
import AddBankPage from "../pages/AddBankPage";
import BankStatementPage from "../pages/BankStatementPage";
import CommissionPage from "../pages/CommissionPage";
import DashboardHomePage from "../pages/DashboardHomePage";
import FundOptionPage from "../pages/FundOptionPage";
import HelpSupportPage from "../pages/HelpSupportPage";
import LiveActivityPage from "../pages/LiveActivityPage";
import WithdrawalHistoryPage from "../pages/WithdrawalHistoryPage";
import WithdrawalPage from "../pages/WithdrawalPage";
import BankApprovalPage from "../pages/admin/BankApprovalPage";
import ChangeSupportPage from "../pages/admin/ChangeSupportPage";
import GeneratedCodesPage from "../pages/admin/GeneratedCodesPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import Sidebar from "./Sidebar";

interface Props {
  user: AuthUser;
  currentPage: Page;
  setCurrentPage: (p: Page) => void;
  onLogout: () => void;
}

export default function DashboardLayout({
  user,
  currentPage,
  setCurrentPage,
  onLogout,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [scrollPercent, setScrollPercent] = useState(0);
  const mainRef = useRef<HTMLElement>(null);

  const isDashboard = currentPage === "dashboard";

  const closeSidebar = () => {
    if (sidebarOpen) setSidebarOpen(false);
  };

  // Reset scroll progress when page changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll reset on page change needs currentPage as trigger
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setScrollPercent(0);
  }, [currentPage]);

  // Track scroll progress
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const total = scrollHeight - clientHeight;
      const pct = total > 0 ? (scrollTop / total) * 100 : 0;
      setScrollPercent(pct);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const renderPage = () => {
    const activatedFunds: string[] = JSON.parse(
      localStorage.getItem(`kuber_activated_${user.email}`) || "[]",
    );
    const hasActivation = activatedFunds.length > 0 || user.isAdmin;

    if (
      !hasActivation &&
      currentPage !== "activation" &&
      currentPage !== "help-support" &&
      currentPage !== "dashboard"
    ) {
      return (
        <ActivationPage
          user={user}
          onActivated={() => setCurrentPage("dashboard")}
          setCurrentPage={setCurrentPage}
        />
      );
    }

    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardHomePage user={user} setCurrentPage={setCurrentPage} />
        );
      case "add-bank":
        return <AddBankPage user={user} setCurrentPage={setCurrentPage} />;
      case "bank-statement":
        return (
          <BankStatementPage user={user} setCurrentPage={setCurrentPage} />
        );
      case "gaming-fund":
        return (
          <FundOptionPage
            user={user}
            fundType="gaming"
            commissionRate={30}
            setCurrentPage={setCurrentPage}
          />
        );
      case "stock-fund":
        return (
          <FundOptionPage
            user={user}
            fundType="stock"
            commissionRate={30}
            setCurrentPage={setCurrentPage}
          />
        );
      case "mix-fund":
        return (
          <FundOptionPage
            user={user}
            fundType="mix"
            commissionRate={30}
            setCurrentPage={setCurrentPage}
          />
        );
      case "political-fund":
        return (
          <FundOptionPage
            user={user}
            fundType="political"
            commissionRate={25}
            setCurrentPage={setCurrentPage}
          />
        );
      case "live-activity":
        return <LiveActivityPage user={user} setCurrentPage={setCurrentPage} />;
      case "commission":
        return <CommissionPage user={user} setCurrentPage={setCurrentPage} />;
      case "withdrawal":
        return <WithdrawalPage user={user} setCurrentPage={setCurrentPage} />;
      case "withdrawal-history":
        return (
          <WithdrawalHistoryPage user={user} setCurrentPage={setCurrentPage} />
        );
      case "activation":
        return (
          <ActivationPage
            user={user}
            onActivated={() => setCurrentPage("dashboard")}
            setCurrentPage={setCurrentPage}
          />
        );
      case "help-support":
        return <HelpSupportPage user={user} setCurrentPage={setCurrentPage} />;
      case "generated-codes":
        return user.isAdmin ? (
          <GeneratedCodesPage setCurrentPage={setCurrentPage} />
        ) : null;
      case "user-management":
        return user.isAdmin ? (
          <UserManagementPage setCurrentPage={setCurrentPage} />
        ) : null;
      case "bank-approval":
        return user.isAdmin ? (
          <BankApprovalPage setCurrentPage={setCurrentPage} />
        ) : null;
      case "change-support":
        return user.isAdmin ? (
          <ChangeSupportPage setCurrentPage={setCurrentPage} />
        ) : null;
      default:
        return (
          <DashboardHomePage user={user} setCurrentPage={setCurrentPage} />
        );
    }
  };

  return (
    <div
      className="flex h-screen text-white overflow-hidden"
      style={{ background: "#000000" }}
      onCopy={(e) => e.preventDefault()}
    >
      {/* Sidebar only accessible from dashboard */}
      {isDashboard && (
        <Sidebar
          user={user}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onLogout={onLogout}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />
      )}
      {/* Floating hamburger -- only on dashboard when sidebar is closed */}
      {isDashboard && !sidebarOpen && (
        <button
          type="button"
          data-ocid="sidebar.open.button"
          onClick={() => setSidebarOpen(true)}
          className="fixed top-3 left-3 z-50 w-7 h-7 flex items-center justify-center rounded-md transition-colors"
          style={{
            background: "#111111",
            border: "1px solid #2a2a2a",
            color: "#d4a017",
          }}
          aria-label="Open sidebar"
        >
          <Menu size={14} />
        </button>
      )}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: sidebar close on outside click is a UX pattern */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto relative"
        style={{ background: "#0a0a0a", scrollBehavior: "smooth" }}
        onClick={isDashboard ? closeSidebar : undefined}
      >
        {/* Scroll progress bar */}
        <div
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            width: "100%",
            height: "3px",
            background: "rgba(212,160,23,0.15)",
            zIndex: 40,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${scrollPercent}%`,
              background: "linear-gradient(90deg, #d4a017, #f5c842)",
              transition: "width 0.1s ease",
              boxShadow: scrollPercent > 0 ? "0 0 8px #d4a017aa" : "none",
            }}
          />
        </div>

        <div className="p-4 md:p-6">{renderPage()}</div>
      </main>
    </div>
  );
}
