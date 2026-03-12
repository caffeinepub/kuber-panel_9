import { useState } from "react";
import type { AuthUser } from "../../App";
import PageHeader from "../ui/PageHeader";

const FUND_TYPES = ["gaming", "stock", "mix", "political"] as const;
const FUND_LABELS: Record<string, string> = {
  gaming: "Gaming Fund",
  stock: "Stock Fund",
  mix: "Mix Fund",
  political: "Political Fund",
};

export default function ActivationPage({
  user,
  onActivated,
}: { user: AuthUser; onActivated: () => void }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [loading, setLoading] = useState(false);

  const activatedFunds: string[] = JSON.parse(
    localStorage.getItem(`kuber_activated_${user.email}`) || "[]",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const adminCodes: {
      code: string;
      fundType: string;
      isUsed: boolean;
      usedBy?: string;
    }[] = JSON.parse(localStorage.getItem("kuber_activation_codes") || "[]");

    const found = adminCodes.find((c) => c.code === code.trim() && !c.isUsed);

    setTimeout(() => {
      if (!found) {
        setMessage("Invalid or already used activation code.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const updated = adminCodes.map((c) =>
        c.code === code.trim() ? { ...c, isUsed: true, usedBy: user.email } : c,
      );
      localStorage.setItem("kuber_activation_codes", JSON.stringify(updated));

      const current: string[] = JSON.parse(
        localStorage.getItem(`kuber_activated_${user.email}`) || "[]",
      );
      const newFunds: string[] =
        found.fundType === "all"
          ? [...new Set([...current, ...FUND_TYPES])]
          : [...new Set([...current, found.fundType])];

      localStorage.setItem(
        `kuber_activated_${user.email}`,
        JSON.stringify(newFunds),
      );

      setMessage(
        `Successfully activated ${found.fundType === "all" ? "ALL funds" : FUND_LABELS[found.fundType] || found.fundType}!`,
      );
      setMessageType("success");
      setCode("");
      setLoading(false);

      setTimeout(() => onActivated(), 1500);
    }, 800);
  };

  return (
    <div>
      <PageHeader
        title="Activation Panel"
        subtitle="Enter your activation code to unlock fund options"
      />

      <div className="max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6"
        >
          <label
            htmlFor="activation-code"
            className="text-xs text-zinc-400 uppercase tracking-wider block mb-2"
          >
            Activation Code
          </label>
          <input
            id="activation-code"
            data-ocid="activation.code.input"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="Enter your activation code"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono text-sm mb-4"
          />
          {message && (
            <div
              data-ocid={
                messageType === "success"
                  ? "activation.success_state"
                  : "activation.error_state"
              }
              className={`text-sm mb-4 px-3 py-2 rounded-lg ${
                messageType === "success"
                  ? "text-green-400 bg-green-950/30 border border-green-800"
                  : "text-red-400 bg-red-950/30 border border-red-800"
              }`}
            >
              {message}
            </div>
          )}
          <button
            type="submit"
            data-ocid="activation.submit.button"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 text-black font-bold py-3 rounded-lg text-sm"
          >
            {loading ? "Verifying..." : "Activate"}
          </button>
        </form>

        <h3 className="text-zinc-300 font-semibold mb-3">
          Fund Options Status
        </h3>
        <div className="space-y-3">
          {FUND_TYPES.map((fund) => {
            const isActive =
              activatedFunds.includes(fund) || activatedFunds.includes("all");
            return (
              <div
                key={fund}
                data-ocid={`activation.fund_${fund}.panel`}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  isActive
                    ? "bg-green-950/20 border-green-800"
                    : "bg-zinc-900 border-zinc-800"
                }`}
              >
                <div className="text-sm text-white">{FUND_LABELS[fund]}</div>
                <div
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isActive
                      ? "text-green-400 bg-green-950/50"
                      : "text-zinc-500 bg-zinc-800"
                  }`}
                >
                  {isActive ? "🔓 Activated" : "🔒 Locked"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
