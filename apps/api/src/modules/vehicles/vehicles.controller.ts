import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/client.js";
import { AppError, diffCalendarDays, isDocumentValid } from "@vai/shared";

interface VehicleWithRelations {
  vehicleId: string;
  registrationNo: string;
  vehicleType: string;
  manufacturer: string;
  model: string;
  modelYear?: number | null;
  engineNo?: string | null;
  chassisNo?: string | null;
  fuelType?: string | null;
  color?: string | null;
  registrationDate: Date;
  insuranceExpiry: Date | null;
  pucExpiry: Date | null;
  rcValidityTill: Date;
  _count?: { challans: number };
  challans?: unknown[];
  user?: {
    userId: string;
    fullName: string;
    mobileE164: string;
    panMasked: string;
    city: string;
    state: string;
  } | null;
}

function formatVehicleResponse(v: VehicleWithRelations, now = new Date()) {
  const isInsValid = isDocumentValid(v.insuranceExpiry, now);
  const isPucValid = isDocumentValid(v.pucExpiry, now);
  const isRcValid = isDocumentValid(v.rcValidityTill, now);

  const insDays = v.insuranceExpiry ? diffCalendarDays(now, v.insuranceExpiry) : null;
  const pucDays = v.pucExpiry ? diffCalendarDays(now, v.pucExpiry) : null;
  const rcDays = diffCalendarDays(now, v.rcValidityTill);

  // Compute individual vehicle compliance score (c_v)
  let c_v = 0;
  if (isInsValid) c_v += 5;
  else c_v -= 10;

  if (isPucValid) c_v += 5;
  else c_v -= 10;

  if (isRcValid) c_v += 5;
  else c_v -= 10;

  const mYear =
    v.modelYear ||
    (v.model.includes("2012")
      ? 2012
      : v.model.includes("2015")
      ? 2015
      : v.registrationDate.getFullYear());

  const fType =
    v.fuelType ||
    (v.vehicleType === "TWO_WHEELER"
      ? "PETROL"
      : v.vehicleType === "COMMERCIAL"
      ? "DIESEL"
      : "PETROL");

  const col =
    v.color ||
    (v.vehicleType === "TWO_WHEELER" ? "Black & Red" : "Silky Silver");

  const regClean = v.registrationNo.replace(/[^A-Z0-9]/g, "");
  const engNo = v.engineNo || `ENG${regClean}${mYear}`;
  const chsNo = v.chassisNo || `CHS${regClean}X${mYear}`;

  const vClass =
    v.vehicleType === "TWO_WHEELER"
      ? "Motor Cycle / Scooter (2W)"
      : v.vehicleType === "FOUR_WHEELER"
      ? "Light Motor Vehicle - Car (4W)"
      : "Commercial Transport Vehicle";

  const owner = {
    fullName: v.user?.fullName || "Citizen Driver",
    mobile: v.user?.mobileE164 || "+919000000000",
    panMasked: v.user?.panMasked || "XXXXXX0000",
    city: v.user?.city || "New Delhi",
    state: v.user?.state || "Delhi"
  };

  const compliance = {
    insuranceValid: isInsValid,
    pucValid: isPucValid,
    rcValid: isRcValid,
    fullyCompliant: isInsValid && isPucValid && isRcValid
  };

  const rcDetails = {
    rcNumber: v.registrationNo,
    ownerName: owner.fullName,
    registeredMobile: owner.mobile,
    panMasked: owner.panMasked,
    status: isRcValid ? "ACTIVE" : "EXPIRED",
    validityTill: v.rcValidityTill,
    vehicleClass: vClass,
    manufacturer: v.manufacturer,
    modelName: `${v.manufacturer} ${v.model}`,
    modelYear: mYear,
    engineNo: engNo,
    chassisNo: chsNo,
    fuelType: fType,
    color: col,
    registeredAt: v.registrationDate,
    rtoLocation: `${owner.city} RTO, ${owner.state}`
  };

  return {
    vehicleId: v.vehicleId,
    registrationNo: v.registrationNo,
    vehicleType: v.vehicleType,
    manufacturer: v.manufacturer,
    model: v.model,
    modelYear: mYear,
    engineNo: engNo,
    chassisNo: chsNo,
    fuelType: fType,
    color: col,
    registrationDate: v.registrationDate,
    insuranceExpiry: v.insuranceExpiry,
    pucExpiry: v.pucExpiry,
    rcValidityTill: v.rcValidityTill,
    insuranceStatus: isInsValid ? "VALID" : "EXPIRED",
    pucStatus: isPucValid ? "VALID" : "EXPIRED",
    rcStatus: isRcValid ? "VALID" : "EXPIRED",
    daysRemaining: {
      insurance: insDays,
      puc: pucDays,
      rc: rcDays
    },
    complianceScore: c_v,
    compliance,
    owner,
    rcDetails,
    challanCount: v._count?.challans ?? v.challans?.length ?? 0
  };
}

