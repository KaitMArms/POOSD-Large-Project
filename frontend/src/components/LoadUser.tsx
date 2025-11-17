import { useState, useEffect } from "react";
import EditUser from "../components/EditUser";
import LoadDevUser from "../components/LoadDevUser";
import { useColorMode } from "../components/ColorMode";

// same base + resolver as in EditUser
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

function resolveAvatarUrl(url?: string | null): string {
  if (!url || url.trim() === "") return "/Mascot.png";
  if (url.startsWith("/uploads")) return `${API_BASE}${url}`;
  return url;
}

function LoadUser() {
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDevUser, setIsDevUser] = useState(false);
  const [passwordChange, setPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [fpOpen, setFpOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpMessage, setFpMessage] = useState("");
  const [fpCooldown, setFpCooldown] = useState(0);
  const [fpVerifying, setFpVerifying] = useState(false);

  const { mode, toggleMode } = useColorMode();

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/user/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched user data:", data);
        // profile endpoint returns { success, user }
        const u = data.user || data;
        setUser(u);
        // 🔹 derive dev status from role
        setIsDevUser(u.role === "dev");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Failed to fetch user profile.");
      }
    } catch {
      setError("An error occurred while fetching the user profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: any) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setPasswordError("You must be logged in.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/user/change-password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.message || "Password update failed.");
        return;
      }

      setPasswordSuccess("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError("An error occurred while updating password.");
    }
  };

async function sendForgotEmail() {
  try {
    const res = await fetch("https://playedit.games/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fpEmail })
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setFpMessage("Check your email for the 6-digit code.");
      setFpCooldown(30);

      const t = setInterval(() => {
        setFpCooldown((c) => {
          if (c <= 1) { clearInterval(t); return 0; }
          return c - 1;
        });
      }, 1000);
    } else {
      setFpMessage(data.message || "Unable to send email.");
    }
  } catch {
    setFpMessage("Server error — try again later.");
  }
}

