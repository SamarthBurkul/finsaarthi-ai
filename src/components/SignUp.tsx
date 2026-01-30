// src/components/SignUp.tsx
import React, { useState } from "react";
import { AuthPageProps, SignUpValues } from "../types/auth";
import { fintechColors as c } from "./fintechTheme";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SignUp: React.FC<AuthPageProps> = ({
  onEmailSignUp,
  onGoogleAuth,
  onNavigateTo,
}) => {
  const [values, setValues] = useState<SignUpValues>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange =
    (field: keyof SignUpValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      setError(null);
    };

  const validate = () => {
    if (
      !values.fullName.trim() ||
      !values.email.trim() ||
      !values.password.trim() ||
      !values.confirmPassword.trim()
    ) {
      return "All fields are required.";
    }
    if (values.fullName.trim().split(" ").length < 2) {
      return "Enter your full name (first and last).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      return "Enter a valid email address.";
    }
    if (values.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (!/[0-9]/.test(values.password) || !/[A-Za-z]/.test(values.password)) {
      return "Password must include letters and numbers.";
    }
    if (values.password !== values.confirmPassword) {
      return "Passwords do not match.";
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
      setError(null);

      console.log('📝 Attempting sign up to:', `${API_BASE_URL}/auth/signup`);

      // Call backend signup endpoint
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          password: values.password
        }),
      });

      const data = await res.json();
      console.log('📥 Sign up response:', data);

      if (!res.ok) {
        throw new Error(data.error || data.message || "Signup failed");
      }

      console.log("✅ User created successfully:", data.user);
      
      // Show success message briefly
      setError(null);
      
      // Redirect to SignIn page after successful signup
      setTimeout(() => {
        if (onNavigateTo) {
          onNavigateTo("signin");
        }
      }, 500);
      
    } catch (err: any) {
      console.error('❌ Sign up error:', err);
      setError(err.message || "Unable to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (!onGoogleAuth) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await onGoogleAuth();
    } catch (err: any) {
      console.error('❌ Google sign-up error:', err);
      setError(err?.message || "Google sign-up failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at top, #2e1065 0, #020617 55%, #000 100%)`,
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
          maxWidth: 460,
          background: `linear-gradient(145deg, ${c.card}, #020617)`,
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
                  "conic-gradient(from 160deg, #22c55e, #a855f7, #38bdf8, #22c55e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 24px rgba(34,197,94,0.7)",
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
              FinSaarthi
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
            Create your account
          </h1>
          <p
            style={{
              margin: "0.4rem 0 0",
              fontSize: 13,
              color: c.textSecondary,
            }}
          >
            Open a secure account to manage your finances with AI-powered insights.
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
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.6 : 1,
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
            {isSubmitting ? "Connecting..." : "Sign up with Google"}
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
            Or sign up with email
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
              htmlFor="fullName"
              style={{
                display: "block",
                fontSize: 12,
                marginBottom: 4,
                color: c.textSecondary,
              }}
            >
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={values.fullName}
              onChange={handleChange("fullName")}
              placeholder="John Doe"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem",
                borderRadius: 999,
                border: `1px solid ${c.border}`,
                background: c.inputBg,
                color: c.textPrimary,
                fontSize: 13,
                outline: "none",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            />
          </div>

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
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange("email")}
              placeholder="you@example.com"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem",
                borderRadius: 999,
                border: `1px solid ${c.border}`,
                background: c.inputBg,
                color: c.textPrimary,
                fontSize: 13,
                outline: "none",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            />
          </div>

          <div style={{ marginBottom: "0.9rem" }}>
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
              <span>Create password</span>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                disabled={isSubmitting}
                style={{
                  background: "transparent",
                  border: "none",
                  color: c.accent,
                  fontSize: 11,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  padding: 0,
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange("password")}
              placeholder="At least 8 characters"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem",
                borderRadius: 999,
                border: `1px solid ${c.border}`,
                background: c.inputBg,
                color: c.textPrimary,
                fontSize: 13,
                outline: "none",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            />
          </div>

          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 12,
                marginBottom: 4,
                color: c.textSecondary,
              }}
            >
              <span>Confirm password</span>
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                disabled={isSubmitting}
                style={{
                  background: "transparent",
                  border: "none",
                  color: c.accent,
                  fontSize: 11,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  padding: 0,
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </label>
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={handleChange("confirmPassword")}
              placeholder="Re-enter password"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem",
                borderRadius: 999,
                border: `1px solid ${c.border}`,
                background: c.inputBg,
                color: c.textPrimary,
                fontSize: 13,
                outline: "none",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            />
          </div>

          <div
            style={{
              marginBottom: "1.1rem",
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <input
              id="terms"
              type="checkbox"
              disabled={isSubmitting}
              style={{
                marginTop: 3,
                width: 12,
                height: 12,
                accentColor: c.accent,
              }}
            />
            <label
              htmlFor="terms"
              style={{
                fontSize: 11,
                color: c.textSecondary,
                lineHeight: 1.5,
              }}
            >
              I agree to the Terms and Privacy Policy
            </label>
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
                "linear-gradient(135deg, #22c55e, #7c3aed, #6366f1)",
              color: "#020617",
              fontSize: 14,
              fontWeight: 600,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              marginBottom: "0.85rem",
            }}
          >
            {isSubmitting ? "Creating account..." : "Create secure account"}
          </button>

          <p
            style={{
              fontSize: 11,
              color: c.textSecondary,
              textAlign: "center",
              margin: 0,
            }}
          >
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => onNavigateTo?.("signin")}
              disabled={isSubmitting}
              style={{
                color: "#c4b5fd",
                textDecoration: "none",
                fontWeight: 500,
                background: "transparent",
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                padding: 0,
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
