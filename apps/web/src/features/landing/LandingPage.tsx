import React from "react";
import { Link } from "react-router-dom";
import { Shield, Award, FileCheck, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { DummyBanner } from "../../components/DummyBanner";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <DummyBanner />

      {/* Hero Section */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight">VAI</span>
              <span className="text-xs text-slate-500 block">Vehicle Accountability Index</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition"
            >
              Admin Portal
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm min-h-[44px]"
            >
              <span>Citizen Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-teal-50 text-teal-800 border border-teal-200">
              <Zap className="w-4 h-4 text-teal-600" />
              National Driving Accountability Platform
            </span>

            <h1 className="text-4xl sm:5xl font-black text-slate-900 tracking-tight leading-tight">
              Fair Driving. Real Accountability. Transparent Rewards.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              VAI transforms your traffic compliance, payment timeliness, and vehicle document status
              into an objective score from <strong>500 to 900 (base 700)</strong>, unlocking direct discounts
              on insurance, PUC, RC, and licence renewals.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold px-8 py-3.5 rounded-xl shadow-md transition-colors min-h-[48px]"
              >
                <span>Check Your VAI Score</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 3 Core Pillars */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-center text-slate-900 mb-12">
            The Three Pillars of Vehicle Accountability
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Immutable Ledger</h3>
              <p className="text-slate-600 text-base leading-relaxed">
                Every single point change is explained in plain language in an append-only ledger. No hidden algorithms.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Direct Renewal Savings</h3>
              <p className="text-slate-600 text-base leading-relaxed">
                Maintain a Good (650+) or Very Good (750+) score to receive up to 2.00% off insurance and mandatory vehicle renewals.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Clear Fee Transparency</h3>
              <p className="text-slate-600 text-base leading-relaxed">
                Platform fees (50 ppm / 100 ppm) are stated openly as a separate line item. Never buried in fine print.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm border-t border-slate-800">
        <p>VAI Prototype – Designed for Government, Insurer, and Citizen Transparency (DPDP Act 2023 Compliant).</p>
      </footer>
    </div>
  );
};
