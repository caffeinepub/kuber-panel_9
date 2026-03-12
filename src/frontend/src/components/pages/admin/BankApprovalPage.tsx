import { useCallback, useEffect, useState } from "react";
import type { Page } from "../../../App";
import PageHeader from "../../ui/PageHeader";

interface BankEntry {
  id: string;
  userEmail: string;
  accountType: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  mobileNumber: string;
  netBankingId: string;
  upiId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

function getAllBanks(): BankEntry[] {
  const banks: BankEntry[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("kuber_banks_")) {
      const email = key.replace("kuber_banks_", "");
      try {
        const userBanks: BankEntry[] = JSON.parse(
          localStorage.getItem(key) || "[]",
        );
        for (const b of userBanks) {
          banks.push({ ...b, userEmail: email });
        }
      } catch {
        // skip malformed
      }
    }
  }
  return banks.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function updateBankStatus(
  userEmail: string,
  bankId: string,
  status: "approved" | "rejected",
) {
  const banks = JSON.parse(
    localStorage.getItem(`kuber_banks_${userEmail}`) || "[]",
  );
  const updated = banks.map((b: BankEntry) =>
    b.id === bankId ? { ...b, status } : b,
  );
  localStorage.setItem(`kuber_banks_${userEmail}`, JSON.stringify(updated));
}

function deleteBank(userEmail: string, bankId: string) {
  const banks: BankEntry[] = JSON.parse(
    localStorage.getItem(`kuber_banks_${userEmail}`) || "[]",
  );
  localStorage.setItem(
    `kuber_banks_${userEmail}`,
    JSON.stringify(banks.filter((b) => b.id !== bankId)),
  );
}

export default function BankApprovalPage({
  setCurrentPage,
}: {
  setCurrentPage?: (p: Page) => void;
}) {
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  const [all, setAll] = useState<BankEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = useCallback(() => setAll(getAllBanks()), []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  const filtered = all.filter((b) => b.status === tab);

  const handleApprove = (b: BankEntry) => {
    updateBankStatus(b.userEmail, b.id, "approved");
    refresh();
  };
  const handleReject = (b: BankEntry) => {
    updateBankStatus(b.userEmail, b.id, "rejected");
    refresh();
  };
  const handleDelete = (b: BankEntry) => {
    deleteBank(b.userEmail, b.id);
    refresh();
  };

  return (
    <div>
      <PageHeader
        title="Company Bank Approval"
        subtitle="Review and approve user bank accounts — auto-refreshes every 3 sec"
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      <div
        className="flex rounded-lg p-1 mb-6 w-fit"
        style={{ background: "#07112a", border: "1px solid #333333" }}
      >
        {(["pending", "approved", "rejected"] as const).map((t) => (
          <button
            type="button"
            key={t}
            data-ocid={`bank_approval.${t}.tab`}
            onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
              tab === t ? "bg-amber-500 text-black" : "hover:text-white"
            }`}
            style={tab !== t ? { color: "#8899c0" } : {}}
          >
            {t === "pending"
              ? "Pending"
              : t === "approved"
                ? "Approved"
                : "Rejected"}{" "}
            ({all.filter((b) => b.status === t).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div
          data-ocid="bank_approval.empty_state"
          className="text-center py-12"
          style={{ color: "#888888" }}
        >
          <p>No {tab} bank accounts.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b, i) => (
            <div
              key={b.id}
              data-ocid={`bank_approval.item.${i + 1}`}
              className="rounded-xl overflow-hidden"
              style={{ background: "#111111", border: "1px solid #333333" }}
            >
              <button
                type="button"
                data-ocid={`bank_approval.expand.${i + 1}`}
                onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                className="w-full p-4 flex items-start justify-between hover:bg-white/5 transition-colors text-left"
              >
                <div>
                  <div className="text-white font-medium">{b.bankName}</div>
                  <div className="text-sm" style={{ color: "#8899c0" }}>
                    {b.accountHolder} - {b.accountNumber}
                  </div>
                  <div className="text-xs" style={{ color: "#888888" }}>
                    User: {b.userEmail} |{" "}
                    {b.createdAt ? new Date(b.createdAt).toLocaleString() : ""}
                  </div>
                </div>
                <span className="text-sm" style={{ color: "#888888" }}>
                  {expandedId === b.id ? "▲" : "▼"}
                </span>
              </button>

              {expandedId === b.id && (
                <div className="p-4" style={{ borderTop: "1px solid #333333" }}>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    {(
                      [
                        ["Account Type", b.accountType],
                        ["Bank Name", b.bankName],
                        ["Account Holder", b.accountHolder],
                        ["Account Number", b.accountNumber],
                        ["IFSC Code", b.ifscCode],
                        ["Mobile", b.mobileNumber],
                        ["Net Banking ID", b.netBankingId],
                        ["UPI ID", b.upiId],
                      ] as [string, string][]
                    ).map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-lg p-2.5"
                        style={{ background: "#07112a" }}
                      >
                        <div className="text-xs" style={{ color: "#888888" }}>
                          {label}
                        </div>
                        <div className="text-white text-sm">{value || "-"}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {tab === "pending" && (
                      <>
                        <button
                          type="button"
                          data-ocid={`bank_approval.approve.${i + 1}`}
                          onClick={() => handleApprove(b)}
                          className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 rounded-lg font-medium"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          data-ocid={`bank_approval.reject.${i + 1}`}
                          onClick={() => handleReject(b)}
                          className="bg-red-700 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg font-medium"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      data-ocid={`bank_approval.delete_button.${i + 1}`}
                      onClick={() => handleDelete(b)}
                      className="text-red-400 text-sm px-4 py-2 rounded-lg border border-red-900"
                      style={{ background: "rgba(239,68,68,0.08)" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
