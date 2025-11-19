import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

type ForgotStage = "email" | "verify" | "reset";

const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:8080"
    : "https://playedit.games";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [verifying, setVerifying] = useState(false);

  // Forgot password flow
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStage, setForgotStage] = useState<ForgotStage>("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  // lock background scroll when any modal is open
  useEffect(() => {
    const original = document.body.style.overflow;
    const locked = verifyOpen || forgotOpen;
    document.body.style.overflow = locked ? "hidden" : original || "";
    return () => {
      document.body.style.overflow = original || "";
    };
  }, [verifyOpen, forgotOpen]);

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function doLogin(event: any): Promise<void> {
    event.preventDefault();
    const email = (
      (document.getElementById("loginEmail") as HTMLInputElement) || {
        value: "",
      }
    ).value
      .trim()
      .toLowerCase();
    const password = (
      (document.getElementById("loginPassword") as HTMLInputElement) || {
        value: "",
      }
    ).value;

    // minimal client-side check
    if (!emailRe.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setMessage("Password is required.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data?.token) localStorage.setItem("token", data.token);
        window.location.href = "/profile";
      } else if (response.status === 403 && data?.code === "EMAIL_UNVERIFIED") {
        setVerifyEmail(data.email || email);
        setMessage("");
        setVerifyOpen(true);

        if (
          typeof data.resendWaitSec === "number" &&
          data.resendWaitSec > 0
        ) {
          setCooldown(data.resendWaitSec);
          const t = setInterval(() => {
            setCooldown((c) => {
              if (c <= 1) {
                clearInterval(t);
                return 0;
              }
              return c - 1;
            });
          }, 1000);
        }
      } else {
        setMessage(data?.message || "Invalid credentials");
      }
    } catch {
      setMessage("Server error — try again later.");
    }
  }

  async function verifyCode() {
    if (!verifyEmail || otp.trim().length < 6) return;
    setVerifying(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail, code: otp.trim() }),
      });
      const data = await response.json();
      setVerifying(false);

      if (response.ok) {
        if (data?.token) localStorage.setItem("token", data.token);
        setVerifyOpen(false);
        window.location.href = "/profile";
      } else {
        setMessage(data.message || "Invalid code");
      }
    } catch {
      setVerifying(false);
      setMessage("Server error — try again.");
    }
  }

  async function resendCode() {
    if (!verifyEmail || cooldown > 0) return;
    try {
      const response = await fetch(`${API_BASE}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Code resent. Check your email.");
        setCooldown(30);
        const t = setInterval(() => {
          setCooldown((c) => {
            if (c <= 1) {
              clearInterval(t);
              return 0;
            }
            return c - 1;
          });
        }, 1000);
      } else {
        setMessage(data.message || "Unable to resend right now.");
      }
    } catch {
      setMessage("Server error — try again.");
    }
  }

  // clear inline message as user types (no layout changes)
  function clearMsgOnInput() {
    if (message) setMessage("");
  }

  // =========================
  // Forgot password handlers
  // =========================

  function openForgotModal() {
    setForgotStage("email");
    setForgotEmail("");
    setForgotCode("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setResetToken("");
    setMessage("");
    setForgotOpen(true);
  }

  function closeForgotModal() {
    setForgotOpen(false);
    setForgotStage("email");
    setForgotEmail("");
    setForgotCode("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setResetToken("");
  }

  async function handleForgotEmailSubmit() {
    if (!emailRe.test(forgotEmail.trim().toLowerCase())) {
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      setForgotLoading(true);
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      const data = await response.json();
      setForgotLoading(false);

      if (response.ok) {
        setMessage("If this email is registered, a code has been sent.");
        setForgotStage("verify");
      } else {
        setMessage(data?.message || "Unable to start password reset.");
      }
    } catch {
      setForgotLoading(false);
      setMessage("Server error — try again.");
    }
  }

  async function handleForgotVerifyCode() {
    if (!forgotEmail || forgotCode.trim().length < 6) {
      setMessage("Please enter the 6-digit code.");
      return;
    }

    try {
      setForgotLoading(true);
      const response = await fetch(
        `${API_BASE}/api/auth/forgot-password/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: forgotEmail.trim().toLowerCase(),
            code: forgotCode.trim(),
          }),
        }
      );
      const data = await response.json();
      setForgotLoading(false);

      if (response.ok && data?.resetToken) {
        setResetToken(data.resetToken);
        setMessage("");
        setForgotStage("reset");
      } else {
        setMessage(data?.message || "Invalid or expired code.");
      }
    } catch {
      setForgotLoading(false);
      setMessage("Server error — try again.");
    }
  }

  async function handleForgotResetPassword() {
    if (!resetToken) {
      setMessage("Reset session expired. Please start again.");
      setForgotStage("email");
      return;
    }

    if (!forgotNewPassword || !forgotConfirmPassword) {
      setMessage("Please fill out both password fields.");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setForgotLoading(true);
      const response = await fetch(
        `${API_BASE}/api/auth/forgot-password/reset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resetToken,
            newPassword: forgotNewPassword,
          }),
        }
      );
      const data = await response.json();
      setForgotLoading(false);

      if (response.ok) {
        if (data?.token) {
          localStorage.setItem("token", data.token);
          closeForgotModal();
          window.location.href = "/profile";
          return;
        }

        closeForgotModal();
        setMessage("Password updated. Please log in with your new password.");
      } else {
        setMessage(data?.message || "Unable to reset password.");
      }
    } catch {
      setForgotLoading(false);
      setMessage("Server error — try again.");
    }
  }

  return (
    <div id="page-container">
      <div>
        <img
          className="login-mascot"
          src="/Mascot.png"
          alt="Controllie - PlayedIt's Mascot, he's a living breathing controller"
        />
      </div>
      <br />
      <div id="login-container">
        <span id="inner-title">Welcome Back to PlayedIt!</span>
        <br />
        <input
          type="email"
          id="loginEmail"
          placeholder="Email"
          onInput={clearMsgOnInput}
        />
        <br />
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            id="loginPassword"
            placeholder="Password"
            className="login-input"
            onInput={clearMsgOnInput}
          />
          <button
            type="button"
            className="toggle-eye"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>

        {/* Login button + Forgot password link row */}
        <div className="login-actions">
          <input
            type="submit"
            id="loginButton"
            className="buttons"
            value="Log In"
            onClick={doLogin}
          />
          <button
            type="button"
            className="forgot-link"
            onClick={openForgotModal}
          >
            Forgot password?
          </button>
        </div>

        {/* Inline login error (non-OTP) below the button */}
        {!verifyOpen && !forgotOpen && message && (
          <div className="inline-error">{message}</div>
        )}

        <span id="login-result"></span>
        <p className="signup-link">
          New to PlayedIt? <br />
          <Link to="/signup">Sign Up</Link>
        </p>
      </div>

      {/* Centered OTP modal for email verification */}
      {verifyOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Email verification"
        >
          <div className="modal-card" role="document">
            <h3>Verify your email</h3>
            <p>
              We sent a 6-digit code to <b>{verifyEmail}</b>.
            </p>

            {/* message area inside modal */}
            {message && <div className="alert">{message}</div>}

            <input
              type="text"
              placeholder="Enter code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              inputMode="numeric"
              autoFocus
            />

            <div className="modal-actions">
              <button
                className="buttons"
                onClick={verifyCode}
                disabled={verifying || otp.trim().length < 6}
              >
                {verifying ? "Verifying..." : "Verify"}
              </button>

              <button
                className="buttons"
                onClick={resendCode}
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>

              <button
                className="buttons outline"
                onClick={() => setVerifyOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password modal */}
      {forgotOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Forgot password"
        >
          <div className="modal-card" role="document">
            {forgotStage === "email" && (
              <>
                <h3>Forgot your password?</h3>
                <p>
                  Enter the email associated with your account. We'll send a
                  6-digit code.
                </p>

                {message && <div className="alert">{message}</div>}

                <input
                  type="email"
                  placeholder="Email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  autoFocus
                />

                <div className="modal-actions">
                  <button
                    className="buttons"
                    onClick={handleForgotEmailSubmit}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? "Sending..." : "Send code"}
                  </button>
                  <button className="buttons outline" onClick={closeForgotModal}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {forgotStage === "verify" && (
              <>
                <h3>Check your email</h3>
                <p>
                  Enter the 6-digit code sent to <b>{forgotEmail}</b>.
                </p>

                {message && <div className="alert">{message}</div>}

                <input
                  type="text"
                  placeholder="6-digit code"
                  value={forgotCode}
                  onChange={(e) => setForgotCode(e.target.value)}
                  maxLength={6}
                  inputMode="numeric"
                  autoFocus
                />

                <div className="modal-actions">
                  <button
                    className="buttons"
                    onClick={handleForgotVerifyCode}
                    disabled={forgotLoading || forgotCode.trim().length < 6}
                  >
                    {forgotLoading ? "Verifying..." : "Verify code"}
                  </button>
                  <button className="buttons outline" onClick={closeForgotModal}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {forgotStage === "reset" && (
              <>
                <h3>Set a new password</h3>
                <p>Enter and confirm your new password.</p>

                {message && <div className="alert">{message}</div>}

                <input
                  type="password"
                  placeholder="New password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  autoFocus
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={forgotConfirmPassword}
                  onChange={(e) =>
                    setForgotConfirmPassword(e.target.value)
                  }
                />

                <div className="modal-actions">
                  <button
                    className="buttons"
                    onClick={handleForgotResetPassword}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? "Saving..." : "Reset password"}
                  </button>
                  <button className="buttons outline" onClick={closeForgotModal}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
