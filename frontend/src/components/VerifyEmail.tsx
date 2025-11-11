import { useState } from "react";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  async function verifyCode() {
    try {
      const response = await fetch("https://playedit.games:8080/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Email verified! Redirecting...");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setMessage(data.message || "❌ Invalid code");
      }
    } catch (err) {
      setMessage("⚠️ Server error — try again.");
    }
  }

  async function resendCode() {
    try {
      await fetch("https://playedit.games:8080/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      setMessage("📨 Code resent! Check email again.");
    } catch {
      setMessage("⚠️ Unable to resend — try later.");
    }
  }

  return (
    <div id="page-container">
      <div id="sign-up-container">
        <p id="inner-title">
          Email Verification Required
          <br />
          Check your email and enter the code below.
        </p>

        <input
          type="text"
          id="otpInput"
          placeholder="Verification Code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <input
          type="submit"
          className="buttons"
          value="Verify Email"
          onClick={verifyCode}
        />

        <button className="buttons resend-btn" onClick={resendCode}>
          Resend Code
        </button>

        <span id="verify-result">{message}</span>
      </div>
    </div>
  );
}