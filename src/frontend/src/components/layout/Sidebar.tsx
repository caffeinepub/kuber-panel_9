import type { AuthUser, Page } from "../../App";

interface NavItem {
  id: Page;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "add-bank", label: "Add Bank Account", icon: "🏦" },
  { id: "bank-statement", label: "Bank Statement", icon: "📄" },
  { id: "gaming-fund", label: "Gaming Fund (15%)", icon: "🎮" },
  { id: "stock-fund", label: "Stock Fund (30%)", icon: "📈" },
  { id: "mix-fund", label: "Mix Fund (30%)", icon: "🔀" },
  { id: "political-fund", label: "Political Fund (25%)", icon: "🏛️" },
  { id: "live-activity", label: "Live Fund Activity", icon: "⚡" },
  { id: "commission", label: "My Commission", icon: "💰" },
  { id: "withdrawal", label: "Withdrawal", icon: "💳" },
  { id: "withdrawal-history", label: "Withdrawal History", icon: "🧾" },
  { id: "activation", label: "Activation Panel", icon: "🔑" },
  { id: "help-support", label: "Help & Support", icon: "💬" },
  {
    id: "generated-codes",
    label: "Generated Codes",
    icon: "🎫",
    adminOnly: true,
  },
  {
    id: "user-management",
    label: "User Management",
    icon: "👥",
    adminOnly: true,
  },
  { id: "bank-approval", label: "Bank Approval", icon: "✅", adminOnly: true },
  {
    id: "change-support",
    label: "Change Support Link",
    icon: "🔗",
    adminOnly: true,
  },
];

interface Props {
  user: AuthUser;
  currentPage: Page;
  setCurrentPage: (p: Page) => void;
  onLogout: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

export default function Sidebar({
  user,
  currentPage,
  setCurrentPage,
  onLogout,
  open,
  setOpen,
}: Props) {
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || user.isAdmin);
  const userItems = items.filter((i) => !i.adminOnly);
  const adminItems = items.filter((i) => i.adminOnly);

  const NavLink = ({ item }: { item: NavItem }) => (
    <button
      type="button"
      data-ocid={`nav.${item.id}.link`}
      onClick={() => setCurrentPage(item.id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
        currentPage === item.id
          ? "bg-amber-500 text-black font-semibold"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      <span className="text-lg w-5 flex-shrink-0">{item.icon}</span>
      {open && <span className="truncate">{item.label}</span>}
    </button>
  );

  return (
    <aside
      className={`flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all duration-300 ${
        open ? "w-64" : "w-16"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-black font-bold flex-shrink-0">
          ₹
        </div>
        {open && (
          <div>
            <div className="text-amber-400 font-bold text-sm tracking-widest">
              KUBER
            </div>
            <div className="text-amber-600 text-[10px] tracking-[0.3em]">
              PANEL
            </div>
          </div>
        )}
        <button
          type="button"
          data-ocid="sidebar.toggle.button"
          onClick={() => setOpen(!open)}
          className="ml-auto text-zinc-500 hover:text-white"
        >
          {open ? "◀" : "▶"}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {userItems.map((item) => (
          <NavLink key={item.id} item={item} />
        ))}

        {user.isAdmin && adminItems.length > 0 && (
          <>
            {open && (
              <div className="px-3 pt-4 pb-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                  Admin
                </span>
              </div>
            )}
            {!open && <div className="border-t border-zinc-700 my-2" />}
            {adminItems.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-zinc-800">
        {open && (
          <div className="mb-2">
            <div className="text-xs text-zinc-400 truncate">{user.email}</div>
            {user.isAdmin && (
              <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-bold">
                ADMIN
              </span>
            )}
          </div>
        )}
        <button
          type="button"
          data-ocid="sidebar.logout.button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:bg-red-900/30 hover:text-red-400 text-sm transition-colors"
        >
          <span>🚪</span>
          {open && "Logout"}
        </button>
      </div>
    </aside>
  );
}
