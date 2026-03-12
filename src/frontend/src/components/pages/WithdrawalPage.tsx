import { useEffect, useState } from "react";
import type { AuthUser } from "../../App";
import PageHeader from "../ui/PageHeader";

interface Withdrawal {
  id: string;
  method: "upi" | "bank" | "usdt";
  transferMode?: string;
  amount: number;
  status: "pending" | "approved";
  createdAt: string;
  approvedAt?: string;
  utrNumber: string;
  reference: string;
  details: Record<string, string>;
}

function genRef(): string {
  return `REF${Math.floor(Math.random() * 1e10).toString()}`;
}
function genUTR(): string {
  return `UTR${Math.floor(Math.random() * 1e12)
    .toString()
    .padStart(12, "0")}`;
}

export default function WithdrawalPage({ user }: { user: AuthUser }) {
  const [tab, setTab] = useState<"upi" | "bank" | "usdt">("upi");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [transferMode, setTransferMode] = useState("IMPS");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [message, setMessage] = useState("");
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() =>
    JSON.parse(localStorage.getItem(`kuber_withdrawals_${user.email}`) || "[]"),
  );

  const pending = withdrawals.filter((w) => w.status === "pending");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const updated = withdrawals.map((w) => {
        if (
          w.status === "pending" &&
          now - new Date(w.createdAt).getTime() >= 10 * 60 * 1000
        ) {
          return {
            ...w,
            status: "approved" as const,
            approvedAt: new Date().toISOString(),
          };
        }
        return w;
      });
      if (JSON.stringify(updated) !== JSON.stringify(withdrawals)) {
        setWithdrawals(updated);
        localStorage.setItem(
          `kuber_withdrawals_${user.email}`,
          JSON.stringify(updated),
        );
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [withdrawals, user.email]);

  const commBalance = Number.parseInt(
    localStorage.getItem(`kuber_commission_${user.email}`) || "0",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number.parseInt(amount);
    if (Number.isNaN(amt) || amt <= 0) {
      setMessage("Invalid amount");
      return;
    }
    if (amt > commBalance) {
      setMessage("Insufficient commission balance");
      return;
    }

    const details: Record<string, string> = {};
    if (tab === "upi") details.upiId = upiId;
    if (tab === "bank") {
      details.accountNumber = accountNumber;
      details.ifsc = ifsc;
      details.transferMode = transferMode;
    }
    if (tab === "usdt") details.walletAddress = walletAddress;

    const w: Withdrawal = {
      id: Date.now().toString(),
      method: tab,
      transferMode: tab === "bank" ? transferMode : undefined,
      amount: amt,
      status: "pending",
      createdAt: new Date().toISOString(),
      utrNumber: genUTR(),
      reference: genRef(),
      details,
    };

    const updated = [w, ...withdrawals];
    setWithdrawals(updated);
    localStorage.setItem(
      `kuber_withdrawals_${user.email}`,
      JSON.stringify(updated),
    );
    localStorage.setItem(
      `kuber_commission_${user.email}`,
      String(commBalance - amt),
    );
    setMessage(
      `Withdrawal of ₹${amt.toLocaleString()} submitted. Auto-approved in 10 minutes.`,
    );
    setAmount("");
  };

  const inp =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-sm";

  const bankLimits: Record<string, string> = {
    IMPS: "Up to ₹2,00,000",
    NEFT: "No limit",
    RTGS: "Minimum ₹2,00,000",
  };

  return (
    <div>
      <PageHeader
        title="Withdrawal"
        subtitle={`Available Balance: ₹${commBalance.toLocaleString()}`}
      />

      {pending.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-900 rounded-xl p-4 mb-6">
          <div className="text-amber-400 text-sm font-semibold mb-2">
            ⏳ Pending Withdrawals
          </div>
          {pending.map((w) => (
            <div key={w.id} className="text-zinc-400 text-xs">
              ₹{w.amount.toLocaleString()} via {w.method.toUpperCase()} -
              Pending (auto-approves in 10 min)
            </div>
          ))}
        </div>
      )}

      <div className="flex bg-zinc-800 rounded-lg p-1 mb-6 w-fit">
        {(["upi", "bank", "usdt"] as const).map((t) => (
          <button
            type="button"
            key={t}
            data-ocid={`withdrawal.${t}.tab`}
            onClick={() => setTab(t)}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
              tab === t
                ? "bg-amber-500 text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {t === "upi" ? "UPI" : t === "bank" ? "Bank Transfer" : "USDT"}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 max-w-lg"
      >
        {tab === "upi" && (
          <div>
            <label
              htmlFor="wd-upi"
              className="text-xs text-zinc-400 uppercase tracking-wider block mb-1"
            >
              UPI ID
            </label>
            <input
              id="wd-upi"
              data-ocid="withdrawal.upi.input"
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              required
              placeholder="yourname@bank"
              className={inp}
            />
          </div>
        )}
        {tab === "bank" && (
          <>
            <div>
              <label
                htmlFor="wd-mode"
                className="text-xs text-zinc-400 uppercase tracking-wider block mb-1"
              >
                Transfer Mode
              </label>
              <select
                id="wd-mode"
                data-ocid="withdrawal.transfer_mode.select"
                value={transferMode}
                onChange={(e) => setTransferMode(e.target.value)}
                className={inp}
              >
                {["IMPS", "NEFT", "RTGS"].map((m) => (
                  <option key={m} value={m}>
                    {m} - {bankLimits[m]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="wd-acc"
                className="text-xs text-zinc-400 uppercase tracking-wider block mb-1"
              >
                Account Number
              </label>
              <input
                id="wd-acc"
                data-ocid="withdrawal.account_number.input"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
                placeholder="Account Number"
                className={inp}
              />
            </div>
            <div>
              <label
                htmlFor="wd-ifsc"
                className="text-xs text-zinc-400 uppercase tracking-wider block mb-1"
              >
                IFSC Code
              </label>
              <input
                id="wd-ifsc"
                data-ocid="withdrawal.ifsc.input"
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                required
                placeholder="IFSC Code"
                className={inp}
              />
            </div>
          </>
        )}
        {tab === "usdt" && (
          <div>
            <label
              htmlFor="wd-usdt"
              className="text-xs text-zinc-400 uppercase tracking-wider block mb-1"
            >
              USDT Wallet Address
            </label>
            <input
              id="wd-usdt"
              data-ocid="withdrawal.usdt.input"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              required
              placeholder="USDT wallet address"
              className={inp}
            />
          </div>
        )}
        <div>
          <label
            htmlFor="wd-amount"
            className="text-xs text-zinc-400 uppercase tracking-wider block mb-1"
          >
            Amount (₹)
          </label>
          <input
            id="wd-amount"
            data-ocid="withdrawal.amount.input"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="Enter amount"
            min="1"
            className={inp}
          />
        </div>
        {message && (
          <div
            data-ocid="withdrawal.success_state"
            className="text-sm text-green-400 bg-green-950/30 border border-green-900 rounded-lg px-3 py-2"
          >
            {message}
          </div>
        )}
        <button
          type="submit"
          data-ocid="withdrawal.submit.button"
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg text-sm"
        >
          Submit Withdrawal Request
        </button>
      </form>
    </div>
  );
}
