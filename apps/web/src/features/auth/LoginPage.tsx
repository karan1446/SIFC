import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Shield, ArrowRight, AlertCircle } from "lucide-react";
import { DummyBanner } from "../../components/DummyBanner";
import { api, ApiError } from "../../api/client";
import { useSessionStore } from "./sessionStore";
import { queryClient } from "../../lib/queryClient";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAccessToken, setUser } = useSessionStore();

  const [mobile, setMobile] = useState(searchParams.get("mobile") || "");
  const [pan, setPan] = useState(searchParams.get("pan") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qMobile = searchParams.get("mobile");
    const qPan = searchParams.get("pan");
    if (qMobile) setMobile(qMobile);
    if (qPan) setPan(qPan);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Format cleanup - strip spaces, parentheses, hyphens
    let cleanMobile = mobile.replace(/[\s\-\(\)]/g, "");
    if (!cleanMobile.startsWith("+")) {
      cleanMobile = `+91${cleanMobile.replace(/^0+/, "")}`;
    }
    const cleanPan = pan.trim().toUpperCase();

    // Validation (10-char PAN regex)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!panRegex.test(cleanPan)) {
      setError("Please enter a valid 10-character PAN (e.g. DUMMY1001X)");
      return;
    }

    try {
      setLoading(true);
      const res = await api.auth.login(cleanMobile, cleanPan);

      // Store credentials and user
      queryClient.clear();
      setAccessToken(res.accessToken);
      setUser(res.user);

      // Check consent status and redirect directly
      try {
        const consentRes = await api.consents.getConsents();
        if (consentRes.consents && consentRes.consents.length >= 2) {
          navigate("/dashboard");
        } else {
          navigate("/consent");
        }
      } catch {
        navigate("/consent");
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to sign in. Please verify your mobile and PAN.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <DummyBanner />

      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">VAI</span>
          </Link>
          <span className="text-sm text-slate-500 font-medium">Citizen Sign In</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-black text-slate-900">Citizen Sign In</h1>
            <p className="text-sm text-slate-500">
              Enter your Mobile Number and PAN to access your vehicle accountability score and renewal discounts.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="mobile" className="block text-sm font-semibold text-slate-700 mb-1">
                Mobile Number
              </label>
              <input
                id="mobile"
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 90000 00001"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition min-h-[44px]"
              />
              <span className="text-xs text-slate-500 mt-1 block">
                Enter your mobile number (e.g. +91 90000 00001)
              </span>
            </div>

            <div>
              <label htmlFor="pan" className="block text-sm font-semibold text-slate-700 mb-1">
                Permanent Account Number (PAN)
              </label>
              <input
                id="pan"
                type="text"
                required
                maxLength={10}
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="DUMMY1001X"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base font-mono uppercase text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition min-h-[44px]"
              />
              <span className="text-xs text-slate-500 mt-1 block">
                Enter your 10-character PAN (e.g. DUMMY1001X)
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 text-white text-base font-bold py-3.5 px-4 rounded-xl shadow-sm transition min-h-[48px]"
            >
              <span>{loading ? "Signing In..." : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
