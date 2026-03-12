import { useState } from "react";
import type { AuthUser } from "../../App";
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
}

export default function FundOptionPage({
  user,
  fundType,
  commissionRate,
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
    activatedFunds.includes(fundType) || activatedFunds.includes("all");

  const fundLabels: Record<string, string> = {
    gaming: "Gaming Fund",
    stock: "Stock Fund",
    mix: "Mix Fund",
    political: "Political Fund",
  };

  const handleToggle = () => {
    if (!isActivated || approvedBanks.length === 0) return;
    const newVal = !isOn;
    setIsOn(newVal);
    localStorage.setItem(toggleKey, String(newVal));
  };

  return (
    <div>
      <PageHeader
        title={`${fundLabels[fundType] || fundType} - ${commissionRate}% Commission`}
        subtitle="Manage your fund activation"
      />

      {!isActivated && (
        <div className="bg-red-950/20 border border-red-900 rounded-xl p-4 mb-6 text-red-400 text-sm">
          🔒 This fund option is locked. Please activate it using an activation
          code.
        </div>
      )}

      {isActivated && approvedBanks.length === 0 && (
        <div className="bg-amber-950/20 border border-amber-900 rounded-xl p-4 mb-6 text-amber-400 text-sm">
          ⚠️ No approved bank accounts. Please add a bank account and wait for
          admin approval.
        </div>
      )}

      {approvedBanks.map((bank, i) => (
        <div
          key={bank.id}
          data-ocid={`fund.bank_card.${i + 1}`}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-white font-semibold text-lg">
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
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs text-green-400 bg-green-950/30 border border-green-800 px-2 py-1 rounded-full">
                APPROVED
              </span>
              {isActivated && (
                <button
                  type="button"
                  data-ocid={`fund.toggle.${i + 1}`}
                  onClick={handleToggle}
                  disabled={approvedBanks.length === 0}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    isOn ? "bg-green-500" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      isOn ? "translate-x-7" : "translate-x-0.5"
                    }`}
                  />
                </button>
              )}
            </div>
          </div>
          {isActivated && (
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <span
                className={`text-sm font-medium ${isOn ? "text-green-400" : "text-zinc-500"}`}
              >
                {fundLabels[fundType]} is {isOn ? "ON - Live" : "OFF"}
              </span>
              {isOn && (
                <span className="ml-2 text-xs text-amber-400">
                  {commissionRate}% commission active
                </span>
              )}
            </div>
          )}
        </div>
      ))}

      {approvedBanks.length === 0 && (
        <div
          data-ocid="fund.empty_state"
          className="text-center text-zinc-600 py-16"
        >
          <div className="text-4xl mb-3">🏦</div>
          <p>Add and get a bank account approved first.</p>
        </div>
      )}
    </div>
  );
}
