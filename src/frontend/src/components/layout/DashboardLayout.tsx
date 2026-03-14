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

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll reset on page change
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
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#000000",
        color: "#fff",
        overflow: "hidden",
      }}
      onCopy={(e) => e.preventDefault()}
    >
      {/* Sticky Global Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#000000",
          borderBottom: "1px solid #1a1200",
          boxShadow: "0 1px 10px rgba(212,160,23,0.1)",
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          flexShrink: 0,
        }}
      >
        <div style={{ width: 34, flexShrink: 0 }}>
          {isDashboard && (
            <button
              type="button"
              data-ocid="sidebar.open.button"
              onClick={() => setSidebarOpen((v) => !v)}
              style={{
                width: 30,
                height: 30,
                background: "#0a0a0a",
                border: "1px solid #222",
                borderRadius: 6,
                color: "#d4a017",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label="Toggle sidebar"
            >
              <Menu size={14} />
            </button>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {/* 3-dot dropdown */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              data-ocid="header.menu.button"
              onClick={() => setDropdownOpen((v) => !v)}
              style={{
                width: 30,
                height: 30,
                background: "#0a0a0a",
                border: "1px solid #222",
                borderRadius: 6,
                color: "#d4a017",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
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
                    background: "#0a0a0a",
                    border: "1px solid #d4a017",
                    borderRadius: 10,
                    minWidth: 180,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.8)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid #1a1a1a",
                    }}
                  >
                    <div
                      style={{
                        color: "#f5c842",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Kuber Panel
                    </div>
                    <div
                      style={{
                        color: "#555",
                        fontSize: 11,
                        marginTop: 2,
                        wordBreak: "break-all",
                      }}
                    >
                      {user.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    data-ocid="header.dashboard.button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setCurrentPage("dashboard");
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "11px 14px",
                      color: "#e5e5e5",
                      fontSize: 13,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <Home size={13} color="#d4a017" /> Dashboard
                  </button>
                  <button
                    type="button"
                    data-ocid="header.profile.button"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "11px 14px",
                      color: "#e5e5e5",
                      fontSize: 13,
                      background: "none",
                      border: "none",
                      borderBottom: "1px solid #1a1a1a",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <User size={13} color="#d4a017" /> My Account
                  </button>
                  <button
                    type="button"
                    data-ocid="header.logout.button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "11px 14px",
                      color: "#f5c842",
                      fontSize: 13,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <LogOut size={13} color="#d4a017" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#000",
              border: "1px solid #22c55e",
              borderRadius: 20,
              padding: "4px 10px",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                color: "#22c55e",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              LIVE
            </span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
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

        {/* biome-ignore lint/a11y/useKeyWithClickEvents: close sidebar on outside click */}
        <main
          ref={mainRef}
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#000000",
            position: "relative",
          }}
          onClick={isDashboard ? closeSidebar : undefined}
        >
          {/* Scroll progress bar */}
          <div
            style={{
              position: "sticky",
              top: 0,
              left: 0,
              width: "100%",
              height: 3,
              background: "rgba(212,160,23,0.1)",
              zIndex: 40,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${scrollPercent}%`,
                background: "linear-gradient(90deg, #d4a017, #f5c842)",
                transition: "width 0.1s ease",
              }}
            />
          </div>

          <div style={{ padding: "14px 14px" }}>{renderPage()}</div>
        </main>
      </div>
    </div>
  );
}
