import { useState } from "react";
import type { AuthUser, Page } from "../../App";
import PageHeader from "../ui/PageHeader";

interface BankAccount {
  id: string;
  accountType: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  mobileNumber: string;
  netBankingId: string;
  netBankingPassword: string;
  upiId: string;
  qrCode: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

function storageKey(email: string) {
  return `kuber_banks_${email}`;
}

function getBanks(email: string): BankAccount[] {
  return JSON.parse(localStorage.getItem(storageKey(email)) || "[]");
}

function saveBanks(email: string, banks: BankAccount[]) {
  localStorage.setItem(storageKey(email), JSON.stringify(banks));
}

export default function AddBankPage({
  user,
  setCurrentPage,
}: {
  user: AuthUser;
  setCurrentPage?: (p: Page) => void;
}) {
  const [banks, setBanks] = useState<BankAccount[]>(() => getBanks(user.email));
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    accountType: "saving",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    mobileNumber: "",
    netBankingId: "",
    netBankingPassword: "",
    upiId: "",
    qrCode: "",
  });

  const refresh = () => setBanks(getBanks(user.email));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const current = getBanks(user.email);
    if (editId) {
      const updated = current.map((b) =>
        b.id === editId && b.status === "pending" ? { ...b, ...form } : b,
      );
      saveBanks(user.email, updated);
    } else {
      const newBank: BankAccount = {
        id: Date.now().toString(),
        ...form,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      saveBanks(user.email, [...current, newBank]);
    }
    setShowForm(false);
    setEditId(null);
    setForm({
      accountType: "saving",
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      ifscCode: "",
      mobileNumber: "",
      netBankingId: "",
      netBankingPassword: "",
      upiId: "",
      qrCode: "",
    });
    refresh();
  };

  const handleEdit = (bank: BankAccount) => {
    if (bank.status !== "pending") return;
    setForm({
      accountType: bank.accountType,
      bankName: bank.bankName,
      accountHolder: bank.accountHolder,
      accountNumber: bank.accountNumber,
      ifscCode: bank.ifscCode,
      mobileNumber: bank.mobileNumber,
      netBankingId: bank.netBankingId,
      netBankingPassword: bank.netBankingPassword,
      upiId: bank.upiId,
      qrCode: bank.qrCode,
    });
    setEditId(bank.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const updated = getBanks(user.email).filter((b) => b.id !== id);
    saveBanks(user.email, updated);
    refresh();
  };

  const statusLabel = (s: string) => {
    if (s === "approved") return "Company Approved";
    if (s === "rejected") return "Rejected";
    return "Pending Company Approval";
  };

  const statusColor = (s: string) => {
    if (s === "approved")
      return "text-green-400 bg-green-950/30 border-green-800";
    if (s === "rejected") return "text-red-400 bg-red-950/30 border-red-800";
    return "text-amber-400 bg-amber-950/30 border-amber-800";
  };

  const inp =
    "w-full rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-sm";
  const inpStyle = { background: "#0a1230", border: "1px solid #333333" };

  const fields: [keyof typeof form, string][] = [
    ["bankName", "Bank Name"],
    ["accountHolder", "Account Holder Name"],
    ["accountNumber", "Account Number"],
    ["ifscCode", "IFSC Code"],
    ["mobileNumber", "Mobile Number"],
    ["netBankingId", "Internet Banking ID"],
    ["netBankingPassword", "Internet Banking Password"],
    ["upiId", "UPI ID"],
    ["qrCode", "QR Code URL (Optional)"],
  ];

  return (
    <div>
      <PageHeader
        title="Add Bank Account"
        subtitle="Manage your linked bank accounts"
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      <button
        type="button"
        data-ocid="bank.add.button"
        onClick={() => {
          setShowForm(true);
          setEditId(null);
        }}
        className="mb-6 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
      >
        + Add New Bank
      </button>

      {showForm && (
        <div
          className="rounded-xl p-6 mb-6"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <h3 className="text-amber-400 font-bold mb-4">
            {editId ? "Edit Bank Account" : "New Bank Account"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label
                htmlFor="bank-account-type"
                className="text-xs uppercase tracking-wider block mb-1"
                style={{ color: "#9ca3af" }}
              >
                Account Type
              </label>
              <select
                id="bank-account-type"
                data-ocid="bank.account_type.select"
                value={form.accountType}
                onChange={(e) =>
                  setForm({ ...form, accountType: e.target.value })
                }
                className={inp}
                style={inpStyle}
              >
                <option value="saving">Saving</option>
                <option value="current">Current</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
            {fields.map(([key, label]) => (
              <div key={key}>
                <label
                  htmlFor={`bank-${key}`}
                  className="text-xs uppercase tracking-wider block mb-1"
                  style={{ color: "#9ca3af" }}
                >
                  {label}
                </label>
                <input
                  id={`bank-${key}`}
                  data-ocid={`bank.${key}.input`}
                  type={key === "netBankingPassword" ? "password" : "text"}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required={key !== "qrCode"}
                  placeholder={label}
                  className={inp}
                  style={inpStyle}
                />
              </div>
            ))}
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                data-ocid="bank.submit.button"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-lg text-sm"
              >
                {editId ? "Update Bank" : "Submit for Company Approval"}
              </button>
              <button
                type="button"
                data-ocid="bank.cancel.button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
                className="text-white px-6 py-2.5 rounded-lg text-sm"
                style={{ background: "#0a1230", border: "1px solid #333333" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {banks.length === 0 ? (
        <div
          data-ocid="bank.empty_state"
          className="text-center py-16"
          style={{ color: "#888888" }}
        >
          <div className="text-4xl mb-3">🏦</div>
          <p>No bank accounts added yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {banks.map((bank, i) => (
            <div
              key={bank.id}
              data-ocid={`bank.item.${i + 1}`}
              className="rounded-xl p-5"
              style={{ background: "#111111", border: "1px solid #333333" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-semibold">
                    {bank.bankName}
                  </div>
                  <div className="text-sm" style={{ color: "#9ca3af" }}>
                    {bank.accountHolder} - {bank.accountNumber}
                  </div>
                  <div className="text-xs" style={{ color: "#888888" }}>
                    {bank.accountType.toUpperCase()} | IFSC: {bank.ifscCode}
                  </div>
                </div>
                <span
                  className={`text-xs border px-2 py-1 rounded-full font-semibold ${statusColor(bank.status)}`}
                >
                  {statusLabel(bank.status)}
                </span>
              </div>
              <div className="flex gap-2">
                {bank.status === "pending" && (
                  <button
                    type="button"
                    data-ocid={`bank.edit_button.${i + 1}`}
                    onClick={() => handleEdit(bank)}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{
                      background: "#0a1230",
                      border: "1px solid #333333",
                      color: "#f5c842",
                    }}
                  >
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  data-ocid={`bank.delete_button.${i + 1}`}
                  onClick={() => handleDelete(bank.id)}
                  className="text-xs bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-900 px-3 py-1.5 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
