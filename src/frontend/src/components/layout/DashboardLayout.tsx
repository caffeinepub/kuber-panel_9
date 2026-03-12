import { useState } from "react";
import type { AuthUser, Page } from "../../App";
import ActivationPage from "../pages/ActivationPage";
import AddBankPage from "../pages/AddBankPage";
import BankStatementPage from "../pages/BankStatementPage";
import CommissionPage from "../pages/CommissionPage";
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

  const renderPage = () => {
    const activatedFunds: string[] = JSON.parse(
      localStorage.getItem(`kuber_activated_${user.email}`) || "[]",
    );
    const hasActivation = activatedFunds.length > 0 || user.isAdmin;

    if (
      !hasActivation &&
      currentPage !== "activation" &&
      currentPage !== "help-support"
    ) {
      return (
        <ActivationPage
          user={user}
          onActivated={() => setCurrentPage("add-bank")}
        />
      );
    }

    switch (currentPage) {
      case "add-bank":
        return <AddBankPage user={user} />;
      case "bank-statement":
        return <BankStatementPage user={user} />;
      case "gaming-fund":
        return (
          <FundOptionPage user={user} fundType="gaming" commissionRate={15} />
        );
      case "stock-fund":
        return (
          <FundOptionPage user={user} fundType="stock" commissionRate={30} />
        );
      case "mix-fund":
        return (
          <FundOptionPage user={user} fundType="mix" commissionRate={30} />
        );
      case "political-fund":
        return (
          <FundOptionPage
            user={user}
            fundType="political"
            commissionRate={25}
          />
        );
      case "live-activity":
        return <LiveActivityPage user={user} />;
      case "commission":
        return <CommissionPage user={user} />;
      case "withdrawal":
        return <WithdrawalPage user={user} />;
      case "withdrawal-history":
        return <WithdrawalHistoryPage user={user} />;
      case "activation":
        return (
          <ActivationPage
            user={user}
            onActivated={() => setCurrentPage("add-bank")}
          />
        );
      case "help-support":
        return <HelpSupportPage user={user} />;
      case "generated-codes":
        return user.isAdmin ? <GeneratedCodesPage /> : null;
      case "user-management":
        return user.isAdmin ? <UserManagementPage /> : null;
      case "bank-approval":
        return user.isAdmin ? <BankApprovalPage /> : null;
      case "change-support":
        return user.isAdmin ? <ChangeSupportPage /> : null;
      default:
        return <AddBankPage user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar
        user={user}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={onLogout}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />
      <main className="flex-1 overflow-y-auto bg-zinc-950">
        <div className="p-4 md:p-6">{renderPage()}</div>
      </main>
    </div>
  );
}
