import type { AuthUser } from "../../App";
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

export default function BankStatementPage({ user }: { user: AuthUser }) {
  const transactions = getStatement(user.email);

  return (
    <div>
      <PageHeader
        title="Bank Account Statement"
        subtitle="Last 30 days transaction history"
      />

      {transactions.length === 0 ? (
        <div
          data-ocid="statement.empty_state"
          className="text-center text-zinc-600 py-16"
        >
          <div className="text-4xl mb-3">📄</div>
          <p>No transactions in the last 30 days.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800">
              <tr>
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
                    className="text-left text-zinc-400 text-xs uppercase tracking-wider px-4 py-3 font-medium"
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
                  className="border-t border-zinc-800 hover:bg-zinc-800/30"
                >
                  <td className="px-4 py-3 text-zinc-400">{t.date}</td>
                  <td className="px-4 py-3 text-white">{t.description}</td>
                  <td className="px-4 py-3 text-zinc-400 font-mono text-xs">
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