async function verifyForgotCode() {
  if (!fpEmail || fpOtp.trim().length < 6) return;

  setFpVerifying(true);
  try {
    const res = await fetch("https://playedit.games/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fpEmail, code: fpOtp.trim() })
    });

    const data = await res.json().catch(() => ({}));
    setFpVerifying(false);

    if (res.ok) {
      setOldPassword(fpOtp.trim());
      setFpOpen(false);
      setFpMessage("");
      setFpOtp("");
      setPasswordChange(true);
    } else {
      setFpMessage(data.message || "Invalid code.");
    }
  } catch {
    setFpVerifying(false);
    setFpMessage("Server error — try again.");
  }
}

  // 🔹 call /api/user/settings to update role
  const updateDevSetting = async (nextIsDev: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/user/settings`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDev: nextIsDev }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.message || data.error || "Failed to update settings.";
        throw new Error(msg);
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // backend echoes current dev status + theme
      const serverIsDev = !!data.settings?.isDev;
      setIsDevUser(serverIsDev);
      setUser((prev: any) =>
        prev ? { ...prev, role: serverIsDev ? "dev" : "user" } : prev
      );
    } catch (err: any) {
      setError(err?.message || "Error updating dev setting.");
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (editing && user) {
    return (
      <EditUser
        initial={user}
        onClose={() => {
          setEditing(false);
          // ⬅️ re-fetch to refresh main profile view
          fetchUserProfile();
        }}
      />
    );
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!user) return <div>No user data found.</div>;

  const userEmail = user.eMail || user.email || "N/A";

  return (
    <div>
      <div className="user-container">
        <div className="pfp-container">
          <img
            alt={`${user.username || "User"}'s avatar`}
            src={resolveAvatarUrl(user.avatarUrl)}
          />
        </div>
        <div className="info-bio-wrapper">
          <div className="info-container">
            <span className="profile-name-span">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}'s Profile`
                : `${user.username || "User"}'s Profile`}
            </span>

            <div className="info-item">
              <strong>Username:</strong> <span>{user.username || "N/A"}</span>
            </div>

            <div className="info-item">
              <strong>Email:</strong> <span>{userEmail}</span>
            </div>

            <div className="info-item">
              <strong>Account Type:</strong>{" "}
              <span>{isDevUser ? "Developer" : "Player"}</span>
            </div>
          </div>

          <div className="bio-side">
            <strong>Bio:</strong>
            <p>{user.bio || "This user hasn’t written a bio yet."}</p>
          </div>
        </div>
      </div>

      <div className="settings-container">
        <span className="settings-title">Settings</span>

        <button id="mode-toggle" onClick={toggleMode}>
          Toggle to {mode === "light" ? "Dark" : "Light"} Mode
        </button>

        <div className="edit-profile-container">
          <button
            className="edit-profile-btn"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        </div>

        <div className="password-change-container">
          <button
            className="password-change-btn"
            onClick={() => setPasswordChange(true)}
          >
            Change / Reset Password
          </button>
        </div>

        {passwordChange && (
        <div className="password-form-container">
          <span className="password-title">Change Your Password</span>

          {passwordError && (
            <div className="password-error">{passwordError}</div>
          )}

          {passwordSuccess && (
            <div className="password-success">{passwordSuccess}</div>
          )}

          <form className="password-form" onSubmit={handlePasswordChange}>
            <label className="password-label">Current Password</label>
            <input
              type="password"
              className="password-input"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
            />

            <label className="password-label">New Password</label>
            <input
              type="password"
              className="password-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />

            <label className="password-label">Confirm New Password</label>
            <input
              type="password"
              className="password-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />

            <div className="password-btn-row">
              <button className="password-submit-btn" type="submit">
                Update Password
              </button>

              <button
                type="button"
                className="password-cancel-btn"
                onClick={() => setPasswordChange(false)}
              >
                Cancel
              </button>
              <div className="forgot-password-container">
              <br />
              <button
                className="password-forgot-btn"
                onClick={() => setFpOpen(true)}
              >
                Forgot Password?
              </button>
              {fpOpen && (
              <div className="modal-overlay">
                <div className="modal-card">
                  <h3>Reset your password</h3>

                  <p>Enter the email linked to your account.</p>

                  {fpMessage && <div className="alert">{fpMessage}</div>}

                  <input
                    type="email"
                    placeholder="Email"
                    value={fpEmail}
                    onChange={(e) => setFpEmail(e.target.value)}
                  />

                  <button
                    className="buttons"
                    disabled={fpCooldown > 0}
                    onClick={sendForgotEmail}
                  >
                    {fpCooldown > 0 ? `Resend in ${fpCooldown}s` : "Send code"}
                  </button>

                  <br /><br />

                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={fpOtp}
                    onChange={(e) => setFpOtp(e.target.value)}
                    maxLength={6}
                    inputMode="numeric"
                  />

                  <div className="modal-actions">
                    <button
                      className="buttons"
                      onClick={verifyForgotCode}
                      disabled={fpVerifying || fpOtp.trim().length < 6}
                    >
                      {fpVerifying ? "Verifying..." : "Verify"}
                    </button>

                    <button
                      className="buttons outline"
                      onClick={() => {
                        setFpOpen(false);
                        setFpMessage("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
            </div>
          </form>
        </div>
      )}

        <label className="dev-check-container">
          <input
            type="checkbox"
            checked={isDevUser}
            onChange={(e) => {
              const next = e.target.checked;
              updateDevSetting(next);   // sync with backend
            }}
          />
          <span className="checkmark"></span>
          <span className="label-checkbox">Toggle Dev User</span>
        </label>
      </div>

      {/* 🔹 Dev view only renders when backend says you're dev */}
      <LoadDevUser event={isDevUser} />
    </div>
    
  );
}

export default LoadUser;
