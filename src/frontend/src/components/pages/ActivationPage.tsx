import { useEffect, useState } from "react";
import type { AuthUser, Page } from "../../App";
import { createActorWithConfig } from "../../config";
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
  setCurrentPage,
}: {
  user: AuthUser;
  onActivated: () => void;
  setCurrentPage?: (p: Page) => void;
}) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [loading, setLoading] = useState(false);
  const [activatedFunds, setActivatedFunds] = useState<string[]>(() => {
    // Load from localStorage as initial state while backend loads
    return JSON.parse(
      localStorage.getItem(`kuber_activated_${user.email}`) || "[]",
    );
  });

  // Sync activated funds from backend on mount
  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const actor = await createActorWithConfig();
        const funds = await actor.getSimpleActivatedFunds(user.email);
        if (funds.length > 0) {
          setActivatedFunds(funds);
          // Keep localStorage in sync
          localStorage.setItem(
            `kuber_activated_${user.email}`,
            JSON.stringify(funds),
          );
        }
      } catch (err) {
        console.error("Failed to fetch activated funds:", err);
      }
    };
    fetchFunds();
  }, [user.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const actor = await createActorWithConfig();
      const result = await actor.simpleUseCode(user.email, code.trim());

      if (result === "used") {
        setMessage("This activation code has already been used.");
        setMessageType("error");
      } else if (result === "invalid") {
        setMessage("Invalid activation code. Please check and try again.");
        setMessageType("error");
      } else if (result === "user_not_found") {
        setMessage("Account not found. Please re-login and try again.");
        setMessageType("error");
      } else if (result.startsWith("ok:")) {
        const fundType = result.replace("ok:", "");
        const newFunds =
          fundType === "all"
            ? ["gaming", "stock", "mix", "political"]
            : [...new Set([...activatedFunds, fundType])];

        setActivatedFunds(newFunds);
        localStorage.setItem(
          `kuber_activated_${user.email}`,
          JSON.stringify(newFunds),
        );

        setMessage(
          `Successfully activated ${
            fundType === "all" ? "ALL funds" : FUND_LABELS[fundType] || fundType
          }!`,
        );
        setMessageType("success");
        setCode("");
        setTimeout(() => onActivated(), 1500);
      } else {
        setMessage("An error occurred. Please try again.");
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
      setMessageType("error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Activation Panel"
        subtitle="Enter your activation code to unlock fund options"
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      <div className="max-w-md">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-6 mb-6"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <label
            htmlFor="activation-code"
            className="text-xs uppercase tracking-wider block mb-2"
            style={{ color: "#9ca3af" }}
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
            className="w-full rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono text-sm mb-4"
            style={{ background: "#0a0a0a", border: "1px solid #333333" }}
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

        <h3 className="font-semibold mb-3" style={{ color: "#9ca3af" }}>
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
                className="flex items-center justify-between p-4 rounded-xl"
                style={{
                  background: isActive ? "rgba(16,185,129,0.08)" : "#111111",
                  border: isActive
                    ? "1px solid rgba(16,185,129,0.4)"
                    : "1px solid #333333",
                }}
              >
                <div className="text-sm text-white">{FUND_LABELS[fund]}</div>
                <div
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isActive ? "text-green-400 bg-green-950/50" : "bg-zinc-800"
                  }`}
                  style={isActive ? {} : { color: "#888888" }}
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
