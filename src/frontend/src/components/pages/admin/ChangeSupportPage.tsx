import { useEffect, useState } from "react";
import type { Page } from "../../../App";
import PageHeader from "../../ui/PageHeader";

const DEFAULT_LINK = "https://t.me/+fUsY5uHRNeYyYmJl";

export default function ChangeSupportPage({
  setCurrentPage,
}: {
  setCurrentPage?: (p: Page) => void;
}) {
  const [link, setLink] = useState(DEFAULT_LINK);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("kuber_support_link");
    if (stored) setLink(stored);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("kuber_support_link", link);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Change Support Link"
        subtitle="Update the Telegram support link for users"
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      <div className="max-w-lg">
        <form
          onSubmit={handleSave}
          className="rounded-xl p-6 space-y-4"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <div>
            <label
              htmlFor="support-link"
              className="text-xs uppercase tracking-wider block mb-2"
              style={{ color: "#8899c0" }}
            >
              Telegram Support Link
            </label>
            <input
              id="support-link"
              data-ocid="support.link.input"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
              placeholder="https://t.me/..."
              className="w-full rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-sm"
              style={{ background: "#07112a", border: "1px solid #333333" }}
            />
          </div>
          {saved && (
            <div
              data-ocid="support.success_state"
              className="text-green-400 text-sm bg-green-950/30 border border-green-800 rounded-lg px-3 py-2"
            >
              Support link updated successfully!
            </div>
          )}
          <button
            type="submit"
            data-ocid="support.save.button"
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-lg text-sm"
          >
            Save Link
          </button>
        </form>

        <div
          className="mt-4 p-4 rounded-xl"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <div className="text-xs mb-1" style={{ color: "#8899c0" }}>
            Current Link:
          </div>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 text-sm break-all hover:underline"
          >
            {link}
          </a>
        </div>
      </div>
    </div>
  );
}
