import type { AuthUser, Page } from "../../App";
import PageHeader from "../ui/PageHeader";

interface Transaction {
  id: string;
  date: string;
  description: string;
  utrNumber: string;
  debit: number;
  credit: number;
  balance: number;
}

function getStatement(email: string): Transaction[] {
  return JSON.parse(localStorage.getItem(`kuber_statement_${email}`) || "[]");
}

export default function BankStatementPage({
  user,
  setCurrentPage,
}: {
  user: AuthUser;
  setCurrentPage?: (p: Page) => void;
}) {
  const transactions = getStatement(user.email);

  return (
    <div>
      <PageHeader
        title="Bank Account Statement"
        subtitle="Last 30 days transaction history"
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      {transactions.length === 0 ? (
        <div
          data-ocid="statement.empty_state"
          className="text-center py-16"
          style={{ color: "#5a7ab0" }}
        >
          <div className="text-4xl mb-3">📄</div>
          <p>No transactions in the last 30 days.</p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#07112a" }}>
                {[
                  "Date",
                  "Description",
                  "UTR Number",
                  "Debit",
                  "Credit",
                  "Balance",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs uppercase tracking-wider px-4 py-3 font-medium"
                    style={{ color: "#8899c0" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr
                  key={t.id}
                  data-ocid={`statement.row.${i + 1}`}
                  className="hover:bg-white/5"
                  style={{ borderTop: "1px solid #333333" }}
                >
                  <td className="px-4 py-3" style={{ color: "#8899c0" }}>
                    {t.date}
                  </td>
                  <td className="px-4 py-3 text-white">{t.description}</td>
                  <td
                    className="px-4 py-3 font-mono text-xs"
                    style={{ color: "#8899c0" }}
                  >
                    {t.utrNumber}
                  </td>
                  <td className="px-4 py-3 text-red-400">
                    {t.debit > 0 ? `₹${t.debit.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-green-400">
                    {t.credit > 0 ? `₹${t.credit.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    ₹{t.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
