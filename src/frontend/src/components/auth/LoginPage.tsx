import { useState } from "react";
import type { AuthUser } from "../../App";

const ADMIN_EMAIL = "Kuberpanelwork@gmail.com";
const ADMIN_PASS = "Admin@123";

function hashPass(p: string): string {
  return btoa(encodeURIComponent(p));
}

interface Props {
  onLogin: (u: AuthUser) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setError("This Login ID is reserved.");
          setLoading(false);
          return;
        }
        const users: {
          email: string;
          passwordHash: string;
          registeredAt: string;
          name?: string;
        }[] = JSON.parse(localStorage.getItem("kuber_users") || "[]");
        const exists = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );
        if (exists) {
          setError("Login ID already registered. Please login.");
          setLoading(false);
          return;
        }
        users.push({
          email,
          passwordHash: hashPass(password),
          registeredAt: new Date().toISOString(),
          name: name || undefined,
        });
        localStorage.setItem("kuber_users", JSON.stringify(users));
        setMode("login");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
        setError("Registration successful! Please login.");
        setLoading(false);
        return;
      }

      // Login
      if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        onLogin({ email, isAdmin: true, userId: "admin" });
        return;
      }

      const users: { email: string; passwordHash: string }[] = JSON.parse(
        localStorage.getItem("kuber_users") || "[]",
      );
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.passwordHash === hashPass(password),
      );
      if (!found) {
        setError("Invalid Login ID or password.");
        setLoading(false);
        return;
      }

      onLogin({ email: found.email, isAdmin: false, userId: found.email });
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  const inp =
    "w-full rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none transition-colors text-sm";
  const inpStyle = {
    background: "#111111",
    border: "1px solid #333333",
  };
  const inpFocusStyle = "focus:border-amber-500";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #000000 0%, #0d0d0d 50%, #111111 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo header */}
        <div className="text-center mb-6">
          <div className="flex flex-col items-center gap-3 mb-4">
            <div
              style={{
                border: "3px solid #d4a017",
                borderRadius: "50%",
                padding: 3,
                boxShadow: "0 0 30px rgba(212,160,23,0.4)",
                background: "#111",
                display: "inline-flex",
              }}
            >
              <img
                src="/assets/uploads/IMG_20260311_153559_128-1.jpg"
                alt="Kuber Panel Logo"
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
            <div>
              <h1
                className="text-3xl font-bold tracking-widest"
                style={{ color: "#f5c842" }}
              >
                KUBER
              </h1>
              <p
                className="text-xs tracking-[0.3em] font-medium"
                style={{ color: "#d4a017" }}
              >
                PANEL
              </p>
            </div>
          </div>

          {/* Official licence banner */}
          <div
            className="rounded-xl px-4 py-3 mb-4 text-center"
            style={{
              background: "#0d1a00",
              border: "1px solid #2a4a00",
            }}
          >
            <div
              className="text-xs font-bold tracking-wider mb-1"
              style={{ color: "#7ec43a" }}
            >
              🛡️ OFFICIAL LICENSED PLATFORM
            </div>
            <div className="text-xs" style={{ color: "#5a8a20" }}>
              Trusted · Verified · Secure
            </div>
          </div>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: "#111111",
            border: "1px solid #333333",
          }}
        >
          {/* Mode title */}
          <div className="text-center mb-4">
            <div
              className="text-base font-bold tracking-wide"
              style={{ color: "#f5c842" }}
            >
              {mode === "login" ? "User Login" : "Create Account"}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#555" }}>
              {mode === "login"
                ? "Enter your Login ID (Email) & password to continue"
                : "Register with your email as Login ID"}
            </div>
          </div>

          <div
            className="flex mb-6 rounded-lg p-1"
            style={{ background: "#111111", border: "1px solid #222222" }}
          >
            <button
              type="button"
              data-ocid="auth.login.tab"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "login"
                  ? "bg-amber-500 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              data-ocid="auth.register.tab"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "register"
                  ? "bg-amber-500 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs mb-1 uppercase tracking-wider"
                  style={{ color: "#888888" }}
                >
                  Full Name
                </label>
                <input
                  id="auth-name"
                  data-ocid="auth.name.input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`${inp} ${inpFocusStyle}`}
                  style={inpStyle}
                />
              </div>
            )}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs mb-1 uppercase tracking-wider"
                style={{ color: "#888888" }}
              >
                Login ID (Email)
              </label>
              <input
                id="auth-email"
                data-ocid="auth.email.input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your Login ID (Email)"
                className={`${inp} ${inpFocusStyle}`}
                style={inpStyle}
              />
            </div>
            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs mb-1 uppercase tracking-wider"
                style={{ color: "#888888" }}
              >
                Password
              </label>
              <input
                id="auth-password"
                data-ocid="auth.password.input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className={`${inp} ${inpFocusStyle}`}
                style={inpStyle}
              />
            </div>
            {mode === "register" && (
              <div>
                <label
                  htmlFor="auth-confirm"
                  className="block text-xs mb-1 uppercase tracking-wider"
                  style={{ color: "#888888" }}
                >
                  Confirm Password
                </label>
                <input
                  id="auth-confirm"
                  data-ocid="auth.confirm_password.input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  className={`${inp} ${inpFocusStyle}`}
                  style={inpStyle}
                />
              </div>
            )}

            {error && (
              <div
                data-ocid="auth.error_state"
                className={`text-sm px-3 py-2 rounded-lg ${
                  error.includes("successful")
                    ? "text-green-400 bg-green-950/30 border border-green-800"
                    : "text-red-400 bg-red-950/30 border border-red-800"
                }`}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              data-ocid="auth.submit.button"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 text-black font-bold py-3 rounded-lg transition-colors mt-2"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Login"
                  : "Create Account"}
            </button>
          </form>
        </div>

        {/* Bottom official notice */}
        <div
          className="mt-4 rounded-xl px-4 py-3 text-center"
          style={{
            background: "#0a0a0a",
            border: "1px solid #222",
          }}
        >
          <div
            className="text-xs font-semibold mb-1"
            style={{ color: "#d4a017" }}
          >
            🏆 Kuber Panel — Official Application
          </div>
          <div className="text-xs" style={{ color: "#444" }}>
            Licensed Platform · All rights reserved · Protected by end-to-end
            encryption
          </div>
        </div>
      </div>
    </div>
  );
}
