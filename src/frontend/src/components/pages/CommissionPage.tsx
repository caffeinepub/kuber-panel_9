import { Download } from "lucide-react";
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

  return (
    <div>
      <PageHeader
        title="My Commission"
        subtitle="Real-time commission earnings"
        onBack={() => setCurrentPage("dashboard")}
      />

      {/* Withdraw Button */}
      <button
        type="button"
        data-ocid="commission.withdraw.button"
        onClick={() => setCurrentPage("withdrawal")}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-black text-sm mb-5"
        style={{ background: "linear-gradient(135deg, #d4a017, #f5c842)" }}
      >
        <Download size={16} />
        Withdraw
      </button>

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
              ? "Commission available for withdrawal"
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
            background: "transparent",
            color: activeTab === "history" ? "#f5c842" : "#8899c0",
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
              style={{
                color: "#5a7ab0",
                borderBottom: "1px solid #2a2a2a",
              }}
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
                    style={{
                      background: f.active ? "#10b981" : "#52525b",
                    }}
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
          {history.length === 0 ? (
            <div
              data-ocid="commission.empty_state"
              className="text-center py-16 rounded-2xl"
              style={{ background: "#111111", border: "1px solid #333333" }}
            >
              <div className="text-4xl mb-3">📊</div>
              <p className="text-sm" style={{ color: "#5a7ab0" }}>
                No commission history yet.
              </p>
              <p className="text-xs mt-1" style={{ color: "#3a5070" }}>
                Activate a fund to start earning commissions.
              </p>
            </div>
          ) : (
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
                  Commission History
                </h3>
              </div>
              <div style={{ background: "#111111" }}>
                <div
                  className="grid grid-cols-4 px-4 py-2 text-xs"
                  style={{
                    color: "#5a7ab0",
                    borderBottom: "1px solid #2a2a2a",
                  }}
                >
                  <div>Fund</div>
                  <div>Commission</div>
                  <div>Tx Amount</div>
                  <div>Date</div>
                </div>
                {history.map((h, i) => (
                  <div
                    key={h.id}
                    data-ocid={`commission.history.item.${i + 1}`}
                    className="grid grid-cols-4 px-4 py-3 items-center text-sm"
                    style={{ borderBottom: "1px solid #2a2a2a" }}
                  >
                    <div className="text-white">
                      {FUND_LABELS[h.fund] || h.fund}
                    </div>
                    <div className="font-bold" style={{ color: "#f5c842" }}>
                      ₹{h.amount.toLocaleString()}
                    </div>
                    <div style={{ color: "#8899c0" }}>
                      ₹{h.txAmount?.toLocaleString() || "-"}
                    </div>
                    <div className="text-xs" style={{ color: "#5a7ab0" }}>
                      {h.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
