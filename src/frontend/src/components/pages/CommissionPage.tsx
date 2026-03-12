import type { AuthUser } from "../../App";
import PageHeader from "../ui/PageHeader";

interface CommHistory {
  id: string;
  fund: string;
  amount: number;
  date: string;
  txAmount: number;
}

export default function CommissionPage({ user }: { user: AuthUser }) {
  const balance = user.isAdmin
    ? Number.parseInt(
        localStorage.getItem(`kuber_commission_${user.email}`) || "0",
      )
    : 0;

  const history: CommHistory[] = user.isAdmin
    ? JSON.parse(
        localStorage.getItem(`kuber_comm_history_${user.email}`) || "[]",
      )
    : [];

  return (
    <div>
      <PageHeader
        title="My Commission"
        subtitle="Your earned commission balance"
      />

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="text-zinc-400 text-sm mb-1">
          Total Commission Balance
        </div>
        <div className="text-4xl font-bold text-amber-400">
          ₹{balance.toLocaleString()}
        </div>
      </div>

      <h3 className="text-zinc-300 font-semibold mb-3">
        Commission History (30 Days)
      </h3>

      {history.length === 0 ? (
        <div
          data-ocid="commission.empty_state"
          className="text-center text-zinc-600 py-12"
        >
          <p>No commission history yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.slice(0, 30).map((h, i) => (
            <div
              key={h.id}
              data-ocid={`commission.item.${i + 1}`}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="text-white text-sm font-medium">
                  {h.fund.toUpperCase()} Fund
                </div>
                <div className="text-zinc-500 text-xs">{h.date}</div>
                <div className="text-zinc-400 text-xs">
                  Transaction: ₹{h.txAmount.toLocaleString()}
                </div>
              </div>
              <div className="text-green-400 font-bold">
                +₹{h.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
