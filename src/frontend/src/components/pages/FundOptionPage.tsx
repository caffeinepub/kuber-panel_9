import { Lock } from "lucide-react";
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
    commission: 30,
    color: "#7c3aed",
    description:
      "Gaming Fund invests in online gaming platforms, esports tournaments, and gaming infrastructure. Returns 30% commission on active participation.",
    steps: [
      {
        step: 1,
        title: "Activate Fund",
        desc: "Enter activation code to unlock Gaming Fund",
      },
      {
        step: 2,
        title: "Link Bank Account",
        desc: "Connect your approved bank account for payouts",
      },
      {
        step: 3,
        title: "Earn 30% Commission",
        desc: "Commission credited daily on active transactions",
      },
    ],
    earningTable: [
      { invest: "₹1,000", daily: "₹300", monthly: "₹9,000" },
      { invest: "₹5,000", daily: "₹1,500", monthly: "₹45,000" },
      { invest: "₹10,000", daily: "₹3,000", monthly: "₹90,000" },
      { invest: "₹25,000", daily: "₹7,500", monthly: "₹2,25,000" },
    ],
    rules: [
      "Minimum investment: ₹1,000",
      "Maximum investment: ₹50,000",
      "Withdrawal available after 7 days",
      "Commission credited daily to linked bank account",
      "Activation code required to unlock fund",
    ],
    commissionType: "Daily",
  },
  stock: {
    label: "Stock Fund",
    commission: 30,
    color: "#0ea5e9",
    description:
      "Stock Fund invests in NSE/BSE listed companies. Expert-managed portfolio with 30% commission returns on stock trades.",
    steps: [
      {
        step: 1,
        title: "Activate Fund",
        desc: "Enter activation code to unlock Stock Fund",
      },
      {
        step: 2,
        title: "Select Investment Amount",
        desc: "Choose your investment amount (min ₹2,000)",
      },
      {
        step: 3,
        title: "Earn 30% Commission",
        desc: "Commission paid weekly on stock trade profits",
      },
    ],
    earningTable: [
      { invest: "₹2,000", daily: "₹600", monthly: "₹18,000" },
      { invest: "₹10,000", daily: "₹3,000", monthly: "₹90,000" },
      { invest: "₹25,000", daily: "₹7,500", monthly: "₹2,25,000" },
      { invest: "₹1,00,000", daily: "₹30,000", monthly: "₹9,00,000" },
    ],
    rules: [
      "Minimum investment: ₹2,000",
      "Maximum investment: ₹1,00,000",
      "Market hours: 9:00 AM – 3:30 PM (Mon–Fri)",
      "Commission credited weekly every Monday",
      "NSE/BSE regulated investments only",
    ],
    commissionType: "Weekly",
  },
  mix: {
    label: "Mix Fund",
    commission: 30,
    color: "#10b981",
    description:
      "Mix Fund diversifies across Gaming, Stock, and Crypto markets for balanced 30% returns. Best suited for steady income.",
    steps: [
      {
        step: 1,
        title: "Activate Fund",
        desc: "Enter activation code to unlock Mix Fund",
      },
      {
        step: 2,
        title: "Auto-Diversify Portfolio",
        desc: "Funds auto-split across Gaming, Stock & Crypto",
      },
      {
        step: 3,
        title: "Earn 30% Commission",
        desc: "Balanced returns paid bi-weekly",
      },
    ],
    earningTable: [
      { invest: "₹1,500", daily: "₹450", monthly: "₹13,500" },
      { invest: "₹7,500", daily: "₹2,250", monthly: "₹67,500" },
      { invest: "₹20,000", daily: "₹6,000", monthly: "₹1,80,000" },
      { invest: "₹75,000", daily: "₹22,500", monthly: "₹6,75,000" },
    ],
    rules: [
      "Minimum investment: ₹1,500",
      "Maximum investment: ₹75,000",
      "Diversified portfolio (Gaming 40%, Stock 40%, Crypto 20%)",
      "Commission credited bi-weekly (every 15 days)",
      "Portfolio rebalanced automatically",
    ],
    commissionType: "Bi-weekly",
  },
  political: {
    label: "Political Fund",
    commission: 25,
    color: "#f59e0b",
    description:
      "Political Fund supports election campaigns and political events. 25% commission on completed events. Event-based returns with high yield.",
    steps: [
      {
        step: 1,
        title: "Activate Fund",
        desc: "Enter activation code to unlock Political Fund",
      },
      {
        step: 2,
        title: "Select Political Event",
        desc: "Choose from upcoming election events",
      },
      {
        step: 3,
        title: "Earn 25% Commission",
        desc: "Commission credited on event completion",
      },
    ],
    earningTable: [
      { invest: "Small Event", daily: "₹500 commission", monthly: "per event" },
      {
        invest: "Medium Event",
        daily: "₹2,000 commission",
        monthly: "per event",
      },
      {
        invest: "Large Event",
        daily: "₹10,000 commission",
        monthly: "per event",
      },
      { invest: "₹3,000 base", daily: "₹750", monthly: "₹22,500" },
    ],
    rules: [
      "Minimum investment: ₹3,000",
      "Event-based returns (not daily)",
      "Commission credited on event completion",
      "Events: Local/State/National elections",
      "High-yield, high-frequency during election season",
    ],
    commissionType: "Per Event",
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

      {/* Status bar */}
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
        <span
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background: "rgba(100,100,100,0.15)",
            color: "#a1a1aa",
            border: "1px solid #3f3f4640",
          }}
        >
          {fund.commissionType}
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

      {/* Alert for locked fund */}
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
          Panel to unlock it. You can still view fund details below.
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
          admin approval before activating the fund.
        </div>
      )}

      {/* Fund Info Cards — always visible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 relative">
        {/* Lock overlay if not activated */}
        {!isActivated && (
          <div
            className="absolute inset-0 z-10 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(2px)",
            }}
          >
            <div
              className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl"
              style={{ background: "#111111", border: "1px solid #d4a01730" }}
            >
              <Lock size={32} style={{ color: "#d4a017" }} />
              <div className="text-white font-bold text-base">Fund Locked</div>
              <div className="text-zinc-400 text-xs text-center">
                Activate this fund to start earning
              </div>
            </div>
          </div>
        )}

        {/* Description card */}
        <div
          className="rounded-xl p-5"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <div
            className="text-xs font-bold tracking-widest mb-3 uppercase"
            style={{ color: fund.color }}
          >
            About {fundLabel}
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed">
            {fund.description}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-3xl font-black" style={{ color: "#f5c842" }}>
              {commissionRate}%
            </span>
            <span className="text-zinc-400 text-sm">Commission Rate</span>
          </div>
        </div>

        {/* How it works */}
        <div
          className="rounded-xl p-5"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <div
            className="text-xs font-bold tracking-widest mb-4 uppercase"
            style={{ color: fund.color }}
          >
            How It Works
          </div>
          <div className="space-y-3">
            {fund.steps.map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: fund.color, color: "#fff" }}
                >
                  {s.step}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">
                    {s.title}
                  </div>
                  <div className="text-zinc-500 text-xs">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earning estimate */}
        <div
          className="rounded-xl p-5"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <div
            className="text-xs font-bold tracking-widest mb-3 uppercase"
            style={{ color: fund.color }}
          >
            {fundType === "political"
              ? "Event Earnings"
              : "Daily Earning Estimate"}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "#71717a" }}>
                <th className="text-left py-1.5 text-xs font-semibold">
                  Investment
                </th>
                <th className="text-left py-1.5 text-xs font-semibold">
                  {fundType === "political" ? "Commission" : "Daily Earning"}
                </th>
                <th className="text-left py-1.5 text-xs font-semibold">
                  {fundType === "political" ? "Type" : "Monthly"}
                </th>
              </tr>
            </thead>
            <tbody>
              {fund.earningTable.map((row) => (
                <tr
                  key={row.invest}
                  className="border-t"
                  style={{ borderColor: "#27272a" }}
                >
                  <td className="py-2 text-zinc-300 text-xs">{row.invest}</td>
                  <td
                    className="py-2 font-semibold text-xs"
                    style={{ color: "#f5c842" }}
                  >
                    {row.daily}
                  </td>
                  <td className="py-2 text-green-400 text-xs">{row.monthly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rules */}
        <div
          className="rounded-xl p-5"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <div
            className="text-xs font-bold tracking-widest mb-3 uppercase"
            style={{ color: fund.color }}
          >
            Important Rules
          </div>
          <ul className="space-y-2">
            {fund.rules.map((rule) => (
              <li
                key={rule}
                className="flex items-start gap-2 text-zinc-300 text-xs"
              >
                <span
                  style={{ color: fund.color }}
                  className="mt-0.5 flex-shrink-0"
                >
                  ▸
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bank account toggle section */}
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
                    style={{
                      background: isOn ? "#10b981" : "#3f3f46",
                    }}
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
                Add and get a bank account approved first.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
