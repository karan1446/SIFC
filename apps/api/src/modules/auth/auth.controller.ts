import type { Request, Response } from "express";
import { otpService } from "./otp.service.js";
import { tokenService } from "./token.service.js";
import { AppError } from "@vai/shared";
import { getEnv } from "../../config/env.js";

import crypto from "node:crypto";
import { prisma } from "../../db/client.js";
import { encryptPan, hashPan } from "../../lib/crypto.js";
import { maskPan } from "@vai/shared";

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const { mobile, pan } = req.body;
    if (!mobile || !pan) {
      throw new AppError(400, "VALIDATION_ERROR", "mobile and pan are required fields");
    }

    const cleanMobile = mobile.replace(/[\s\-\(\)]/g, "");
    const e164Mobile = cleanMobile.startsWith("+")
      ? cleanMobile
      : `+91${cleanMobile.replace(/^0+/, "")}`;
    const cleanPan = pan.trim().toUpperCase();

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!panRegex.test(cleanPan)) {
      throw new AppError(400, "INVALID_PAN", "Please enter a valid 10-character PAN (e.g. DUMMY1001X)");
    }

    const panH = hashPan(cleanPan);
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { mobileE164: e164Mobile },
          { panHash: panH }
        ]
      }
    });

    if (!user) {
      const dummyId = `U${crypto.randomInt(100, 999)}`;
      user = await prisma.user.create({
        data: {
          userId: dummyId,
          fullName: "Citizen Driver",
          mobileE164: e164Mobile,
          panEncrypted: encryptPan(cleanPan),
          panHash: panH,
          panMasked: maskPan(cleanPan),
          city: "New Delhi",
          state: "Delhi",
          registrationDate: new Date(),
          status: "ACTIVE",
          isDummy: true
        }
      });

      await prisma.vaiScore.create({
        data: {
          userId: dummyId,
          score: 700,
          category: "GOOD",
          scoreBeforeCap: 700,
          scoringConfigVersion: 1,
          computedAt: new Date()
        }
      });
    }

    let vehicleCount = await prisma.vehicle.count({
      where: { userId: user.userId }
    });

    if (vehicleCount === 0) {
      const isCar = Math.random() > 0.5;
      const regSuffix = Math.floor(1000 + Math.random() * 9000);
      const regNo = `DL01AB${regSuffix}`;

      await prisma.vehicle.create({
        data: {
          vehicleId: `VEH-${user.userId}-01`,
          userId: user.userId,
          registrationNo: regNo,
          vehicleType: isCar ? "FOUR_WHEELER" : "TWO_WHEELER",
          manufacturer: isCar ? "Maruti Suzuki" : "Hero",
          model: isCar ? "Swift (2015 model)" : "CD Deluxe (2012 model)",
          modelYear: isCar ? 2015 : 2012,
          engineNo: isCar ? `K12MN${regSuffix}` : `CD100${regSuffix}`,
          chassisNo: isCar ? `MA3FJEB1S${regSuffix}` : `MBLHA10EYK${regSuffix}`,
          fuelType: "PETROL",
          color: isCar ? "Silky Silver" : "Black & Red",
          registrationDate: new Date(isCar ? "2015-06-15T00:00:00.000Z" : "2012-04-10T00:00:00.000Z"),
          insuranceExpiry: new Date("2027-12-31T00:00:00.000Z"),
          pucExpiry: new Date("2027-12-31T00:00:00.000Z"),
          rcValidityTill: new Date("2035-12-31T00:00:00.000Z")
        }
      });
      vehicleCount = 1;
    }

    const tokenPair = tokenService.issueTokenPair(user.userId, "CITIZEN");

    res.cookie("vai_refresh_token", tokenPair.refreshToken, {
      httpOnly: true,
      secure: getEnv().NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 86_400_000 // 7 days
    });

    res.status(200).json({
      accessToken: tokenPair.accessToken,
      expiresIn: tokenPair.expiresIn,
      user: {
        userId: user.userId,
        fullName: user.fullName,
        panMasked: user.panMasked,
        vehicleCount
      }
    });
  }
  async requestOtp(req: Request, res: Response): Promise<void> {
    const { mobile, pan } = req.body;
    if (!mobile || !pan) {
      throw new AppError(400, "VALIDATION_ERROR", "mobile and pan are required fields");
    }

    const result = await otpService.requestOtp(mobile, pan);

    if (result.simulatedOtp) {
      res.setHeader("X-Simulated-OTP", result.simulatedOtp);
    }

    res.status(200).json({
      sessionId: result.sessionId,
      expiresIn: result.expiresIn,
      cooldownSeconds: result.cooldownSeconds,
      ...(result.simulatedOtp && { simulatedOtp: result.simulatedOtp })
    });
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    const { sessionId, otp } = req.body;
    if (!sessionId || !otp) {
      throw new AppError(400, "VALIDATION_ERROR", "sessionId and otp are required fields");
    }

    const result = await otpService.verifyOtp(sessionId, otp);

    // Set refresh token in HttpOnly Strict cookie (TRD 8.3)
    res.cookie("vai_refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: getEnv().NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 86_400_000 // 7 days
    });

    res.status(200).json({
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      user: result.user
    });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const rawToken = req.cookies?.vai_refresh_token ?? req.body?.refreshToken;
    if (!rawToken) {
      throw new AppError(401, "UNAUTHORIZED", "Missing refresh token. Please log in again.");
    }

    const rotated = tokenService.rotateRefreshToken(rawToken);

    res.cookie("vai_refresh_token", rotated.refreshToken, {
      httpOnly: true,
      secure: getEnv().NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 86_400_000
    });

    res.status(200).json({
      accessToken: rotated.accessToken,
      expiresIn: rotated.expiresIn
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    const rawToken = req.cookies?.vai_refresh_token ?? req.body?.refreshToken;
    if (rawToken) {
      tokenService.revokeByRawToken(rawToken);
    }

    res.clearCookie("vai_refresh_token", {
      httpOnly: true,
      secure: getEnv().NODE_ENV === "production",
      sameSite: "strict"
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  }
}

export const authController = new AuthController();
