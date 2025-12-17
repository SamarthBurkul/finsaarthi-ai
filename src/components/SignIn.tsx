// src/pages/SignIn.tsx
import React, { useState } from "react";
import { AuthPageProps, SignInValues } from "../types/auth";
// ✅ file is in the same folder (components)
import { fintechColors as c } from "./fintechTheme";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
  
const API_URL = import.meta.env.VITE_BACKEND_URL;



const SignIn: React.FC<AuthPageProps> = ({
  onEmailSignIn,
  onGoogleAuth,
  onNavigateTo,
}) => {
  const [values, setValues] = useState<SignInValues>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange =
    (field: keyof SignInValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      setError(null);
    };

  const validate = () => {
    if (!values.email.trim() || !values.password.trim()) {
      return "Email and password are required.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      return "Enter a valid email address.";
    }
    if (values.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      // 🔥 BACKEND CALL (MongoDB authentication)
      const res = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password
        }),
      });

      const data = await res.json();
      localStorage.setItem("token", data.token);

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      // ✅ Save JWT token
      localStorage.setItem("authToken", data.token);
      
      console.log("User signed in:", data.user);

      // ✅ Call onEmailSignIn to set isAuthenticated in App.tsx
      if (onEmailSignIn) {
        await onEmailSignIn(values);
      }
    } catch (err: any) {
      setError(err?.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (!onGoogleAuth) return;
    try {
      setIsSubmitting(true);
      await onGoogleAuth();
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at top, ${c.accentSoft} 0, ${c.bg} 55%, #000 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        color: c.textPrimary,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: `linear-gradient(145deg, ${c.card}, #050309)`,
          borderRadius: "1.5rem",
          padding: "2.25rem 2rem",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(124,58,237,0.35)",
          border: `1px solid ${c.border}`,
        }}
      >
        {/* Brand / heading */}
        <div style={{ marginBottom: "1.75rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background:
                  "conic-gradient(from 160deg, #a855f7, #22d3ee, #4ade80, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 24px rgba(168,85,247,0.8)",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#020617",
                }}
              >
                F
              </span>
            </div>
            <span
              style={{
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: 11,
                color: c.textSecondary,
              }}
            >
              Fintech Secure
            </span>
          </div>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              margin: "0.4rem 0 0",
              fontSize: 13,
              color: c.textSecondary,
            }}
          >
            Sign in to monitor real‑time balances, trades, and risk exposure.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 0.85rem",
              borderRadius: 10,
              background: "rgba(127,29,29,0.55)",
              color: "#fee2e2",
              fontSize: 12,
              border: "1px solid rgba(254,202,202,0.35)",
            }}
          >
            {error}
          </div>
        )}

        {/* Google auth */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isSubmitting}
          style={{
            width: "100%",
            borderRadius: 999,
            padding: "0.6rem 0.9rem",
            border: "1px solid rgba(148,163,184,0.6)",
            background: "#020617",
            color: c.textPrimary,
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background:
                "conic-gradient(from 45deg, #ea4335, #fbbc05, #34a853, #4285f4, #ea4335)",
            }}
          />
          <span>
            {isSubmitting ? "Connecting..." : "Sign in with Google"}
          </span>
        </button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "0.75rem 0 1rem",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: "rgba(148,163,184,0.25)",
            }}
          />
          <span
            style={{
              padding: "0 0.75rem",
              fontSize: 11,
              color: c.textSecondary,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
            }}
          >
            Or continue with email
          </span>
          <div
            style={{
              flex: 1,
              height: 1,
              background: "rgba(148,163,184,0.25)",
            }}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: "0.9rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: 12,
                marginBottom: 4,
                color: c.textSecondary,
              }}
            >
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange("email")}
              placeholder="you@company.com"
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem",
                borderRadius: 999,
                border: `1px solid ${c.border}`,
                background: c.inputBg,
                color: c.textPrimary,
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "0.35rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 12,
                marginBottom: 4,
                color: c.textSecondary,
              }}
            >
              <span>Password</span>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: c.accent,
                  fontSize: 11,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange("password")}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem",
                borderRadius: 999,
                border: `1px solid ${c.border}`,
                background: c.inputBg,
                color: c.textPrimary,
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.1rem",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                color: c.textSecondary,
              }}
            >
              <input
                type="checkbox"
                style={{
                  accentColor: c.accent,
                  width: 12,
                  height: 12,
                }}
              />
              Keep me signed in on this device
            </label>
            <button
              type="button"
              style={{
                background: "transparent",
                border: "none",
                color: "#a855f7",
                fontSize: 11,
                cursor: "pointer",
                padding: 0,
              }}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "0.65rem 0.9rem",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #7c3aed, #4f46e5, #22c55e)",
              color: "#020617",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: "0.85rem",
            }}
          >
            {isSubmitting ? "Securing session..." : "Sign in to dashboard"}
          </button>

          <p
            style={{
              fontSize: 11,
              color: c.textSecondary,
              textAlign: "center",
              margin: 0,
            }}
          >
            New to Fintech Secure?{" "}
            <button
              type="button"
              onClick={() => onNavigateTo?.("signup")}
              style={{
                color: "#c4b5fd",
                textDecoration: "none",
                fontWeight: 500,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Create an account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignIn;