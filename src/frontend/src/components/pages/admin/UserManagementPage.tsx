import { useCallback, useEffect, useRef, useState } from "react";
import type { Page } from "../../../App";
import { createActorWithConfig } from "../../../config";
import PageHeader from "../../ui/PageHeader";

const ADMIN_PASS_HASH = btoa("Admin@123");

const FUND_LABELS: Record<string, string> = {
  gaming: "Gaming Fund",
  stock: "Stock Fund",
  mix: "Mix Fund",
  political: "Political Fund",
};

interface SimpleUser {
  email: string;
  passwordHash: string;
  activatedFunds: string[];
  registeredAt: bigint;
}

export default function UserManagementPage({
  setCurrentPage,
}: {
  setCurrentPage?: (p: Page) => void;
}) {
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [deactivated, setDeactivated] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("kuber_deactivated_users") || "[]"),
  );
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadUsers = useCallback(async (attempt = 0) => {
    setLoading(true);
    setError("");
    setRetryCount(attempt);
    try {
      const actor = await createActorWithConfig();
      const result = await actor.adminGetAllSimpleUsers(ADMIN_PASS_HASH);
      const sorted = [...result].sort((a, b) =>
        Number(b.registeredAt - a.registeredAt),
      );
      setUsers(sorted);
      setError("");
    } catch (err) {
      console.error(`Load attempt ${attempt + 1} failed:`, err);
      if (attempt < 3) {
        // Auto-retry up to 3 times with 2s delay
        setTimeout(() => loadUsers(attempt + 1), 2000);
      } else {
        setError("Server se users load nahi ho paye. Refresh karein.");
        setLoading(false);
      }
      return;
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers(0);
    // Auto-refresh every 30s for new registrations
    refreshTimerRef.current = setInterval(() => loadUsers(0), 30_000);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [loadUsers]);

  const isActive = (email: string) => !deactivated.includes(email);

  const activeCount = users.filter((u) => isActive(u.email)).length;
  const inactiveCount = users.filter((u) => !isActive(u.email)).length;

  const filtered = users.filter((u) => {
    if (filter === "active") return isActive(u.email);
    if (filter === "inactive") return !isActive(u.email);
    return true;
  });

  const toggleActive = (email: string) => {
    const updated = deactivated.includes(email)
      ? deactivated.filter((e) => e !== email)
      : [...deactivated, email];
    setDeactivated(updated);
    localStorage.setItem("kuber_deactivated_users", JSON.stringify(updated));
  };

  const tabLabels = {
    all: `All (${users.length})`,
    active: `Active (${activeCount})`,
    inactive: `Inactive (${inactiveCount})`,
  };

  return (
    <div style={{ background: "#000", minHeight: "100%" }}>
      <PageHeader
        title="User Management"
        subtitle={
          loading
            ? retryCount > 0
              ? `Retrying... (${retryCount}/3)`
              : "Loading..."
            : `Total: ${users.length} users`
        }
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      {/* Filter tabs */}
      <div
        className="flex rounded-lg p-1 mb-4 w-fit"
        style={{ background: "#111", border: "1px solid #2a2a2a" }}
      >
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            type="button"
            key={f}
            data-ocid={`users.${f}.tab`}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              filter === f
                ? "bg-amber-500 text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {tabLabels[f]}
          </button>
        ))}
      </div>

      <button
        type="button"
        data-ocid="users.refresh.button"
        onClick={() => loadUsers(0)}
        className="mb-4 text-xs px-4 py-2 rounded-lg text-amber-400"
        style={{ background: "#111", border: "1px solid #2a2a2a" }}
      >
        ↻ Refresh List
      </button>

      {error && (
        <div
          data-ocid="users.error_state"
          className="text-red-400 text-sm mb-4 px-3 py-2 rounded-lg"
          style={{ background: "#1a0000", border: "1px solid #4a0000" }}
        >
          {error}
        </div>
      )}

      {/* Scrollable box container */}
      <div
        style={{
          background: "#0a0a0a",
          border: "1px solid #222",
          borderRadius: 14,
          maxHeight: "60vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {loading ? (
          <div
            data-ocid="users.loading_state"
            className="text-center py-12"
            style={{ color: "#666" }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                border: "3px solid #333",
                borderTop: "3px solid #d4a017",
                borderRadius: "50%",
                margin: "0 auto 12px",
                animation: "spin 1s linear infinite",
              }}
            />
            <style>
              {"@keyframes spin { to { transform: rotate(360deg); } }"}
            </style>
            <p style={{ fontSize: 13 }}>
              {retryCount > 0 ? `Retry ${retryCount}/3...` : "Loading users..."}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="users.empty_state"
            className="text-center py-12"
            style={{ color: "#555" }}
          >
            <p>No users found.</p>
            <p className="text-xs mt-2" style={{ color: "#444" }}>
              New registrations appear here instantly.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#1a1a1a" }}>
            {filtered.map((u, i) => {
              const active = isActive(u.email);
              const registeredDate = u.registeredAt
                ? new Date(
                    Number(u.registeredAt / BigInt(1_000_000)),
                  ).toLocaleString("en-IN")
                : "";
              return (
                <div
                  key={u.email}
                  data-ocid={`users.item.${i + 1}`}
                  className="p-3"
                  style={{ borderBottom: "1px solid #1a1a1a" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Left: user info */}
                    <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                      <div
                        className="text-white text-sm font-medium"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {u.email}
                      </div>
                      {registeredDate && (
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#666" }}
                        >
                          {registeredDate}
                        </div>
                      )}
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {u.activatedFunds.length === 0 ? (
                          <span className="text-xs" style={{ color: "#555" }}>
                            No funds
                          </span>
                        ) : (
                          u.activatedFunds.map((f) => (
                            <span
                              key={f}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                background: "#1a1000",
                                color: "#f5c842",
                                border: "1px solid #3a2a00",
                              }}
                            >
                              {FUND_LABELS[f] || f}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Right: status + action */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: active ? "#001a00" : "#1a0000",
                          color: active ? "#4ade80" : "#f87171",
                          border: `1px solid ${active ? "#14532d" : "#7f1d1d"}`,
                        }}
                      >
                        {active ? "Active" : "Inactive"}
                      </span>
                      <button
                        type="button"
                        data-ocid={`users.toggle.${i + 1}`}
                        onClick={() => toggleActive(u.email)}
                        className="text-xs px-3 py-1 rounded-lg"
                        style={{
                          background: "#111",
                          border: "1px solid #2a2a2a",
                          color: "#f5c842",
                        }}
                      >
                        {active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
