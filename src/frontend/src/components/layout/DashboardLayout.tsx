import { Home, LogOut, Menu, MoreVertical, User } from "lucide-react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const mainRef = useRef<HTMLElement>(null);

  const isDashboard = currentPage === "dashboard";

  const closeSidebar = () => {
    if (sidebarOpen) setSidebarOpen(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll reset on page change needs currentPage as trigger
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setScrollPercent(0);
  }, [currentPage]);

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
            commissionRate={15}
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
            commissionRate={25}
            setCurrentPage={setCurrentPage}
          />
        );
      case "political-fund":
        return (
          <FundOptionPage
            user={user}
            fundType="political"
            commissionRate={30}
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
      className="flex flex-col h-screen text-white overflow-hidden"
      style={{ background: "#000000" }}
      onCopy={(e) => e.preventDefault()}
    >
      {/* Sticky Global Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#000000",
          borderBottom: "2px solid #1a1200",
          boxShadow: "0 2px 12px rgba(212,160,23,0.15)",
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          flexShrink: 0,
        }}
      >
        {/* Left: hamburger (dashboard only) */}
        <div style={{ width: 36, flexShrink: 0 }}>
          {isDashboard && (
            <button
              type="button"
              data-ocid="sidebar.open.button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex items-center justify-center rounded-md transition-colors"
              style={{
                width: 30,
                height: 30,
                background: "#111111",
                border: "1px solid #2a2a2a",
                color: "#d4a017",
              }}
              aria-label="Toggle sidebar"
            >
              <Menu size={14} />
            </button>
          )}
        </div>

        {/* Right: 3-dot menu + LIVE badge */}
        <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
          {/* 3-dot dropdown */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              data-ocid="header.menu.button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center justify-center rounded-md transition-colors"
              style={{
                width: 30,
                height: 30,
                background: "#111111",
                border: "1px solid #2a2a2a",
                color: "#d4a017",
              }}
              aria-label="Options menu"
            >
              <MoreVertical size={16} />
            </button>
            {dropdownOpen && (
              <>
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: overlay to close dropdown */}
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 98 }}
                  onClick={() => setDropdownOpen(false)}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 6px)",
                    zIndex: 99,
                    background: "#111111",
                    border: "1px solid #d4a017",
                    borderRadius: 10,
                    minWidth: 180,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
                    overflow: "hidden",
                  }}
                >
                  {/* User info */}
                  <div
                    className="px-4 py-3"
                    style={{ borderBottom: "1px solid #2a2a2a" }}
                  >
                    <div
                      className="text-xs font-bold"
                      style={{ color: "#f5c842" }}
                    >
                      Kuber Panel
                    </div>
                    <div
                      className="text-xs mt-0.5 break-all"
                      style={{ color: "#888" }}
                    >
                      {user.email}
                    </div>
                  </div>

                  {/* Dashboard */}
                  <button
                    type="button"
                    data-ocid="header.dashboard.button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setCurrentPage("dashboard");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-zinc-800"
                    style={{ color: "#e5e5e5" }}
                  >
                    <Home size={14} style={{ color: "#d4a017" }} />
                    Dashboard
                  </button>

                  {/* Profile / Account */}
                  <button
                    type="button"
                    data-ocid="header.profile.button"
                    onClick={() => {
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-zinc-800"
                    style={{
                      color: "#e5e5e5",
                      borderBottom: "1px solid #2a2a2a",
                    }}
                  >
                    <User size={14} style={{ color: "#d4a017" }} />
                    My Account
                  </button>

                  {/* Logout — always at the bottom */}
                  <button
                    type="button"
                    data-ocid="header.logout.button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-zinc-800"
                    style={{ color: "#f5c842" }}
                  >
                    <LogOut size={14} style={{ color: "#d4a017" }} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{
              background: "#000",
              border: "1px solid #22c55e",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span
              className="text-xs font-bold tracking-widest"
              style={{ color: "#22c55e" }}
            >
              LIVE
            </span>
          </div>
        </div>
      </header>

      {/* Body: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
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
    </div>
  );
}
