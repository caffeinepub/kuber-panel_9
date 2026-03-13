import { useState } from "react";
import type { AuthUser, Page } from "../../App";
import PageHeader from "../ui/PageHeader";

interface BankAccount {
  id: string;
  accountType: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  mobileNumber: string;
  upiId: string;
  status: "pending" | "approved" | "rejected";
}

interface Props {
  user: AuthUser;
  fundType: string;
  commissionRate: number;
  setCurrentPage?: (p: Page) => void;
}

const FUND_DATA = {
  gaming: {
    label: "Gaming Fund",
    commission: 15,
    color: "#7c3aed",
  },
  stock: {
    label: "Stock Fund",
    commission: 30,
    color: "#0ea5e9",
  },
  mix: {
    label: "Mix Fund",
    commission: 25,
    color: "#10b981",
  },
  political: {
    label: "Political Fund",
    commission: 30,
    color: "#f59e0b",
  },
};

export default function FundOptionPage({
  user,
  fundType,
  commissionRate,
  setCurrentPage,
}: Props) {
  const banks: BankAccount[] = JSON.parse(
    localStorage.getItem(`kuber_banks_${user.email}`) || "[]",
  );
  const approvedBanks = banks.filter((b) => b.status === "approved");

  const toggleKey = `kuber_fund_toggle_${user.email}_${fundType}`;
  const [isOn, setIsOn] = useState(
    () => localStorage.getItem(toggleKey) === "true",
  );

  const activatedFunds: string[] = JSON.parse(
    localStorage.getItem(`kuber_activated_${user.email}`) || "[]",
  );
  const isActivated =
    activatedFunds.includes(fundType) ||
    activatedFunds.includes("all") ||
    user.isAdmin;

  const fund = FUND_DATA[fundType as keyof typeof FUND_DATA];
  const fundLabel = fund?.label || fundType;

  const handleToggle = () => {
    if (!isActivated || approvedBanks.length === 0) return;
    const newVal = !isOn;
    setIsOn(newVal);
    localStorage.setItem(toggleKey, String(newVal));
  };

  if (!fund) return null;

  return (
    <div>
      <PageHeader
        title={`${fundLabel} - ${commissionRate}% Commission`}
        subtitle="Manage your fund activation and view earnings"
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background: isActivated
              ? "rgba(16,185,129,0.15)"
              : "rgba(239,68,68,0.15)",
            color: isActivated ? "#10b981" : "#ef4444",
            border: `1px solid ${isActivated ? "#10b981" : "#ef4444"}40`,
          }}
        >
          {isActivated ? "✓ ACTIVATED" : "🔒 LOCKED"}
        </span>
        <span
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background: "rgba(212,160,23,0.15)",
            color: "#f5c842",
            border: "1px solid #d4a01740",
          }}
        >
          {commissionRate}% Commission
        </span>
        {isOn && isActivated && (
          <span
            className="px-3 py-1 rounded-full text-xs font-bold animate-pulse"
            style={{
              background: "rgba(16,185,129,0.2)",
              color: "#10b981",
              border: "1px solid #10b98150",
            }}
          >
            🟢 LIVE
          </span>
        )}
      </div>

      {!isActivated && (
        <div
          className="rounded-xl p-4 mb-6 text-sm"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#fca5a5",
          }}
        >
          🔒 This fund is locked. Enter an activation code in the Activation
          Panel to unlock it.
        </div>
      )}

      {isActivated && approvedBanks.length === 0 && (
        <div
          className="rounded-xl p-4 mb-6 text-sm"
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.3)",
            color: "#fcd34d",
          }}
        >
          ⚠️ No approved bank accounts. Please add a bank account and wait for
          company approval before activating the fund.
        </div>
      )}

      {isActivated && (
        <div>
          <div
            className="text-xs font-bold tracking-widest mb-3 uppercase"
            style={{ color: "#f5c842" }}
          >
            Linked Bank Accounts
          </div>

          {approvedBanks.map((bank, i) => (
            <div
              key={bank.id}
              data-ocid={`fund.bank_card.${i + 1}`}
              className="rounded-xl p-5 mb-4"
              style={{ background: "#111111", border: "1px solid #333333" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white font-semibold">
                    {bank.bankName}
                  </div>
                  <div className="text-zinc-400 text-sm mt-1">
                    {bank.accountHolder}
                  </div>
                  <div className="text-zinc-500 text-xs mt-0.5">
                    Account: {bank.accountNumber} | IFSC: {bank.ifscCode}
                  </div>
                  <div className="text-zinc-500 text-xs">
                    UPI: {bank.upiId} | Mobile: {bank.mobileNumber}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      color: "#10b981",
                      border: "1px solid #10b98140",
                    }}
                  >
                    APPROVED
                  </span>
                  <button
                    type="button"
                    data-ocid={`fund.toggle.${i + 1}`}
                    onClick={handleToggle}
                    className="relative w-14 h-7 rounded-full transition-colors"
                    style={{ background: isOn ? "#10b981" : "#3f3f46" }}
                  >
                    <span
                      className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform"
                      style={{
                        transform: isOn
                          ? "translateX(28px)"
                          : "translateX(2px)",
                      }}
                    />
                  </button>
                </div>
              </div>
              <div
                className="mt-3 pt-3"
                style={{ borderTop: "1px solid #333333" }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: isOn ? "#10b981" : "#71717a" }}
                >
                  {fundLabel} is {isOn ? "ON — Live & Earning" : "OFF"}
                </span>
                {isOn && (
                  <span
                    className="ml-2 text-xs font-bold"
                    style={{ color: "#f5c842" }}
                  >
                    {commissionRate}% commission active
                  </span>
                )}
              </div>
            </div>
          ))}

          {approvedBanks.length === 0 && (
            <div
              data-ocid="fund.empty_state"
              className="text-center py-12 rounded-xl"
              style={{ background: "#111111", border: "1px solid #333333" }}
            >
              <div className="text-4xl mb-3">🏦</div>
              <p className="text-zinc-500 text-sm">
                Add and get a bank account approved by the company first.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
