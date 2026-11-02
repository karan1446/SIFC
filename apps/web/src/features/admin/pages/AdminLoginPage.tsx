import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { adminApi } from "../../../api/adminClient";
import { useAdminSessionStore } from "../adminSessionStore";
import { DummyBanner } from "../../../components/DummyBanner";

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAdminSession } = useAdminSessionStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminApi.auth.login({ email, password });
      if (res.accessToken && res.admin) {
        setAdminSession(res.accessToken, res.admin);
        navigate("/admin/dashboard");
      } else {
        setError("Invalid response received from server. Please try again.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid login credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: "SUPER_ADMIN" | "OPS" | "ANALYST") => {
    if (role === "SUPER_ADMIN") {
      setEmail("superadmin@vai.local");
      setPassword("SuperAdmin@123");
    } else if (role === "OPS") {
      setEmail("ops@vai.local");
      setPassword("OpsAdmin@123");
    } else {
      setEmail("analyst@vai.local");
      setPassword("Analyst@123");
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      <DummyBanner />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-3 shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin & Governance Portal</h1>
            <p className="text-sm text-slate-400 mt-1">
              Ministry Administrative Staff Environment
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Admin Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. superadmin@vai.local"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Master Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg shadow transition flex items-center justify-center space-x-2 text-sm"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? "Authenticating..." : "Sign In to Admin Portal"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Persona Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-700/80">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 text-center">
              Quick-Select Role
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("SUPER_ADMIN")}
                className="p-2 text-left bg-slate-900/80 hover:bg-slate-700/80 border border-purple-900/50 rounded-lg text-[11px] transition"
              >
                <div className="font-bold text-purple-400">Super Admin</div>
                <div className="text-slate-400 text-[10px]">Full Access</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("OPS")}
                className="p-2 text-left bg-slate-900/80 hover:bg-slate-700/80 border border-blue-900/50 rounded-lg text-[11px] transition"
              >
                <div className="font-bold text-blue-400">Ops Officer</div>
                <div className="text-slate-400 text-[10px]">Disputes/Txns</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("ANALYST")}
                className="p-2 text-left bg-slate-900/80 hover:bg-slate-700/80 border border-emerald-900/50 rounded-lg text-[11px] transition"
              >
                <div className="font-bold text-emerald-400">Analyst</div>
                <div className="text-slate-400 text-[10px]">Read & Export</div>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Citizen Portal</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 text-center text-xs text-slate-500 border-t border-slate-800">
        Internal Ministry of Road Transport and Highways (MoRTH) Administrative Gateway
      </div>
    </div>
  );
};
