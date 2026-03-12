import { useEffect, useState } from "react";
import type { AuthUser, Page } from "../../App";
import PageHeader from "../ui/PageHeader";

const DEFAULT_LINK = "https://t.me/+fUsY5uHRNeYyYmJl";

export default function HelpSupportPage({
  user: _user,
  setCurrentPage,
}: {
  user: AuthUser;
  setCurrentPage?: (p: Page) => void;
}) {
  const [link, setLink] = useState(DEFAULT_LINK);

  useEffect(() => {
    const stored = localStorage.getItem("kuber_support_link");
    if (stored) setLink(stored);
  }, []);

  return (
    <div>
      <PageHeader
        title="Help & Support"
        subtitle="Get assistance from our support team"
        onBack={setCurrentPage ? () => setCurrentPage("dashboard") : undefined}
      />

      <div className="max-w-md">
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-white font-bold text-xl mb-2">Need Help?</h3>
          <p className="text-sm mb-6" style={{ color: "#8899c0" }}>
            Connect with our support team on Telegram for instant assistance.
          </p>
          <a
            data-ocid="help.telegram.button"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            <span>📨</span>
            Open Telegram Support
          </a>
        </div>
      </div>
    </div>
  );
}
