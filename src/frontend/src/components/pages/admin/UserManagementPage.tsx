import { useState } from "react";
import PageHeader from "../../ui/PageHeader";

interface User {
  email: string;
  passwordHash: string;
  registeredAt?: string;
}

export default function UserManagementPage() {
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
      />

      <div className="flex bg-zinc-800 rounded-lg p-1 mb-6 w-fit">
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            type="button"
            key={f}
            data-ocid={`users.${f}.tab`}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
              filter === f
                ? "bg-amber-500 text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div
          data-ocid="users.empty_state"
          className="text-center text-zinc-600 py-12"
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
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-medium">{u.email}</div>
                    {u.registeredAt && (
                      <div className="text-zinc-500 text-xs">
                        {new Date(u.registeredAt).toLocaleString()}
                      </div>
                    )}
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {funds.length === 0 ? (
                        <span className="text-xs text-zinc-600">
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
                      className="text-xs bg-zinc-800 hover:bg-zinc-700 text-amber-400 px-3 py-1.5 rounded-lg"
                    >
                      {active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      data-ocid={`users.delete_button.${i + 1}`}
                      onClick={() => deleteUser(u.email)}
                      className="text-xs bg-red-950/30 text-red-400 border border-red-900 px-3 py-1.5 rounded-lg hover:bg-red-900/40"
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
