import { useState, useEffect } from "react";
import EditUser from "../components/EditUser";

function LoadUser() {
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          setUser(data);
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

    fetchUserProfile();
  }, []);

  if (editing) {
    return <EditUser initial={user} onClose={() => setEditing(false)} />;
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
            src={user.avatarUrl || "/default-pfp.png"}
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
              <span>{user.isDev ? "Developer" : "Player"}</span>
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

        <button id="mode-toggle">Toggle Page's Color Mode</button>

        <div className="edit-profile-container">
          <button className="edit-profile-btn"onClick={() => setEditing(true)}> Edit Profile </button>
        </div>

        <label className="dev-check-container">
          <input type="checkbox" defaultChecked={user.isDev} />
          <span className="checkmark"></span>
          <span className="label-checkbox">Toggle Dev User</span>
        </label>
      </div>
    </div>
  );
}

export default LoadUser;