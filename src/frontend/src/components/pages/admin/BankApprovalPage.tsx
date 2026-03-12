import { useState } from "react";
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
  const users: { email: string }[] = JSON.parse(
    localStorage.getItem("kuber_users") || "[]",
  );
  const banks: BankEntry[] = [];
  for (const u of users) {
    const userBanks: BankEntry[] = JSON.parse(
      localStorage.getItem(`kuber_banks_${u.email}`) || "[]",
    );
    for (const b of userBanks) {
      banks.push({ ...b, userEmail: u.email });
    }
  }
  return banks;
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

export default function BankApprovalPage() {
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  const [_refresh, setRefresh] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const all = getAllBanks();
  const filtered = all.filter((b) => b.status === tab);

  const handleApprove = (b: BankEntry) => {
    updateBankStatus(b.userEmail, b.id, "approved");
    setRefresh((r) => r + 1);
  };
  const handleReject = (b: BankEntry) => {
    updateBankStatus(b.userEmail, b.id, "rejected");
    setRefresh((r) => r + 1);
  };
  const handleDelete = (b: BankEntry) => {
    deleteBank(b.userEmail, b.id);
    setRefresh((r) => r + 1);
  };

  return (
    <div>
      <PageHeader
        title="Bank Account Approval"
        subtitle="Review and manage user bank accounts"
      />

      <div className="flex bg-zinc-800 rounded-lg p-1 mb-6 w-fit">
        {(["pending", "approved", "rejected"] as const).map((t) => (
          <button
            type="button"
            key={t}
            data-ocid={`bank_approval.${t}.tab`}
            onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
              tab === t
                ? "bg-amber-500 text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)} (
            {all.filter((b) => b.status === t).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div
          data-ocid="bank_approval.empty_state"
          className="text-center text-zinc-600 py-12"
        >
          <p>No {tab} bank accounts.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b, i) => (
            <div
              key={b.id}
              data-ocid={`bank_approval.item.${i + 1}`}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
            >
              <button
                type="button"
                data-ocid={`bank_approval.expand.${i + 1}`}
                onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                className="w-full p-4 flex items-start justify-between hover:bg-zinc-800/50 transition-colors text-left"
              >
                <div>
                  <div className="text-white font-medium">{b.bankName}</div>
                  <div className="text-zinc-400 text-sm">
                    {b.accountHolder} - {b.accountNumber}
                  </div>
                  <div className="text-zinc-500 text-xs">
                    {b.userEmail} |{" "}
                    {b.createdAt ? new Date(b.createdAt).toLocaleString() : ""}
                  </div>
                </div>
                <span className="text-zinc-500 text-sm">
                  {expandedId === b.id ? "▲" : "▼"}
                </span>
              </button>

              {expandedId === b.id && (
                <div className="border-t border-zinc-800 p-4">
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
                      <div key={label} className="bg-zinc-800 rounded-lg p-2.5">
                        <div className="text-zinc-500 text-xs">{label}</div>
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
                      className="bg-zinc-800 hover:bg-zinc-700 text-red-400 text-sm px-4 py-2 rounded-lg border border-red-900"
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
