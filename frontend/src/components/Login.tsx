import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [verifying, setVerifying] = useState(false);

  // lock background scroll when modal open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = verifyOpen ? "hidden" : original || "";
    return () => { document.body.style.overflow = original || ""; };
  }, [verifyOpen]);

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function doLogin(event: any): Promise<void> {
    event.preventDefault();
    const email = ((document.getElementById("loginEmail") as HTMLInputElement) || { value: "" }).value.trim().toLowerCase();
    const password = ((document.getElementById("loginPassword") as HTMLInputElement) || { value: "" }).value;

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
      const response = await fetch('https://playedit.games/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        if (data?.token) localStorage.setItem("token", data.token);
        window.location.href = "/profile";
      } else if (response.status === 403 && data?.code === "EMAIL_UNVERIFIED") {
        setVerifyEmail(data.email || email);
        setMessage("");
        setVerifyOpen(true);

        if (typeof data.resendWaitSec === "number" && data.resendWaitSec > 0) {
          setCooldown(data.resendWaitSec);
          const t = setInterval(() => {
            setCooldown((c) => {
              if (c <= 1) { clearInterval(t); return 0; }
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
      const response = await fetch("https://playedit.games/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail, code: otp.trim() })
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
      const response = await fetch("https://playedit.games/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Code resent. Check your email.");
        setCooldown(30);
        const t = setInterval(() => {
          setCooldown((c) => {
            if (c <= 1) { clearInterval(t); return 0; }
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

  return (
    <div id="page-container">
      <div>
        <img src="/Mascot.png" alt="Controllie - PlayedIt's Mascot, he's a living breathing controller" />
      </div>
      <br />
      <div id="login-container">
        <span id="inner-title">Welcome Back to PlayedIt!</span><br />
        <input type="email" id="loginEmail" placeholder="Email" onInput={clearMsgOnInput} /><br />
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
        <input
          type="submit"
          id="loginButton"
          className="buttons"
          value="Log In"
          onClick={doLogin}
        />
        {/* Inline login error (non-OTP) below the button */}
        {!verifyOpen && message && (
          <div className="inline-error">{message}</div>
        )}

        <span id="login-result"></span>
        <p className="signup-link">New to PlayedIt? <br /><Link to="/signup">Sign Up</Link></p>
      </div>

      {/* Centered OTP modal (unchanged layout) */}
      {verifyOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Email verification">
          <div className="modal-card" role="document">
            <h3>Verify your email</h3>
            <p>We sent a 6-digit code to <b>{verifyEmail}</b>.</p>

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
              <button className="buttons" onClick={verifyCode} disabled={verifying || otp.trim().length < 6}>
                {verifying ? "Verifying..." : "Verify"}
              </button>

              <button className="buttons" onClick={resendCode} disabled={cooldown > 0}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>

              <button className="buttons outline" onClick={() => setVerifyOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
