import { useCallback, useEffect, useState } from "react";
import type { Page } from "../../../App";
import { createActorWithConfig } from "../../../config";
import PageHeader from "../../ui/PageHeader";

const ADMIN_PASS_HASH = btoa("Admin@123"); // "QWRtaW5AMTIz"

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
  // Deactivated list stored in localStorage for admin override
  const [deactivated, setDeactivated] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("kuber_deactivated_users") || "[]"),
  );

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const actor = await createActorWithConfig();
      const result = await actor.adminGetAllSimpleUsers(ADMIN_PASS_HASH);
      // Sort newest first
      const sorted = [...result].sort((a, b) =>
        Number(b.registeredAt - a.registeredAt),
      );
      setUsers(sorted);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Failed to load users from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const isActive = (email: string) => !deactivated.includes(email);

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

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle={loading ? "Loading..." : `Total users: ${users.length}`}
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      <div
        className="flex rounded-lg p-1 mb-6 w-fit"
        style={{ background: "#111111", border: "1px solid #333333" }}
      >
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            type="button"
            key={f}
            data-ocid={`users.${f}.tab`}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
              filter === f ? "bg-amber-500 text-black" : "hover:text-white"
            }`}
            style={filter !== f ? { color: "#9ca3af" } : {}}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <button
        type="button"
        data-ocid="users.refresh.button"
        onClick={loadUsers}
        className="mb-4 text-xs px-4 py-2 rounded-lg text-amber-400 border border-amber-800 hover:bg-amber-950/30"
        style={{ background: "rgba(251,191,36,0.06)" }}
      >
        Refresh List
      </button>

      {error && (
        <div
          data-ocid="users.error_state"
          className="text-red-400 text-sm mb-4 px-3 py-2 rounded-lg bg-red-950/20 border border-red-900"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          data-ocid="users.loading_state"
          className="text-center py-12"
          style={{ color: "#888888" }}
        >
          <p>Loading users...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="users.empty_state"
          className="text-center py-12"
          style={{ color: "#888888" }}
        >
          <p>No users found.</p>
          <p className="text-xs mt-2" style={{ color: "#555" }}>
            New registrations appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
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
                className="rounded-xl p-4"
                style={{ background: "#111111", border: "1px solid #333333" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <div
                      className="text-white font-medium text-sm truncate"
                      style={{ maxWidth: "200px" }}
                    >
                      {u.email}
                    </div>
                    {registeredDate && (
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "#888888" }}
                      >
                        Registered: {registeredDate}
                      </div>
                    )}
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {u.activatedFunds.length === 0 ? (
                        <span className="text-xs" style={{ color: "#666666" }}>
                          No funds activated
                        </span>
                      ) : (
                        u.activatedFunds.map((f) => (
                          <span
                            key={f}
                            className="text-xs bg-amber-950/30 text-amber-400 border border-amber-900 px-2 py-0.5 rounded-full"
                          >
                            {FUND_LABELS[f] || f}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        active
                          ? "text-green-400 bg-green-950/30 border-green-800"
                          : "text-red-400 bg-red-950/30 border-red-800"
                      }`}
                    >
                      {active ? "Active" : "Inactive"}
                    </span>
                    <button
                      type="button"
                      data-ocid={`users.toggle.${i + 1}`}
                      onClick={() => toggleActive(u.email)}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{
                        background: "#111111",
                        border: "1px solid #333333",
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
  );
}
