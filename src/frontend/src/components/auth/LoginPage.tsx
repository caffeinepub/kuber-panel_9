import { useState } from "react";
import type { AuthUser } from "../../App";
import { useActor } from "../../hooks/useActor";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { actor } = useActor();

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
        if (email === ADMIN_EMAIL) {
          setError("This email is reserved.");
          setLoading(false);
          return;
        }
        if (actor) {
          const ok = await actor.register(email, hashPass(password));
          if (!ok) {
            setError("Registration failed. Email may already be registered.");
            setLoading(false);
            return;
          }
        }
        const users = JSON.parse(localStorage.getItem("kuber_users") || "[]");
        users.push({
          email,
          passwordHash: hashPass(password),
          registeredAt: new Date().toISOString(),
        });
        localStorage.setItem("kuber_users", JSON.stringify(users));
        setMode("login");
        setError("Registration successful! Please login.");
        setLoading(false);
        return;
      }

      if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        onLogin({ email, isAdmin: true, userId: "admin" });
        return;
      }

      const users: { email: string; passwordHash: string }[] = JSON.parse(
        localStorage.getItem("kuber_users") || "[]",
      );
      const found = users.find(
        (u) => u.email === email && u.passwordHash === hashPass(password),
      );
      if (!found) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      onLogin({ email, isAdmin: false, userId: email });
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  const inp =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center text-2xl font-bold text-black shadow-lg shadow-amber-500/30">
              ₹
            </div>
            <div>
              <h1 className="text-3xl font-bold text-amber-400 tracking-widest">
                KUBER
              </h1>
              <p className="text-amber-600 text-xs tracking-[0.3em] font-medium">
                PANEL
              </p>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {["✓ Licensed", "✓ Secure", "✓ Verified"].map((badge) => (
              <span
                key={badge}
                className="text-xs text-green-400 border border-green-800 px-2 py-0.5 rounded-full bg-green-950/30"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex mb-6 bg-zinc-800 rounded-lg p-1">
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
            <div>
              <label
                htmlFor="auth-email"
                className="block text-zinc-400 text-xs mb-1 uppercase tracking-wider"
              >
                Email Address
              </label>
              <input
                id="auth-email"
                data-ocid="auth.email.input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className={inp}
              />
            </div>
            <div>
              <label
                htmlFor="auth-password"
                className="block text-zinc-400 text-xs mb-1 uppercase tracking-wider"
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
                className={inp}
              />
            </div>
            {mode === "register" && (
              <div>
                <label
                  htmlFor="auth-confirm"
                  className="block text-zinc-400 text-xs mb-1 uppercase tracking-wider"
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
                  className={inp}
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

        <p className="text-center text-zinc-600 text-xs mt-6">
          Protected by end-to-end encryption. All rights reserved.
        </p>
      </div>
    </div>
  );
}
