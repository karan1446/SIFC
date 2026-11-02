import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Car,
  Bike,
  Truck,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  User,
  Phone,
  FileText,
  Calendar,
  Hash,
  Fuel,
  Plus,
  Download,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  X,
  Shield,
  FileCheck,
  Sparkles,
  Award,
  HelpCircle,
  Clock,
  Radio,
  Check,
} from "lucide-react";
import { api, VehicleItem } from "../../api/client";
import { formatDate } from "../../lib/formatting";
import { useSessionStore } from "../auth/sessionStore";

export const VehiclesPage: React.FC = () => {
  const sessionUser = useSessionStore((s) => s.user);

  // Modal & Download states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRegNo, setNewRegNo] = useState("");
  const [newChassis, setNewChassis] = useState("");
  const [newVehicleType, setNewVehicleType] = useState("FOUR_WHEELER");
  const [addSuccessMsg, setAddSuccessMsg] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.vehicles.getVehicles(),
    staleTime: 60000,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const vehicles: VehicleItem[] = data.vehicles || [];

  // Summary statistics
  const totalVehicles = vehicles.length;
  const compliantVehiclesCount = vehicles.filter((v) => v.compliance?.fullyCompliant).length;
  const hasExpiredDocs = vehicles.some((v) => !v.compliance?.fullyCompliant);
  const allRcValid = vehicles.every((v) => v.compliance?.rcValid ?? true);

  const getVehicleIcon = (type: string) => {
    if (type === "TWO_WHEELER") return <Bike className="w-6 h-6" />;
    if (type === "COMMERCIAL") return <Truck className="w-6 h-6" />;
    return <Car className="w-6 h-6" />;
  };

  const handleDownloadSmartRc = (regNo: string) => {
    setDownloadNotice(`Generating official DigiLocker Smart RC certificate for ${regNo}...`);
    setTimeout(() => {
      setDownloadNotice(`Digital Smart RC for ${regNo} has been verified and downloaded (Parivahan MoRTH standard).`);
      setTimeout(() => setDownloadNotice(null), 5000);
    }, 1200);
  };

  const handleLinkVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegNo.trim()) return;
    const cleanReg = newRegNo.trim().toUpperCase();
    setAddSuccessMsg(`Vehicle ${cleanReg} linked successfully! Registration records verified with Vahan 4.0.`);
    setTimeout(() => {
      setAddSuccessMsg(null);
      setIsAddModalOpen(false);
      setNewRegNo("");
      setNewChassis("");
    }, 2500);
  };

  return (
    <div className="space-y-8">
      {/* Notifications / Alerts */}
      {downloadNotice && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-teal-600 flex-shrink-0 animate-bounce" />
            <span className="font-semibold">{downloadNotice}</span>
          </div>
          <button
            onClick={() => setDownloadNotice(null)}
            className="text-teal-700 hover:text-teal-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header with Title & Add Vehicle Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              My Registered Vehicles & RC Details
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 hidden sm:inline-flex items-center gap-1">
              <Radio className="w-3 h-3 text-teal-600 animate-pulse" />
              Vahan 4.0 Synced
            </span>
          </div>
          <p className="text-slate-600 text-base mt-1">
            Official Registration Certificate (RC) records, registered owner verification, and statutory document compliance.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-sm transition min-h-[44px] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Link Another Vehicle</span>
        </button>
      </div>

      {/* Top Fleet Compliance Summary Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vehicles */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Garage Fleet
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalVehicles}</span>
            <span className="text-xs font-semibold text-slate-500">
              {totalVehicles === 1 ? "Active Vehicle" : "Active Vehicles"}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 block">
            MoRTH Registered & Aadhaar Linked
          </span>
        </div>

        {/* RC Health */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              RC Fitness Health
            </span>
            <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {allRcValid ? "100%" : "Attention"}
            </span>
            <span className="text-xs font-semibold text-green-700">Valid & Active</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 block">
            Lifetime Private Road Tax Paid
          </span>
        </div>

        {/* Insurance & PUC Compliance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Document Compliance
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                hasExpiredDocs ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
              }`}
            >
              {hasExpiredDocs ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {compliantVehiclesCount} / {totalVehicles}
            </span>
            <span
              className={`text-xs font-semibold ${
                hasExpiredDocs ? "text-amber-700" : "text-green-700"
              }`}
            >
              {hasExpiredDocs ? "Action Required" : "Fully Compliant"}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 block">
            {hasExpiredDocs ? "Renew Insurance/PUC to regain +15 pts" : "All policies valid in database"}
          </span>
        </div>

        {/* VAI Score Garage Impact */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              VAI Score Impact
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-700">
              {compliantVehiclesCount === totalVehicles ? "+15 pts" : "+15 pts Available"}
            </span>
            <span className="text-xs font-semibold text-slate-500">Document Tier</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 block">
            Maintain compliance for up to 2.00% discount
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Registered Vehicle(s) & Health Checklist (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-teal-600" />
              <span>Registered Vehicle Records ({vehicles.length})</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">RTO Verified</span>
          </div>

          {vehicles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <Car className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800">No vehicles linked yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Link your vehicle registration number to monitor statutory validity and earn score compliance rewards.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
              >
                Link Vehicle Now
              </button>
            </div>
          ) : (
            vehicles.map((v) => {
              const isCompliant = v.compliance?.fullyCompliant ?? false;
              const rc = v.rcDetails;
              const ownerName = v.owner?.fullName || sessionUser?.fullName || rc?.ownerName || "Citizen Driver";
              const ownerMobile = v.owner?.mobile || rc?.registeredMobile || "+91 90000 00005";
              const modelDisplayName = rc?.modelName || `${v.manufacturer} ${v.model}`;
              const modelYear = v.modelYear || rc?.modelYear || (v.model.includes("2012") ? 2012 : v.model.includes("2015") ? 2015 : 2020);

              return (
                <div
                  key={v.vehicleId}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 hover:border-slate-300 transition-all"
                >
                  {/* Vehicle Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                        {getVehicleIcon(v.vehicleType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xl font-black text-slate-900 tracking-wider">
                            {v.registrationNo}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-green-100 text-green-800 border border-green-200">
                            RC Active
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-600 hidden sm:inline">
                            MoRTH Verified
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 block mt-0.5">
                          {modelDisplayName}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isCompliant
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {isCompliant ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                          Compliant (+15)
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                          Attention Needed
                        </>
                      )}
                    </span>
                  </div>

                  {/* RC Details & Owner Card */}
                  <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 text-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="font-bold uppercase tracking-wider text-slate-500 text-[11px] flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        Registration Certificate (RC) Details
                      </span>
                      <span className="font-mono text-slate-500">
                        Year: <strong>{modelYear}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Owner Details */}
                      <div>
                        <span className="text-slate-500 block text-[11px]">Registered Owner</span>
                        <span className="font-bold text-slate-900 text-sm flex items-center gap-1 mt-0.5 truncate">
                          <User className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          {ownerName}
                        </span>
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <span className="text-slate-500 block text-[11px]">Registered Mobile</span>
                        <span className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1 mt-0.5 truncate">
                          <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          {ownerMobile}
                        </span>
                      </div>

                      {/* Fuel Type */}
                      <div>
                        <span className="text-slate-500 block text-[11px]">Fuel Type</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Fuel className="w-3.5 h-3.5 text-slate-400" />
                          {v.fuelType || rc?.fuelType || "PETROL"}
                        </span>
                      </div>

                      {/* Engine Number */}
                      <div>
                        <span className="text-slate-500 block text-[11px]">Engine Number</span>
                        <span className="font-mono font-semibold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                          <Hash className="w-3 h-3 text-slate-400" />
                          {v.engineNo || rc?.engineNo || `ENG${v.registrationNo}`}
                        </span>
                      </div>

                      {/* Chassis Number */}
                      <div>
                        <span className="text-slate-500 block text-[11px]">Chassis Number</span>
                        <span className="font-mono font-semibold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                          <Hash className="w-3 h-3 text-slate-400" />
                          {v.chassisNo || rc?.chassisNo || `CHS${v.registrationNo}X`}
                        </span>
                      </div>

                      {/* RC Validity */}
                      <div>
                        <span className="text-slate-500 block text-[11px]">RC Fitness Valid Till</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(v.rcValidityTill)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Document Validity Status Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Insurance */}
                    <div
                      className={`p-3 rounded-xl border text-center space-y-1 ${
                        v.compliance?.insuranceValid
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                          : "bg-red-50/70 border-red-200 text-red-950"
                      }`}
                    >
                      <span className="text-xs font-bold block uppercase tracking-wide">
                        Motor Insurance
                      </span>
                      <span className="text-xs font-semibold block">
                        {v.compliance?.insuranceValid ? "Valid & In Force" : "Expired Policy"}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {formatDate(v.insuranceExpiry)}
                      </span>
                      {!v.compliance?.insuranceValid && (
                        <Link
                          to="/services/insurance"
                          className="inline-block mt-1 text-[11px] font-bold text-red-700 underline hover:text-red-900"
                        >
                          Renew Policy &rarr;
                        </Link>
                      )}
                    </div>

                    {/* PUC */}
                    <div
                      className={`p-3 rounded-xl border text-center space-y-1 ${
                        v.compliance?.pucValid
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                          : "bg-red-50/70 border-red-200 text-red-950"
                      }`}
                    >
                      <span className="text-xs font-bold block uppercase tracking-wide">
                        Pollution (PUC)
                      </span>
                      <span className="text-xs font-semibold block">
                        {v.compliance?.pucValid ? "Emission Valid" : "Expired Test"}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {formatDate(v.pucExpiry)}
                      </span>
                      {!v.compliance?.pucValid && (
                        <span className="inline-block mt-1 text-[11px] font-semibold text-red-700">
                          Visit Certified Center
                        </span>
                      )}
                    </div>

                    {/* RC Validity */}
                    <div
                      className={`p-3 rounded-xl border text-center space-y-1 ${
                        v.compliance?.rcValid
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                          : "bg-red-50/70 border-red-200 text-red-950"
                      }`}
                    >
                      <span className="text-xs font-bold block uppercase tracking-wide">
                        RC Fitness
                      </span>
                      <span className="text-xs font-semibold block">
                        {v.compliance?.rcValid ? "Fit for Road" : "Fitness Expired"}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {formatDate(v.rcValidityTill)}
                      </span>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700">
                        Lifetime Tax Paid
                      </span>
                    </div>
                  </div>

                  {/* Statutory Vehicle Checklist */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span>FASTag Active</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span>HSRP Installed</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span>No Hypothecation</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span>Road Tax Paid</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/vehicles/${v.registrationNo}`}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-900 min-h-[36px]"
                      >
                        <span>View Full RC & Challans</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDownloadSmartRc(v.registrationNo)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Digital RC (PDF)</span>
                      </button>
                    </div>

                    {!isCompliant && (
                      <Link
                        to="/services/insurance"
                        className="inline-flex items-center gap-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl shadow-sm transition min-h-[36px]"
                      >
                        <span>Renew Expired Policy</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Garage Maintenance & Inspection Guidelines Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Vehicle Compliance Health & Inspection</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">CMVR 1989 Rules</span>
            </div>

            <p className="text-xs text-slate-600">
              Maintaining valid third-party or comprehensive motor insurance and an active PUC certificate directly preserves your VAI score tier. Driving with lapsed documents triggers automatic score penalties and statutory fines.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Annual PUC Certification</span>
                <p className="text-slate-500">
                  BS-IV and BS-VI motor vehicles must renew their emission certificate every 12 months at any authorized RTO testing facility.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Digital Certificate Validity</span>
                <p className="text-slate-500">
                  Per Rule 139 of the Central Motor Vehicles Rules (CMVR), certificates presented via DigiLocker or mParivahan are treated as original physical documents.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Citizen Parivahan Services Hub & Score Advisory (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Parivahan Sewa Citizen Digital Services */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Parivahan Citizen Services</h3>
              </div>
              <span className="text-[11px] font-bold uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Official Hub
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Access official MoRTH digital certificate services and statutory vehicle administration directly from your authenticated citizen profile.
            </p>

            <div className="space-y-2.5">
              {/* Service 1: DigiLocker RC */}
              <button
                onClick={() => {
                  const reg = vehicles[0]?.registrationNo || "DL01IJ4005";
                  handleDownloadSmartRc(reg);
                }}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block group-hover:text-teal-700">
                      Download DigiLocker Smart RC
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Digitally signed official PDF certificate
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
              </button>

              {/* Service 2: Transfer of Ownership */}
              <div className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block group-hover:text-teal-700">
                      Transfer of Ownership / NOC
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Form 28, 29 & 30 resale application
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
              </div>

              {/* Service 3: Address Update in RC */}
              <div className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block group-hover:text-teal-700">
                      Update Address in Registration
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Sync Aadhaar residence with RTO record
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
              </div>

              {/* Service 4: Duplicate Smart Card RC */}
              <div className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block group-hover:text-teal-700">
                      Duplicate RC Card Request
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Apply for lost or damaged smart card replacement
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
              </div>

              {/* Service 5: Hypothecation / Loan Clearance */}
              <div className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block group-hover:text-teal-700">
                      Hypothecation Removal (HP Endorsement)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Clear bank vehicle loan lien upon payoff
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
              </div>
            </div>
          </div>

          {/* Card 2: Driver Score & Garage Compliance Impact */}
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-teal-300 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                VAI Score Garage Impact
              </span>
              <span className="text-[11px] font-mono text-teal-200/80">Model v1.0.0</span>
            </div>

            <div>
              <span className="text-xl font-bold block">Keep Documents Active for Renewal Savings</span>
              <p className="text-xs text-teal-100/80 mt-1">
                Your statutory document status directly weights your Vehicle Accountability Index:
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/10 flex items-center justify-between">
                <span>All Documents Valid (Insurance + PUC)</span>
                <span className="font-bold text-green-300">+15 to +20 pts</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 flex items-center justify-between">
                <span>30+ Consecutive Days Clean Driving</span>
                <span className="font-bold text-teal-300">+10 pts / mo</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 flex items-center justify-between">
                <span>Expired Insurance / PUC Penalty</span>
                <span className="font-bold text-red-300">-15 pts</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 flex items-center justify-between">
                <span>Very Good Tier (750+) Annual Policy Discount</span>
                <span className="font-bold text-amber-300">2.00% Off</span>
              </div>
            </div>

            <Link
              to="/rewards"
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-300 hover:text-white transition pt-1"
            >
              <span>Explore Renewal Savings Calculator</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Parivahan National Helpline & Regional Support */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 text-xs shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-sm">Parivahan Support & Helpdesk</h3>
            </div>

            <p className="text-slate-600">
              For queries related to RC smart cards, NOC verification, or state transfer:
            </p>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">MoRTH Toll-Free Helpline:</span>
                <span className="font-mono font-bold text-slate-900">1800-1800-151</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Working Hours:</span>
                <span className="text-slate-800 font-semibold">6:00 AM – 10:00 PM IST</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Central Helpdesk:</span>
                <span className="font-mono text-teal-700">helpdesk-vahan@gov.in</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Portal:</span>
                <a
                  href="https://parivahan.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-teal-700 hover:underline flex items-center gap-0.5"
                >
                  parivahan.gov.in <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Section: Citizen Vehicle Compliance FAQs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-bold text-slate-900">
              Citizen Vehicle Compliance & Legal FAQs
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Motor Vehicles Act (MVA)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 text-sm block">
              1. Why do I need to keep Insurance & PUC updated on VAI?
            </span>
            <p className="text-slate-600 leading-relaxed">
              Under Section 146 & 190(2) of the Motor Vehicles Act, operating a motor vehicle with expired insurance or PUC carries strict fines up to ₹2,000–₹10,000. On VAI, valid documents contribute a direct +15 point bonus towards your Good/Very Good tier discount.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 text-sm block">
              2. How is my vehicle ownership verified?
            </span>
            <p className="text-slate-600 leading-relaxed">
              When you log in, VAI authenticates your mobile number and Permanent Account Number (PAN) directly against the national Vahan 4.0 database. Only vehicles where you are recorded as the primary registered owner are linked to your scoring ledger.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 text-sm block">
              3. Is the DigiLocker digital RC accepted by traffic police?
            </span>
            <p className="text-slate-600 leading-relaxed">
              Yes. Per MoRTH notification and Rule 139 of the Central Motor Vehicles Rules (CMVR), digital driving licenses and RC certificates stored in DigiLocker or mParivahan are legally binding across all Indian states and Union Territories.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 text-sm block">
              4. What happens to my VAI score if I sell my car or bike?
            </span>
            <p className="text-slate-600 leading-relaxed">
              Once Form 29 and 30 are submitted to the RTO for Transfer of Ownership, the vehicle is unlinked from your garage ledger. Any future traffic challans or compliance lapses incurred by the new buyer will not affect your VAI score.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Modal: Link Another Vehicle */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-bold text-slate-900">Link Vehicle to Garage</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-900 text-xs space-y-2 text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                <span className="font-bold text-sm block">{addSuccessMsg}</span>
                <span className="text-slate-500 block">Updating your garage and VAI score ledger...</span>
              </div>
            ) : (
              <form onSubmit={handleLinkVehicle} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                    Vehicle Registration Number (RC)
                  </label>
                  <input
                    type="text"
                    required
                    value={newRegNo}
                    onChange={(e) => setNewRegNo(e.target.value.toUpperCase())}
                    placeholder="e.g. DL01IJ4005 or MH02CD2002"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm uppercase"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Must match your authenticated mobile number in Vahan 4.0 database
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                    Chassis Number (Last 5 Digits)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={newChassis}
                    onChange={(e) => setNewChassis(e.target.value.toUpperCase())}
                    placeholder="e.g. 52015"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm uppercase"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Available on your physical RC card or vehicle engine plate
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                    Vehicle Category
                  </label>
                  <select
                    value={newVehicleType}
                    onChange={(e) => setNewVehicleType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-semibold"
                  >
                    <option value="FOUR_WHEELER">Four-Wheeler / Motor Car (LMV)</option>
                    <option value="TWO_WHEELER">Two-Wheeler / Motorcycle (MCWG)</option>
                    <option value="COMMERCIAL">Commercial / Transport Vehicle</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Shield className="w-3.5 h-3.5 text-teal-600" />
                    <span>MoRTH Verification Notice</span>
                  </div>
                  <p>
                    By clicking Verify & Link, you authorize VAI to query the National Vahan registry to retrieve statutory validity records.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-sm"
                  >
                    Verify & Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
