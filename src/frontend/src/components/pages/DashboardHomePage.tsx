import {
  Activity,
  BarChart3,
  Building2,
  CheckSquare,
  Clock,
  Download,
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
} from "lucide-react";
import type { AuthUser, Page } from "../../App";

interface DashboardCard {
  id: Page;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  adminOnly?: boolean;
}

const ALL_CARDS: DashboardCard[] = [
  {
    id: "add-bank",
    title: "Add Bank Account",
    subtitle: "Link your bank securely",
    icon: <Building2 size={24} />,
    gradient: "linear-gradient(135deg, #0f2460 0%, #1a4fb5 100%)",
    iconBg: "rgba(26,79,181,0.35)",
  },
  {
    id: "bank-statement",
    title: "Bank Statement",
    subtitle: "Transaction history",
    icon: <FileText size={24} />,
    gradient: "linear-gradient(135deg, #0c3020 0%, #0e7a45 100%)",
    iconBg: "rgba(14,122,69,0.35)",
  },
  {
    id: "gaming-fund",
    title: "Gaming Fund",
    subtitle: "30% commission",
    icon: <Gamepad2 size={24} />,
    gradient: "linear-gradient(135deg, #3a0070 0%, #8b12c5 100%)",
    iconBg: "rgba(139,18,197,0.35)",
  },
  {
    id: "stock-fund",
    title: "Stock Fund",
    subtitle: "30% commission",
    icon: <TrendingUp size={24} />,
    gradient: "linear-gradient(135deg, #0b2e10 0%, #1a8a28 100%)",
    iconBg: "rgba(26,138,40,0.35)",
  },
  {
    id: "political-fund",
    title: "Political Fund",
    subtitle: "25% commission",
    icon: <Landmark size={24} />,
    gradient: "linear-gradient(135deg, #450808 0%, #c01515 100%)",
    iconBg: "rgba(192,21,21,0.35)",
  },
  {
    id: "mix-fund",
    title: "Mix Fund",
    subtitle: "30% commission",
    icon: <Shuffle size={24} />,
    gradient: "linear-gradient(135deg, #042d25 0%, #057a5a 100%)",
    iconBg: "rgba(5,122,90,0.35)",
  },
  {
    id: "commission",
    title: "My Commission",
    subtitle: "Track your earnings",
    icon: <BarChart3 size={24} />,
    gradient: "linear-gradient(135deg, #4a2800 0%, #e87c00 100%)",
    iconBg: "rgba(232,124,0,0.35)",
  },
  {
    id: "live-activity",
    title: "Live Fund Activity",
    subtitle: "Real-time updates",
    icon: <Activity size={24} />,
    gradient: "linear-gradient(135deg, #012035 0%, #007ba0 100%)",
    iconBg: "rgba(0,123,160,0.35)",
  },
  {
    id: "withdrawal",
    title: "Withdrawal",
    subtitle: "UPI / Bank / USDT",
    icon: <Download size={24} />,
    gradient: "linear-gradient(135deg, #4a1500 0%, #d94010 100%)",
    iconBg: "rgba(217,64,16,0.35)",
  },
  {
    id: "withdrawal-history",
    title: "Withdrawal History",
    subtitle: "Past transactions",
    icon: <Clock size={24} />,
    gradient: "linear-gradient(135deg, #2e1a0a 0%, #8b5e35 100%)",
    iconBg: "rgba(139,94,53,0.35)",
  },
  {
    id: "activation",
    title: "Activation Panel",
    subtitle: "Unlock fund options",
    icon: <Key size={24} />,
    gradient: "linear-gradient(135deg, #1a1500 0%, #a08800 100%)",
    iconBg: "rgba(160,136,0,0.35)",
  },
  {
    id: "help-support",
    title: "Help & Support",
    subtitle: "Telegram support",
    icon: <MessageCircle size={24} />,
    gradient: "linear-gradient(135deg, #012020 0%, #006655 100%)",
    iconBg: "rgba(0,102,85,0.35)",
  },
  {
    id: "generated-codes",
    title: "Generated Codes",
    subtitle: "Manage activation codes",
    icon: <Key size={24} />,
    gradient: "linear-gradient(135deg, #2a1a00 0%, #c07020 100%)",
    iconBg: "rgba(192,112,32,0.35)",
    adminOnly: true,
  },
  {
    id: "user-management",
    title: "User Management",
    subtitle: "View & manage users",
    icon: <Users size={24} />,
    gradient: "linear-gradient(135deg, #081530 0%, #1e3d9e 100%)",
    iconBg: "rgba(30,61,158,0.35)",
    adminOnly: true,
  },
  {
    id: "bank-approval",
    title: "Bank Approval",
    subtitle: "Approve user banks",
    icon: <CheckSquare size={24} />,
    gradient: "linear-gradient(135deg, #051a10 0%, #0e7040 100%)",
    iconBg: "rgba(14,112,64,0.35)",
    adminOnly: true,
  },
  {
    id: "change-support",
    title: "Change Support Link",
    subtitle: "Update Telegram link",
    icon: <Link size={24} />,
    gradient: "linear-gradient(135deg, #150825 0%, #6a1aaa 100%)",
    iconBg: "rgba(106,26,170,0.35)",
    adminOnly: true,
  },
];

interface Props {
  user: AuthUser;
  setCurrentPage: (p: Page) => void;
}

export default function DashboardHomePage({ user, setCurrentPage }: Props) {
  const cards = ALL_CARDS.filter((c) => !c.adminOnly || user.isAdmin);

  return (
    <div className="max-w-2xl mx-auto px-2 py-0">
      {/* Header Bar */}
      <div
        className="flex items-center justify-between mb-5 -mx-2 px-4 py-3"
        style={{
          background: "#000000",
          borderBottom: "1px solid #222",
        }}
        data-ocid="dashboard.panel"
      >
        {/* Left: hamburger icon */}
        <div
          className="flex items-center justify-center"
          style={{ color: "#aaaaaa" }}
        >
          <Menu size={22} strokeWidth={2} />
        </div>

        {/* Right: LIVE badge */}
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1"
          style={{
            background: "#000",
            border: "1px solid #22c55e",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span
            className="text-xs font-bold tracking-widest"
            style={{ color: "#22c55e" }}
          >
            LIVE
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-3" data-ocid="dashboard.list">
        {cards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            data-ocid={`dashboard.item.${index + 1}`}
            onClick={() => setCurrentPage(card.id)}
            className="text-left rounded-2xl p-4 flex flex-col gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98] relative"
            style={{
              background: card.gradient,
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              minHeight: "110px",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: card.iconBg, backdropFilter: "blur(4px)" }}
            >
              <span style={{ color: "#fff" }}>{card.icon}</span>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">
                {card.title}
              </div>
              <div className="text-white/60 text-xs mt-0.5">
                {card.subtitle}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
