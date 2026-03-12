import { useState } from "react";
import type { Page } from "../../../App";
import PageHeader from "../../ui/PageHeader";

interface User {
  email: string;
  passwordHash: string;
  registeredAt?: string;
}

export default function UserManagementPage({
  setCurrentPage,
}: {
  setCurrentPage?: (p: Page) => void;
}) {
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [_refresh, setRefresh] = useState(0);

  const users: User[] = JSON.parse(localStorage.getItem("kuber_users") || "[]");
  const deactivated: string[] = JSON.parse(
    localStorage.getItem("kuber_deactivated_users") || "[]",
  );

  const isActive = (email: string) => !deactivated.includes(email);

  const filtered = users.filter((u) => {
    if (filter === "active") return isActive(u.email);
    if (filter === "inactive") return !isActive(u.email);
    return true;
  });

  const toggleActive = (email: string) => {
    const current: string[] = JSON.parse(
      localStorage.getItem("kuber_deactivated_users") || "[]",
    );
    if (current.includes(email)) {
      localStorage.setItem(
        "kuber_deactivated_users",
        JSON.stringify(current.filter((e) => e !== email)),
      );
    } else {
      localStorage.setItem(
        "kuber_deactivated_users",
        JSON.stringify([...current, email]),
      );
    }
    setRefresh((r) => r + 1);
  };

  const deleteUser = (email: string) => {
    const all: User[] = JSON.parse(localStorage.getItem("kuber_users") || "[]");
    localStorage.setItem(
      "kuber_users",
      JSON.stringify(all.filter((u) => u.email !== email)),
    );
    setRefresh((r) => r + 1);
  };

  const getActivatedFunds = (email: string): string[] =>
    JSON.parse(localStorage.getItem(`kuber_activated_${email}`) || "[]");

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle={`Total users: ${users.length}`}
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

      {filtered.length === 0 ? (
        <div
          data-ocid="users.empty_state"
          className="text-center py-12"
          style={{ color: "#888888" }}
        >
          <p>No users found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u, i) => {
            const active = isActive(u.email);
            const funds = getActivatedFunds(u.email);
            return (
              <div
                key={u.email}
                data-ocid={`users.item.${i + 1}`}
                className="rounded-xl p-4"
                style={{ background: "#111111", border: "1px solid #333333" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-medium">{u.email}</div>
                    {u.registeredAt && (
                      <div className="text-xs" style={{ color: "#888888" }}>
                        {new Date(u.registeredAt).toLocaleString()}
                      </div>
                    )}
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {funds.length === 0 ? (
                        <span className="text-xs" style={{ color: "#666666" }}>
                          No funds activated
                        </span>
                      ) : (
                        funds.map((f) => (
                          <span
                            key={f}
                            className="text-xs bg-amber-950/30 text-amber-400 border border-amber-900 px-2 py-0.5 rounded-full"
                          >
                            {f}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <button
                      type="button"
                      data-ocid={`users.delete_button.${i + 1}`}
                      onClick={() => deleteUser(u.email)}
                      className="text-xs text-red-400 border border-red-900 px-3 py-1.5 rounded-lg hover:bg-red-900/40"
                      style={{ background: "rgba(239,68,68,0.08)" }}
                    >
                      Delete
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
