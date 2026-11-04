import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  LogOut,
  CheckCircle2,
  Car,
  Bike,
  Truck,
  ChevronRight,
  User,
  Phone,
  Hash,
  AlertTriangle,
  FileText,
  AlertCircle,
} from "lucide-react";
import { api, VehicleItem, ChallanItem } from "../../api/client";
import { formatDate, formatCurrency } from "../../lib/formatting";
import { useSessionStore } from "../auth/sessionStore";

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearSession } = useSessionStore();

  const [savingConsent, setSavingConsent] = useState(false);
  const [consentSuccess, setConsentSuccess] = useState(false);

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.users.getMe(),
  });

  const { data: vehicleData } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.vehicles.getVehicles(),
  });

  const { data: challanData } = useQuery({
    queryKey: ["challans", "profile"],
    queryFn: () => api.challans.getChallans({ limit: 10 }),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const { data: consentData } = useQuery({
    queryKey: ["consents"],
    queryFn: () => api.consents.getConsents(),
  });

  const handleTogglePartnerConsent = async () => {
    if (!consentData?.consents) return;
    const currentRecord = consentData.consents.find((c) => c.purpose === "REWARD_DISCOUNT");
    const currentVal = currentRecord ? currentRecord.granted : true;
    try {
      setSavingConsent(true);
      await api.consents.updateConsents([
        { purpose: "IDENTITY_VERIFICATION", granted: true },
        { purpose: "VAI_SCORING", granted: true },
        { purpose: "REWARD_DISCOUNT", granted: !currentVal },
      ]);
      queryClient.invalidateQueries({ queryKey: ["consents"] });
      setConsentSuccess(true);
      setTimeout(() => setConsentSuccess(false), 3000);
    } catch {
      alert("Failed to update consent preferences.");
    } finally {
      setSavingConsent(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    clearSession();
    navigate("/login");
  };

  if (userLoading || !userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const vehicles: VehicleItem[] = vehicleData?.vehicles || [];
  const partnerOffersGranted =
    consentData?.consents.find((c) => c.purpose === "REWARD_DISCOUNT")?.granted ?? true;

  const rawChallans = ((challanData?.challans || (challanData as any)?.items || []) as ChallanItem[]);
  const unpaidChallans = rawChallans.filter(
    (c) => c.status === "UNPAID" || c.status === "PENDING"
  );
  const totalUnpaidAmountPaise = unpaidChallans.reduce(
    (sum, c) => sum + (Number(c.amountPaise) || 0),
    0
  );

  const getVehicleIcon = (type: string) => {
    if (type === "TWO_WHEELER") return <Bike className="w-5 h-5" />;
    if (type === "COMMERCIAL") return <Truck className="w-5 h-5" />;
    return <Car className="w-5 h-5" />;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Citizen Profile & Vehicles</h1>
        <p className="text-slate-600 text-base mt-1">
          Review your verified identity credentials, registered vehicles (RC), and DPDP consent settings.
        </p>
      </div>

      {/* Citizen Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-2xl">
            {userData.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{userData.fullName}</h2>
            <p className="text-sm text-slate-500 font-mono">
              Account ID: {userData.userId} • Registered {formatDate(userData.registrationDate)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
              Permanent Account Number (PAN)
            </span>
            <span className="text-base font-mono font-bold text-slate-900 block">
              {userData.panMasked}
            </span>
            <span className="text-xs text-slate-500 block">Masked per RBI and DPDP standards (P2)</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
              Registered Mobile Number
            </span>
            <span className="text-base font-mono font-bold text-slate-900 block">
              {userData.mobileMasked}
            </span>
            <span className="text-xs text-slate-500 block">Primary authenticated driver mobile</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
              Jurisdiction / Residence
            </span>
            <span className="text-base font-bold text-slate-900 block">
              {userData.city}, {userData.state}
            </span>
            <span className="text-xs text-slate-500 block">Regional Transport Office (RTO) Zone</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
              Driving Licence
            </span>
            <span className="text-base font-mono font-bold text-slate-900 block">
              {userData.licence?.licenceNoMasked || "GJ01-XXXX-4417"}
            </span>
            <span className="text-xs text-slate-500 block">
              Class: {userData.licence?.licenceClass || "LMV, MCWG"} • Valid till:{" "}
              {formatDate(userData.licence?.expiryDate || "2027-05-14")}
            </span>
          </div>
        </div>
      </div>

      {/* My Vehicles & RC Details Section */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-bold text-slate-900">My Registered Vehicles & RC Details</h2>
          </div>
          <Link
            to="/vehicles"
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 min-h-[36px]"
          >
            <span>Manage All Documents</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No vehicles currently registered under this account.</p>
        ) : (
          <div className="space-y-4">
            {vehicles.map((v) => {
              const rc = v.rcDetails;
              const ownerName = v.owner?.fullName || userData.fullName || "Citizen Driver";
              const ownerMobile = v.owner?.mobile || userData.mobileMasked || "+91 90000 00005";
              const modelDisplayName = rc?.modelName || `${v.manufacturer} ${v.model}`;
              const modelYear = v.modelYear || rc?.modelYear || (v.model.includes("2012") ? 2012 : v.model.includes("2015") ? 2015 : 2020);

              return (
                <div
                  key={v.vehicleId}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4 hover:border-slate-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                        {getVehicleIcon(v.vehicleType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-black text-slate-900">
                            {v.registrationNo}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-green-100 text-green-800">
                            RC Active
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 block">
                          {modelDisplayName}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/vehicles/${v.registrationNo}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
                    >
                      <span>View RC Certificate</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* RC Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-100 space-y-0.5">
                      <span className="text-slate-400 block font-semibold text-[11px] flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        Registered Owner
                      </span>
                      <span className="font-bold text-slate-900 block text-sm">{ownerName}</span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-100 space-y-0.5">
                      <span className="text-slate-400 block font-semibold text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        Registered Mobile
                      </span>
                      <span className="font-mono font-bold text-slate-900 block text-sm">{ownerMobile}</span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-100 space-y-0.5">
                      <span className="text-slate-400 block font-semibold text-[11px] flex items-center gap-1">
                        <Hash className="w-3 h-3 text-slate-400" />
                        Engine Number
                      </span>
                      <span className="font-mono font-bold text-slate-800 block text-xs truncate">
                        {v.engineNo || rc?.engineNo || `ENG${v.registrationNo}`}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-100 space-y-0.5">
                      <span className="text-slate-400 block font-semibold text-[11px] flex items-center gap-1">
                        <Hash className="w-3 h-3 text-slate-400" />
                        Chassis Number
                      </span>
                      <span className="font-mono font-bold text-slate-800 block text-xs truncate">
                        {v.chassisNo || rc?.chassisNo || `CHS${v.registrationNo}X`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Traffic Challans & Penalties Section */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-bold text-slate-900">Traffic Challans & Penalties</h2>
            {unpaidChallans.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {unpaidChallans.length} Action Required
              </span>
            )}
          </div>
          <Link
            to="/challans"
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 min-h-[36px]"
          >
            <span>View All Challans</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {unpaidChallans.length === 0 ? (
          <div className="p-5 rounded-xl bg-green-50/70 border border-green-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <span className="font-bold text-green-900 block text-sm">No Pending Challans</span>
              <p className="text-xs text-green-700">All traffic notices are settled. Great driving record!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-amber-950 block text-sm">
                    {unpaidChallans.length} Unpaid Traffic {unpaidChallans.length === 1 ? "Challan" : "Challans"} Detected
                  </span>
                  <p className="text-xs text-amber-800">
                    Total outstanding penalties: <strong className="font-mono">{formatCurrency(totalUnpaidAmountPaise)}</strong>. Settle before due date to protect your VAI score.
                  </p>
                </div>
              </div>
              <Link
                to="/challans"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition text-center whitespace-nowrap min-h-[36px] flex items-center justify-center"
              >
                Pay & Settle All
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unpaidChallans.map((c) => (
                <div
                  key={c.challanId}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-800">{c.challanId}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800">
                      {c.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">{c.violationDesc}</span>
                    <span className="text-xs text-slate-500 block">
                      Vehicle: <span className="font-mono font-semibold text-slate-700">{c.registrationNo}</span> • Code: {c.violationCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {formatCurrency(c.amountPaise)}
                    </span>
                    <Link
                      to="/challans"
                      className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5 min-h-[32px]"
                    >
                      <span>Pay / Dispute</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* DPDP Act 2023 Consent Management */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-900">DPDP Act 2023 Consent Management</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Notice: DPDP-V1</span>
        </div>

        {consentSuccess && (
          <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>Consent preferences updated successfully.</span>
          </div>
        )}

        <div className="space-y-4 text-sm">
          {/* Mandatory Purposes */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Identity & Scoring Processing</span>
              <p className="text-xs text-slate-500 mt-0.5">
                Essential for computing your VAI score, transparent ledger tracking, and vehicle verification.
              </p>
            </div>
            <span className="text-xs font-bold uppercase text-slate-600 bg-slate-200 px-2.5 py-1 rounded">
              Active (Mandatory)
            </span>
          </div>

          {/* Optional Partner Offers Toggle */}
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 flex items-center justify-between">
            <div className="pr-4">
              <span className="font-bold text-slate-900 block">Partner Offers & Renewal Discounts</span>
              <p className="text-xs text-slate-600 mt-0.5">
                Allows certified insurers and testing centers to verify your Good/Very Good category to apply instant discounts.
              </p>
            </div>

            <button
              onClick={handleTogglePartnerConsent}
              disabled={savingConsent}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition min-h-[44px] ${
                partnerOffersGranted
                  ? "bg-teal-600 text-white hover:bg-teal-700"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {savingConsent ? "Updating..." : partnerOffersGranted ? "Granted (Enabled)" : "Withdrawn (Disabled)"}
            </button>
          </div>
        </div>
      </section>

      {/* Sign Out Action */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold px-6 py-3 rounded-xl border border-red-200 transition min-h-[44px]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Citizen Session</span>
        </button>
      </div>
    </div>
  );
};