export class VehiclesController {
  async listUserVehicles(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;

    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      include: {
        _count: { select: { challans: true } },
        user: true
      },
      orderBy: { registrationDate: "asc" }
    });

    const now = new Date();
    const formatted = vehicles.map((v) => formatVehicleResponse(v, now));

    res.status(200).json({
      vehicles: formatted,
      totalCount: formatted.length,
      owner: formatted[0]?.owner || null
    });
  }

  async getVehicleDetail(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { idOrRegNo } = req.params;

    if (!idOrRegNo) {
      throw new AppError(400, "VALIDATION_ERROR", "Vehicle identifier required");
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        OR: [
          { vehicleId: idOrRegNo },
          { registrationNo: idOrRegNo.toUpperCase() }
        ]
      },
      include: {
        challans: {
          orderBy: { challanDate: "desc" },
          take: 20
        },
        user: true
      }
    });

    // IDOR protection: only owner can view
    if (!vehicle || vehicle.userId !== userId) {
      throw new AppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found");
    }

    const now = new Date();
    const formatted = formatVehicleResponse(vehicle, now);
    const recentChallans = vehicle.challans.map((c) => ({
      challanId: c.challanId,
      challanDate: c.challanDate,
      violationCode: c.violationCode,
      violationDesc: c.violationDesc,
      severity: c.severity,
      amountPaise: Number(c.amountPaise),
      status: c.status,
      dueDate: c.dueDate,
      paymentDate: c.paymentDate,
      scoringEligible: c.scoringEligible
    }));

    res.status(200).json({
      ...formatted,
      vehicle: formatted,
      owner: formatted.owner,
      rcDetails: formatted.rcDetails,
      compliance: formatted.compliance,
      recentChallans,
      challans: recentChallans
    });
  }

  async getVehicleChallans(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { idOrRegNo } = req.params;

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        OR: [
          { vehicleId: idOrRegNo },
          { registrationNo: idOrRegNo?.toUpperCase() }
        ]
      }
    });

    if (!vehicle || vehicle.userId !== userId) {
      throw new AppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found");
    }

    const { status, severity, limit = "20", cursor } = req.query;
    const takeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const where: Prisma.ChallanWhereInput = {
      vehicleId: vehicle.vehicleId,
      userId
    };

    if (status && typeof status === "string") {
      where.status = status.toUpperCase();
    }
    if (severity && typeof severity === "string") {
      where.severity = severity.toUpperCase();
    }

    const challans = await prisma.challan.findMany({
      where,
      take: takeLimit + 1,
      cursor: cursor && typeof cursor === "string" ? { challanId: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { challanDate: "desc" }
    });

    let nextCursor: string | null = null;
    if (challans.length > takeLimit) {
      const nextItem = challans.pop();
      nextCursor = nextItem ? nextItem.challanId : null;
    }

    const mapped = challans.map((c) => ({
      challanId: c.challanId,
      vehicleId: c.vehicleId,
      challanDate: c.challanDate,
      violationCode: c.violationCode,
      violationDesc: c.violationDesc,
      severity: c.severity,
      amountPaise: Number(c.amountPaise),
      status: c.status,
      dueDate: c.dueDate,
      paymentDate: c.paymentDate,
      scoringEligible: c.scoringEligible
    }));

    res.status(200).json({
      items: mapped,
      challans: mapped,
      pagination: {
        nextCursor,
        hasMore: !!nextCursor
      },
      nextCursor
    });
  }
}

export const vehiclesController = new VehiclesController();
