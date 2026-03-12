import { useEffect, useState } from "react";
import PageHeader from "../../ui/PageHeader";

const DEFAULT_LINK = "https://t.me/+fUsY5uHRNeYyYmJl";

export default function ChangeSupportPage() {
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
      />

      <div className="max-w-lg">
        <form
          onSubmit={handleSave}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="support-link"
              className="text-xs text-zinc-400 uppercase tracking-wider block mb-2"
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
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-sm"
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

        <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-zinc-400 text-xs mb-1">Current Link:</div>
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
