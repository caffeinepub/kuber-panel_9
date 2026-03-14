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
    icon: <Building2 size={22} />,
    gradient: "linear-gradient(135deg, #0f2460 0%, #1a4fb5 100%)",
    iconBg: "rgba(26,79,181,0.35)",
  },
  {
    id: "bank-statement",
    title: "Bank Statement",
    subtitle: "Transaction history",
    icon: <FileText size={22} />,
    gradient: "linear-gradient(135deg, #0c3020 0%, #0e7a45 100%)",
    iconBg: "rgba(14,122,69,0.35)",
  },
  {
    id: "gaming-fund",
    title: "Gaming Fund",
    subtitle: "15% commission",
    icon: <Gamepad2 size={22} />,
    gradient: "linear-gradient(135deg, #3a0070 0%, #8b12c5 100%)",
    iconBg: "rgba(139,18,197,0.35)",
  },
  {
    id: "stock-fund",
    title: "Stock Fund",
    subtitle: "30% commission",
    icon: <TrendingUp size={22} />,
    gradient: "linear-gradient(135deg, #0b2e10 0%, #1a8a28 100%)",
    iconBg: "rgba(26,138,40,0.35)",
  },
  {
    id: "political-fund",
    title: "Political Fund",
    subtitle: "30% commission",
    icon: <Landmark size={22} />,
    gradient: "linear-gradient(135deg, #450808 0%, #c01515 100%)",
    iconBg: "rgba(192,21,21,0.35)",
  },
  {
    id: "mix-fund",
    title: "Mix Fund",
    subtitle: "25% commission",
    icon: <Shuffle size={22} />,
    gradient: "linear-gradient(135deg, #042d25 0%, #057a5a 100%)",
    iconBg: "rgba(5,122,90,0.35)",
  },
  {
    id: "commission",
    title: "My Commission",
    subtitle: "Track your earnings",
    icon: <BarChart3 size={22} />,
    gradient: "linear-gradient(135deg, #4a2800 0%, #e87c00 100%)",
    iconBg: "rgba(232,124,0,0.35)",
  },
  {
    id: "live-activity",
    title: "Live Fund Activity",
    subtitle: "Real-time updates",
    icon: <Activity size={22} />,
    gradient: "linear-gradient(135deg, #012035 0%, #007ba0 100%)",
    iconBg: "rgba(0,123,160,0.35)",
  },
  {
    id: "withdrawal",
    title: "Withdrawal",
    subtitle: "UPI / Bank / USDT",
    icon: <Download size={22} />,
    gradient: "linear-gradient(135deg, #4a1500 0%, #d94010 100%)",
    iconBg: "rgba(217,64,16,0.35)",
  },
  {
    id: "withdrawal-history",
    title: "Withdrawal History",
    subtitle: "Past transactions",
    icon: <Clock size={22} />,
    gradient: "linear-gradient(135deg, #2e1a0a 0%, #8b5e35 100%)",
    iconBg: "rgba(139,94,53,0.35)",
  },
  {
    id: "activation",
    title: "Activation Panel",
    subtitle: "Unlock fund options",
    icon: <Key size={22} />,
    gradient: "linear-gradient(135deg, #1a1500 0%, #a08800 100%)",
    iconBg: "rgba(160,136,0,0.35)",
  },
  {
    id: "help-support",
    title: "Help & Support",
    subtitle: "Telegram support",
    icon: <MessageCircle size={22} />,
    gradient: "linear-gradient(135deg, #012020 0%, #006655 100%)",
    iconBg: "rgba(0,102,85,0.35)",
  },
  {
    id: "generated-codes",
    title: "Generated Codes",
    subtitle: "Manage activation codes",
    icon: <Key size={22} />,
    gradient: "linear-gradient(135deg, #2a1a00 0%, #c07020 100%)",
    iconBg: "rgba(192,112,32,0.35)",
    adminOnly: true,
  },
  {
    id: "user-management",
    title: "User Management",
    subtitle: "View & manage users",
    icon: <Users size={22} />,
    gradient: "linear-gradient(135deg, #081530 0%, #1e3d9e 100%)",
    iconBg: "rgba(30,61,158,0.35)",
    adminOnly: true,
  },
  {
    id: "bank-approval",
    title: "Bank Approval",
    subtitle: "Approve user banks",
    icon: <CheckSquare size={22} />,
    gradient: "linear-gradient(135deg, #051a10 0%, #0e7040 100%)",
    iconBg: "rgba(14,112,64,0.35)",
    adminOnly: true,
  },
  {
    id: "change-support",
    title: "Change Support Link",
    subtitle: "Update Telegram link",
    icon: <Link size={22} />,
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
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 4px" }}>
      {/* Dashboard Brand Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 16px 10px",
          marginBottom: 10,
          background: "linear-gradient(180deg, #0d0900 0%, #000 100%)",
          borderBottom: "1.5px solid #c9a227",
          borderRadius: "0 0 16px 16px",
        }}
      >
        {/* Logo - medium size */}
        <img
          src="/assets/uploads/IMG_20260311_153614_686-removebg-preview-1.png"
          alt="Kuber Panel"
          loading="eager"
          fetchPriority="high"
          style={{
            width: 80,
            height: "auto",
            objectFit: "contain",
            display: "block",
            marginBottom: 8,
          }}
        />
        {/* Name */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: "#d4a017",
            letterSpacing: 3,
            textTransform: "uppercase",
            textShadow: "0 0 16px rgba(212,160,23,0.5)",
          }}
        >
          Kuber Panel
        </div>
        {/* Tagline */}
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            marginTop: 3,
            letterSpacing: 1,
          }}
        >
          Start New Journey
        </div>
        <div
          style={{
            width: 50,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, #d4a017, transparent)",
            marginTop: 8,
          }}
        />
      </div>

      {/* Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
        data-ocid="dashboard.list"
      >
        {cards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            data-ocid={`dashboard.item.${index + 1}`}
            onClick={() => setCurrentPage(card.id)}
            style={{
              textAlign: "left",
              borderRadius: 14,
              padding: "12px 12px 10px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: card.gradient,
              boxShadow: "0 3px 14px rgba(0,0,0,0.5)",
              height: 120,
              border: "1px solid rgba(212,160,23,0.12)",
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: card.iconBg,
              }}
            >
              <span style={{ color: "#fff" }}>{card.icon}</span>
            </div>
            <div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  lineHeight: 1.3,
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                {card.subtitle}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
