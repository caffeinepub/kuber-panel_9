import { useState } from "react";
import type { AuthUser, Page } from "../../App";
import PageHeader from "../ui/PageHeader";

interface Props {
  user: AuthUser;
  setCurrentPage: (p: Page) => void;
}

const FUND_RATES: Record<string, number> = {
  gaming: 30,
  stock: 30,
  mix: 30,
  political: 25,
};
const FUND_LABELS: Record<string, string> = {
  gaming: "Gaming Fund",
  stock: "Stock Fund",
  mix: "Mix Fund",
  political: "Political Fund",
};

interface CommHistory {
  id: string;
  fund: string;
  amount: number;
  date: string;
  txAmount: number;
}

interface GroupedEntry {
  fund: string;
  label: string;
  totalAmount: number;
  count: number;
  firstDate: string;
  lastDate: string;
  isGrouped: true;
}

interface SingleEntry extends CommHistory {
  isGrouped: false;
}

type HistoryEntry = GroupedEntry | SingleEntry;

export default function CommissionPage({ user, setCurrentPage }: Props) {
  const [activeTab, setActiveTab] = useState<"breakdown" | "history">(
    "breakdown",
  );

  const balance = Number.parseFloat(
    localStorage.getItem(`kuber_commission_${user.email}`) || "0",
  );

  const history: CommHistory[] = JSON.parse(
    localStorage.getItem(`kuber_comm_history_${user.email}`) || "[]",
  );

  const activatedFunds: string[] = JSON.parse(
    localStorage.getItem(`kuber_activated_${user.email}`) || "[]",
  );
  const allFundsActive = activatedFunds.includes("all") || user.isAdmin;

  const fundBreakdown = Object.keys(FUND_LABELS).map((key) => {
    const isActive = allFundsActive || activatedFunds.includes(key);
    const toggleOn =
      localStorage.getItem(`kuber_fund_toggle_${user.email}_${key}`) === "true";
    const earned = history
      .filter((h) => h.fund === key)
      .reduce((s, h) => s + h.amount, 0);
    return {
      key,
      label: FUND_LABELS[key],
      rate: FUND_RATES[key],
      earned,
      active: isActive && toggleOn,
    };
  });

  // Build history entries: group OFF funds, show individual for ON funds
  const buildHistoryEntries = (): HistoryEntry[] => {
    const entries: HistoryEntry[] = [];
    const funds = Object.keys(FUND_LABELS);

    for (const fund of funds) {
      const toggleVal = localStorage.getItem(
        `kuber_fund_toggle_${user.email}_${fund}`,
      );
      const isOff = toggleVal === "false";
      const fundHistory = history.filter((h) => h.fund === fund);
      if (fundHistory.length === 0) continue;

      if (isOff) {
        // Group all entries for this OFF fund into one card
        const total = fundHistory.reduce((s, h) => s + h.amount, 0);
        const dates = fundHistory.map((h) => h.date);
        entries.push({
          isGrouped: true,
          fund,
          label: FUND_LABELS[fund],
          totalAmount: total,
          count: fundHistory.length,
          firstDate: dates[dates.length - 1],
          lastDate: dates[0],
        });
      } else {
        // Show individual entries
        for (const h of fundHistory) {
          entries.push({ ...h, isGrouped: false });
        }
      }
    }

    return entries;
  };

  const historyEntries = buildHistoryEntries();

  const getBankDetails = () => {
    const banks: Array<{
      id: string;
      bankName: string;
      accountHolder: string;
      accountNumber: string;
      ifscCode: string;
      mobile?: string;
      mobileNumber?: string;
      status: string;
    }> = JSON.parse(localStorage.getItem(`kuber_banks_${user.email}`) || "[]");
    const approved = banks.find((b) => b.status === "approved");
    return approved || banks[0] || null;
  };

  const bankDetails = getBankDetails();

  return (
    <div>
      <PageHeader
        title="My Commission"
        subtitle="Real-time commission earnings"
        onBack={() => setCurrentPage("dashboard")}
      />

      {/* Total Commission Card */}
      <div
        className="rounded-2xl p-5 mb-5"
        style={{
          background: "linear-gradient(135deg, #1a1500 0%, #2a2000 100%)",
          border: "1px solid #3d2f00",
        }}
      >
        <div className="text-sm mb-1" style={{ color: "#8899c0" }}>
          Total Commission Earned
        </div>
        <div
          className="text-4xl font-extrabold mb-2"
          style={{ color: "#f5c842" }}
        >
          ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: balance > 0 ? "#10b981" : "#71717a" }}
          />
          <span className="text-xs" style={{ color: "#8899c0" }}>
            {balance > 0
              ? "Commission available"
              : "Commission preserved — no fund active"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex rounded-xl p-1 mb-5 w-fit"
        style={{ background: "#111111", border: "1px solid #333333" }}
      >
        <button
          type="button"
          data-ocid="commission.breakdown.tab"
          onClick={() => setActiveTab("breakdown")}
          className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
          style={{
            background:
              activeTab === "breakdown"
                ? "linear-gradient(135deg, #d4a017, #f5c842)"
                : "transparent",
            color: activeTab === "breakdown" ? "#000" : "#8899c0",
          }}
        >
          Fund Breakdown
        </button>
        <button
          type="button"
          data-ocid="commission.history.tab"
          onClick={() => setActiveTab("history")}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background:
              activeTab === "history"
                ? "linear-gradient(135deg, #d4a017, #f5c842)"
                : "transparent",
            color: activeTab === "history" ? "#000" : "#8899c0",
          }}
        >
          Commission History
        </button>
      </div>

      {/* Fund Breakdown */}
      {activeTab === "breakdown" && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid #333333" }}
        >
          <div
            className="px-4 py-3"
            style={{
              background: "#07112a",
              borderBottom: "1px solid #333333",
            }}
          >
            <h3 className="text-white font-bold text-sm">
              Fund-wise Breakdown
            </h3>
          </div>
          <div style={{ background: "#111111" }}>
            <div
              className="grid grid-cols-4 px-4 py-2 text-xs"
              style={{ color: "#888888", borderBottom: "1px solid #2a2a2a" }}
            >
              <div>Fund Name</div>
              <div>Fund %</div>
              <div>Commission</div>
              <div>Status</div>
            </div>
            {fundBreakdown.map((f, i) => (
              <div
                key={f.key}
                data-ocid={`commission.fund.item.${i + 1}`}
                className="grid grid-cols-4 px-4 py-3 items-center"
                style={{ borderBottom: "1px solid #2a2a2a" }}
              >
                <div className="text-white text-sm">{f.label}</div>
                <div className="text-sm font-bold" style={{ color: "#f5c842" }}>
                  {f.rate}%
                </div>
                <div className="text-white text-sm font-semibold">
                  ₹{f.earned.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: f.active ? "#10b981" : "#52525b" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: f.active ? "#10b981" : "#71717a" }}
                  >
                    {f.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commission History */}
      {activeTab === "history" && (
        <div>
          {historyEntries.length === 0 ? (
            <div
              data-ocid="commission.empty_state"
              className="text-center py-16 rounded-2xl"
              style={{ background: "#111111", border: "1px solid #333333" }}
            >
              <div className="text-4xl mb-3">📊</div>
              <p className="text-sm" style={{ color: "#888888" }}>
                No commission history yet.
              </p>
              <p className="text-xs mt-1" style={{ color: "#666666" }}>
                Activate a fund to start earning commissions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyEntries.map((entry, i) =>
                entry.isGrouped ? (
                  <div
                    key={`grouped-${entry.fund}`}
                    data-ocid={`commission.history.item.${i + 1}`}
                    className="rounded-xl p-4"
                    style={{
                      background: "#111111",
                      border: "1px solid #3a1a1a",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-white font-bold text-sm">
                          {entry.label}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#666" }}
                        >
                          {entry.firstDate} → {entry.lastDate}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#666" }}
                        >
                          {entry.count} transaction{entry.count > 1 ? "s" : ""}{" "}
                          combined
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-xl font-extrabold"
                          style={{ color: "#f5c842" }}
                        >
                          ₹{entry.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={entry.id}
                    data-ocid={`commission.history.item.${i + 1}`}
                    className="rounded-xl p-4"
                    style={{
                      background: "#111111",
                      border: "1px solid #333333",
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-white text-sm font-medium">
                            {FUND_LABELS[entry.fund] || entry.fund}
                          </div>
                          <div
                            className="text-xs mt-0.5"
                            style={{ color: "#888888" }}
                          >
                            Tx: ₹{entry.txAmount?.toLocaleString() || "-"}
                          </div>
                          <div className="text-xs" style={{ color: "#888888" }}>
                            {entry.date}
                          </div>
                        </div>
                        <div
                          className="text-lg font-bold"
                          style={{ color: "#f5c842" }}
                        >
                          ₹{entry.amount.toLocaleString()}
                        </div>
                      </div>
                      {bankDetails && (
                        <div
                          className="mt-2 rounded-lg p-2 text-xs space-y-0.5"
                          style={{
                            background: "#1a1a1a",
                            border: "1px solid #333",
                          }}
                        >
                          <div className="flex gap-2">
                            <span style={{ color: "#888" }}>Bank:</span>
                            <span className="text-white">
                              {bankDetails.bankName}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span style={{ color: "#888" }}>Holder:</span>
                            <span className="text-white">
                              {bankDetails.accountHolder}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span style={{ color: "#888" }}>A/C No:</span>
                            <span className="text-white">
                              {bankDetails.accountNumber}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span style={{ color: "#888" }}>IFSC:</span>
                            <span className="text-white">
                              {bankDetails.ifscCode}
                            </span>
                          </div>
                          {(bankDetails.mobile || bankDetails.mobileNumber) && (
                            <div className="flex gap-2">
                              <span style={{ color: "#888" }}>Mobile:</span>
                              <span className="text-white">
                                {bankDetails.mobile || bankDetails.mobileNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
