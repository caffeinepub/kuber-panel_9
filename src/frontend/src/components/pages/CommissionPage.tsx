import { useEffect, useState } from "react";
import type { AuthUser, Page } from "../../App";
import { FUND_LABELS, FUND_TYPES } from "../../App";
import PageHeader from "../ui/PageHeader";

interface Props {
  user: AuthUser;
  setCurrentPage: (p: Page) => void;
}

const FUND_RATES: Record<string, number> = {
  gaming: 15,
  stock: 30,
  mix: 25,
  political: 30,
};

interface CommCycle {
  id: string;
  fundTypes: string[];
  sessionStart: string;
  sessionEnd: string;
  sessionEndTimestamp?: number;
  totalCommission: number;
  bank: {
    bankName?: string;
    accountHolder?: string;
    accountNumber?: string;
    ifscCode?: string;
    mobile?: string;
    mobileNumber?: string;
    upiId?: string;
  } | null;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default function CommissionPage({ user, setCurrentPage }: Props) {
  const [activeTab, setActiveTab] = useState<"breakdown" | "history">(
    "breakdown",
  );
  const [tick, setTick] = useState(0);

  // Refresh every 2 seconds to show live commission updates
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  // Suppress unused tick warning
  void tick;

  const balance = Number.parseFloat(
    localStorage.getItem(`kuber_commission_${user.email}`) || "0",
  );

  // Filter to 30-day retention
  const allCycles: CommCycle[] = JSON.parse(
    localStorage.getItem(`kuber_comm_cycles_${user.email}`) || "[]",
  );
  const now = Date.now();
  const cycles = allCycles.filter((c) => {
    if (c.sessionEndTimestamp) {
      return now - c.sessionEndTimestamp < THIRTY_DAYS_MS;
    }
    // Fallback: try parsing sessionEnd date string
    const ts = new Date(c.sessionEnd).getTime();
    return Number.isNaN(ts) ? true : now - ts < THIRTY_DAYS_MS;
  });

  const activatedFunds: string[] = JSON.parse(
    localStorage.getItem(`kuber_activated_${user.email}`) || "[]",
  );
  const allFundsActive = activatedFunds.includes("all") || user.isAdmin;

  // Current session per-fund commission (live while fund is ON)
  const sessionComm: Record<string, number> = JSON.parse(
    localStorage.getItem(`kuber_session_comm_${user.email}`) || "{}",
  );

  const fundBreakdown = FUND_TYPES.map((key) => {
    const isActivated = allFundsActive || activatedFunds.includes(key);
    const toggleOn =
      localStorage.getItem(`kuber_fund_toggle_${user.email}_${key}`) === "true";
    const currentSessionComm = sessionComm[key] || 0;
    return {
      key,
      label: FUND_LABELS[key],
      rate: FUND_RATES[key],
      currentComm: currentSessionComm,
      active: isActivated && toggleOn,
    };
  });

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
        <div className="text-sm mb-1" style={{ color: "#9ca3af" }}>
          Total Commission Earned
        </div>
        <div className="text-4xl font-extrabold" style={{ color: "#f5c842" }}>
          ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
            color: activeTab === "breakdown" ? "#000" : "#9ca3af",
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
            color: activeTab === "history" ? "#000" : "#9ca3af",
          }}
        >
          Commission History
        </button>
      </div>

      {/* Fund Breakdown — card layout, one card per fund */}
      {activeTab === "breakdown" && (
        <div className="space-y-3">
          {fundBreakdown.map((f, i) => (
            <div
              key={f.key}
              data-ocid={`commission.fund.item.${i + 1}`}
              className="rounded-2xl p-4"
              style={{
                background: "#111111",
                border: `1px solid ${f.active ? "#d4a01760" : "#333333"}`,
              }}
            >
              {/* Fund Name row */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className="text-base font-bold"
                  style={{ color: "#ffffff" }}
                >
                  {f.label}
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: f.active ? "#10b981" : "#52525b" }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: f.active ? "#10b981" : "#71717a" }}
                  >
                    {f.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Rate and Commission row */}
              <div className="flex items-center gap-4">
                <div
                  className="rounded-lg px-3 py-2 flex-1 text-center"
                  style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                >
                  <div className="text-xs mb-0.5" style={{ color: "#888" }}>
                    Fund Rate
                  </div>
                  <div
                    className="text-lg font-extrabold"
                    style={{ color: "#f5c842" }}
                  >
                    {f.rate}%
                  </div>
                </div>
                <div
                  className="rounded-lg px-3 py-2 flex-1 text-center"
                  style={{
                    background: f.active ? "rgba(16,185,129,0.08)" : "#1a1a1a",
                    border: `1px solid ${f.active ? "#10b98130" : "#2a2a2a"}`,
                  }}
                >
                  <div className="text-xs mb-0.5" style={{ color: "#888" }}>
                    Session Commission
                  </div>
                  <div
                    className="text-lg font-extrabold"
                    style={{ color: f.active ? "#10b981" : "#555" }}
                  >
                    ₹{f.currentComm.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Commission History — ONE entry per ON/OFF cycle, 30-day retention */}
      {activeTab === "history" && (
        <div>
          {cycles.length === 0 ? (
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
                Activate a fund, let it run, then turn it OFF to create an
                entry.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cycles.map((cycle, i) => (
                <div
                  key={cycle.id}
                  data-ocid={`commission.history.item.${i + 1}`}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "#111111",
                    border: "1px solid #d4a01740",
                  }}
                >
                  {/* Cycle Header */}
                  <div
                    className="px-5 py-4"
                    style={{
                      background: "linear-gradient(135deg, #1a1500, #2a2000)",
                      borderBottom: "1px solid #3d2f00",
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-xs font-bold uppercase tracking-wider mb-1"
                          style={{ color: "#d4a017" }}
                        >
                          Commission Entry #{cycles.length - i}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {(cycle.fundTypes || []).map((ft) => (
                            <span
                              key={ft}
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{
                                background: "rgba(212,160,23,0.15)",
                                border: "1px solid #d4a017",
                                color: "#f5c842",
                              }}
                            >
                              {FUND_LABELS[ft] || ft}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs" style={{ color: "#888" }}>
                          <span style={{ color: "#555" }}>Start: </span>
                          {cycle.sessionStart}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#888" }}
                        >
                          <span style={{ color: "#555" }}>End: </span>
                          {cycle.sessionEnd}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div
                          className="text-2xl font-extrabold"
                          style={{ color: "#f5c842" }}
                        >
                          ₹{cycle.totalCommission.toLocaleString("en-IN")}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#10b981" }}
                        >
                          Total Commission
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  {cycle.bank && (
                    <div className="px-5 py-4">
                      <div
                        className="text-xs font-bold uppercase tracking-wider mb-3"
                        style={{ color: "#d4a017" }}
                      >
                        Bank Account Details
                      </div>
                      <div className="space-y-2">
                        {(
                          [
                            ["Bank Name", cycle.bank.bankName],
                            ["Account Holder", cycle.bank.accountHolder],
                            ["Account Number", cycle.bank.accountNumber],
                            ["IFSC Code", cycle.bank.ifscCode],
                            [
                              "Mobile",
                              cycle.bank.mobile || cycle.bank.mobileNumber,
                            ],
                            ...(cycle.bank.upiId
                              ? [["UPI ID", cycle.bank.upiId]]
                              : []),
                          ] as [string, string | undefined][]
                        )
                          .filter(([, v]) => v)
                          .map(([label, value]) => (
                            <div
                              key={label}
                              className="flex items-start justify-between py-1.5"
                              style={{ borderBottom: "1px solid #1a1a1a" }}
                            >
                              <span
                                className="text-xs flex-shrink-0 mr-4"
                                style={{ color: "#555555", minWidth: 110 }}
                              >
                                {label}
                              </span>
                              <span
                                className="text-xs font-semibold text-right break-all"
                                style={{ color: "#e5e5e5" }}
                              >
                                {value}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
