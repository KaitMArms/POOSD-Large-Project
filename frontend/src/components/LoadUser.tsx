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

  const { mode, toggleMode } = useColorMode();

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("https://playedit.games/api/user/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched user data:", data);
        setUser(data.user); // profile endpoint returns { success, user }
        setIsDevUser(data.user?.isDev || false);
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
  if (error) return <div>Error: {error}</div>;
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

            {user.role && (
              <div className="info-item">
                <strong>Role:</strong> <span>{user.role}</span>
              </div>
            )}
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

        <label className="dev-check-container">
          <input
            type="checkbox"
            checked={isDevUser}
            onChange={(e) => setIsDevUser(e.target.checked)}
          />
          <span className="checkmark"></span>
          <span className="label-checkbox">Toggle Dev User</span>
        </label>
      </div>

      <LoadDevUser event={isDevUser} />
    </div>
  );
}

export default LoadUser;
