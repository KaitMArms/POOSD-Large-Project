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

  // password change state
  const [passwordChange, setPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // delete account state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

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
          currentPassword: oldPassword,
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

  const handleDeleteAccount = async (e: any) => {
    e.preventDefault();
    setDeleteError("");
    setDeleteSuccess("");

    if (!deletePassword) {
      setDeleteError("Please enter your current password.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to permanently delete your account? This cannot be undone."
      )
    ) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setDeleteError("You must be logged in.");
      return;
    }

    try {
      setDeleteLoading(true);
      const res = await fetch(`${API_BASE}/api/user/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: deletePassword,
          deleteAvatar: true,
        }),
      });

      const data = await res.json().catch(() => ({}));
      setDeleteLoading(false);

      if (!res.ok) {
        setDeleteError(data.message || "Failed to delete account.");
        return;
      }

      setDeleteSuccess("Account deleted. Redirecting...");
      localStorage.removeItem("token");
      // redirect to landing page (which shows login)
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch {
      setDeleteLoading(false);
      setDeleteError("An error occurred while deleting your account.");
    }
  };

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
            Change Password
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
                <button
                  type="button"
                  className="password-cancel-btn"
                  onClick={() => {
                    setPasswordChange(false);
                    setPasswordError("");
                    setPasswordSuccess("");
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Cancel
                </button>

                <button className="password-submit-btn" type="submit">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Delete account section */}
        <div className="delete-account-toggle-container">
          <button
            className="delete-account-toggle-btn"
            onClick={() => {
              setDeleteOpen(true);
              setDeleteError("");
              setDeleteSuccess("");
            }}
          >
            Delete Account
          </button>
        </div>

        {deleteOpen && (
          <div className="delete-account-container">
            <span className="delete-title">Delete Your Account</span>
            <p className="delete-warning">
              This will permanently remove your account and associated data. This
              action cannot be undone.
            </p>

            {deleteError && (
              <div className="delete-error">{deleteError}</div>
            )}

            {deleteSuccess && (
              <div className="delete-success">{deleteSuccess}</div>
            )}

            <form className="delete-form" onSubmit={handleDeleteAccount}>
              <label className="delete-label">Current Password</label>
              <input
                type="password"
                className="delete-input"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter current password"
              />

              <div className="delete-btn-row">
                <button
                  type="button"
                  className="delete-cancel-btn"
                  onClick={() => {
                    setDeleteOpen(false);
                    setDeletePassword("");
                    setDeleteError("");
                    setDeleteSuccess("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="delete-submit-btn"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete Account"}
                </button>
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
              updateDevSetting(next); // sync with backend
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
