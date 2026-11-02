import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "./sessionStore";

export const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const accessToken = useSessionStore((s) => s.accessToken);

  useEffect(() => {
    if (accessToken) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [accessToken, navigate]);

  return null;
};
