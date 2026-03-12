import {
  Activity,
  ArrowDownLeft,
  BarChart3,
  Building2,
  CheckSquare,
  FileText,
  Gamepad2,
  Key,
  Landmark,
  Link,
  Menu,
  MessageCircle,
  Shuffle,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { AuthUser, Page } from "../../App";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard Home",
    icon: <Activity size={18} />,
  },
  { id: "add-bank", label: "Add Bank Account", icon: <Building2 size={18} /> },
  {
    id: "bank-statement",
    label: "Bank Statement",
    icon: <FileText size={18} />,
  },
  {
    id: "gaming-fund",
    label: "Gaming Fund (15%)",
    icon: <Gamepad2 size={18} />,
  },
  {
    id: "stock-fund",
    label: "Stock Fund (30%)",
    icon: <TrendingUp size={18} />,
  },
  { id: "mix-fund", label: "Mix Fund (25%)", icon: <Shuffle size={18} /> },
  {
    id: "political-fund",
    label: "Political Fund (30%)",
    icon: <Landmark size={18} />,
  },
  {
    id: "live-activity",
    label: "Live Fund Activity",
    icon: <Activity size={18} />,
  },
  { id: "commission", label: "My Commission", icon: <BarChart3 size={18} /> },
  { id: "withdrawal", label: "Withdrawal", icon: <Wallet size={18} /> },
  {
    id: "withdrawal-history",
    label: "Withdrawal History",
    icon: <ArrowDownLeft size={18} />,
  },
  { id: "activation", label: "Activation Panel", icon: <Key size={18} /> },
  {
    id: "help-support",
    label: "Help & Support",
    icon: <MessageCircle size={18} />,
  },
  {
    id: "generated-codes",
    label: "Generated Codes",
    icon: <Key size={18} />,
    adminOnly: true,
  },
  {
    id: "user-management",
    label: "User Management",
    icon: <Users size={18} />,
    adminOnly: true,
  },
  {
    id: "bank-approval",
    label: "Bank Approval",
    icon: <CheckSquare size={18} />,
    adminOnly: true,
  },
  {
    id: "change-support",
    label: "Change Support Link",
    icon: <Link size={18} />,
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
      onClick={(e) => {
        e.stopPropagation();
        setCurrentPage(item.id);
        if (window.innerWidth < 768) setOpen(false);
      }}
      className="w-full flex items-center gap-3 rounded-lg transition-all relative"
      style={{
        padding: "0 12px",
        minHeight: "44px",
        fontSize: "13px",
        background:
          currentPage === item.id ? "rgba(212,160,23,0.18)" : "transparent",
        color: currentPage === item.id ? "#f5c842" : "#aaaaaa",
        fontWeight: currentPage === item.id ? 700 : 400,
        borderLeft:
          currentPage === item.id
            ? "3px solid #d4a017"
            : "3px solid transparent",
      }}
    >
      <span
        className="flex-shrink-0"
        style={{ width: 18, height: 18, display: "flex", alignItems: "center" }}
      >
        {item.icon}
      </span>
      <span className="truncate">{item.label}</span>
    </button>
  );

  return (
    <>
      {open && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: overlay to close sidebar on outside click
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className="flex flex-col h-screen transition-all duration-300 z-40 flex-shrink-0 overflow-hidden"
        style={{
          background: "#111111",
          borderRight: "1px solid #2a2a2a",
          width: open ? "256px" : "0px",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 p-3"
          style={{ borderBottom: "1px solid #2a2a2a", minWidth: "256px" }}
        >
          <button
            type="button"
            data-ocid="sidebar.toggle.button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors"
            style={{ color: "#d4a017" }}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <img
            src="/assets/uploads/IMG_20260311_153559_128-1.jpg"
            alt="Kuber Panel"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            style={{ border: "2px solid #d4a017" }}
          />
          <div className="flex-1 min-w-0">
            <div
              className="font-bold text-sm leading-tight truncate"
              style={{ color: "#f5c842" }}
            >
              Kuber Panel
            </div>
            <div className="text-[10px] truncate" style={{ color: "#666666" }}>
              Financial Platform
            </div>
          </div>
          <div
            className="flex items-center gap-1 rounded-full px-2 py-0.5 flex-shrink-0"
            style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid #22c55e",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-500 text-[9px] font-bold tracking-widest">
              LIVE
            </span>
          </div>
        </div>

        {/* User info card */}
        <div
          className="mx-3 mt-3 rounded-xl p-3 flex items-center gap-3"
          style={{
            background: "#1a1a1a",
            border: "1px solid #333333",
            minWidth: "230px",
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #d4a017, #f5c842)",
              color: "#000",
            }}
          >
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">
              Kuber Panel
            </div>
            <div className="text-[10px] truncate" style={{ color: "#888888" }}>
              {user.email}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto p-2 space-y-0.5 mt-2"
          style={{ minWidth: "256px" }}
        >
          {userItems.map((item) => (
            <NavLink key={item.id} item={item} />
          ))}

          {user.isAdmin && adminItems.length > 0 && (
            <>
              <div
                className="border-t my-2"
                style={{ borderColor: "#2a2a2a" }}
              />
              {adminItems.map((item) => (
                <NavLink key={item.id} item={item} />
              ))}
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
