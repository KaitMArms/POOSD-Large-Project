import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "./PageTitle";
import "../pages/UserProfile.css";
import "../pages/UserGames.css";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";


type PublicUser = {
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  role?: "user" | "dev" | string;
  userID?: number;
  createdAt?: string;
};

type PublicGame = {
  id: number;
  name?: string;
  coverUrl?: string | null;
  bannerUrl?: string | null;
  status?: string;
  userRating?: number;
  isLiked?: boolean;
  review?: string;
  [key: string]: any;
};

function resolveAvatarUrl(url?: string | null): string {
  if (!url || url.trim() === "") return "/Mascot.png";
  if (url.startsWith("/uploads")) return `${API_BASE}${url}`;
  return url;
}

function getCurrentUsernameFromToken(): string | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    const username = payload.username || payload.un;
    return typeof username === "string" ? username.toLowerCase() : null;
  } catch {
    return null;
  }
}

type GameModalProps = {
  game: PublicGame;
  username: string;
  onClose: () => void;
};

function ViewUserGameModal({ game, username, onClose }: GameModalProps) {
  const cover = game.bannerUrl || game.coverUrl || "/default-game.png";
  const rating =
    typeof game.userRating === "number" ? game.userRating.toFixed(1) : null;

  const likeText = game.isLiked
    ? `${username} likes ${game.name ?? "this game"}.`
    : `${username} doesn't like ${game.name ?? "this game"}.`;

  const ratingText = rating
    ? `${username} rated this a: ${rating}/10.`
    : `${username} hasn't rated this game yet.`;

  const statusDisplayMap: Record<string, string> = {
    "completed": "Completed",
    "in-progress": "In Progress",
    "on-hold": "Paused",
    "dropped": "Dropped",
    "to-play": "To Be Played",
  };

  const statusDisplay =
    game.status && statusDisplayMap[game.status]
      ? statusDisplayMap[game.status]
      : game.status || "Unknown";

  const statusText = `${username} has this marked as: ${statusDisplay}.`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>{game.name}</h3>

        {/* ⬇⬇ changed class here */}
        <img
          src={cover}
          alt={game.name ?? "Game cover"}
          className="modal-game-cover"
        />

        <p>{ratingText}</p>
        <p>{likeText}</p>
        <p>{statusText}</p>

        <button type="button" className="modal-submit" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}


function PublicUserProfilePage() {
  const { username: paramUsername } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<PublicUser | null>(null);
  const [games, setGames] = useState<PublicGame[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingGames, setLoadingGames] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<PublicGame | null>(null);

  useEffect(() => {
    const targetUsername = (paramUsername || "").toLowerCase();
    const currentUsername = getCurrentUsernameFromToken();

    // Block viewing your own profile via /user/:username
    if (targetUsername && currentUsername && targetUsername === currentUsername) {
      navigate("/profile", { replace: true });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view profiles.");
      setLoadingProfile(false);
      setLoadingGames(false);
      return;
    }

    if (!targetUsername) {
      setError("Invalid username.");
      setLoadingProfile(false);
      setLoadingGames(false);
      return;
    }

    // Fetch public profile
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const resp = await fetch(
          `${API_BASE}/api/user/${encodeURIComponent(
            targetUsername
          )}/public`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (resp.status === 403) {
          // Backend also blocks self: redirect to /profile
          navigate("/profile", { replace: true });
          return;
        }

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok) {
          setError(data.message || "Failed to load user profile.");
          setUser(null);
        } else {
          setUser(data.user || null);
        }
      } catch {
        setError("Error fetching user profile.");
        setUser(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    // Fetch public games
    const fetchGames = async () => {
      try {
        setLoadingGames(true);
        const resp = await fetch(
          `${API_BASE}/api/user/${encodeURIComponent(
            targetUsername
          )}/games`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (resp.status === 403) {
          navigate("/profile", { replace: true });
          return;
        }

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok) {
          setError(data.message || "Failed to load user games.");
          setGames([]);
        } else {
          const list = Array.isArray(data.games) ? data.games : [];
          setGames(list);
        }
      } catch {
        setError("Error fetching user games.");
        setGames([]);
      } finally {
        setLoadingGames(false);
      }
    };

    fetchProfile();
    fetchGames();
  }, [paramUsername, navigate]);

  const gamesByStatus = (status: string) => {
    const filtered = games.filter((g) => g.status === status);
    if (filtered.length === 0) {
      return <p className="empty-column-message">No games in this category.</p>;
    }

    return filtered.map((game) => (
      <div
        key={game.id}
        className="user-game-card"
        onClick={() => setSelectedGame(game)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === "Enter" && setSelectedGame(game)}
      >
        {game.isLiked && (
          <div className="liked-icon" aria-label="Liked game">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
            </svg>
          </div>
        )}

        <img
          src={game.coverUrl || "/default-game.png"}
          alt={game.name}
          className="user-game-cover"
        />
      </div>
    ));
  };

  const fullName =
    user && (user.firstName || user.lastName)
      ? `${user.firstName || ""}${
          user.lastName ? ` ${user.lastName}` : ""
        }`.trim()
      : null;

  const profileTitle = fullName
    ? `${fullName}'s Profile`
    : user?.username
    ? `${user.username}'s Profile`
    : "User Profile";

  const accountType =
    user?.role === "dev" ? "Developer" : user?.role ? "Player" : "Player";

  const displayUsername = user?.username || paramUsername || "User";

  return (
    <>
      <PageTitle />

      <main>
        {error && (
          <div style={{ color: "red", marginTop: "1em" }}>Error: {error}</div>
        )}

        {loadingProfile ? (
          <div style={{ marginTop: "2em" }}>Loading profile...</div>
        ) : !user ? (
          <div style={{ marginTop: "2em" }}>User not found.</div>
        ) : (
          <div className="user-container">
            <div className="pfp-container">
              <img
                alt={`${displayUsername}'s avatar`}
                src={resolveAvatarUrl(user.avatarUrl)}
              />
            </div>

            <div className="info-bio-wrapper">
              <div className="info-container">
                <span className="profile-name-span">{profileTitle}</span>

                <div className="info-item">
                  <strong>Username:</strong>{" "}
                  <span>{displayUsername || "N/A"}</span>
                </div>

                <div className="info-item">
                  <strong>Account Type:</strong>{" "}
                  <span>{accountType}</span>
                </div>
              </div>

              <div className="bio-side">
                <strong>Bio:</strong>
                <p>{user.bio || "This user hasn’t written a bio yet."}</p>
              </div>
            </div>
          </div>
        )}

        {/* Games section */}
        {!loadingProfile && user && (
          <section className="game-container">
            <h1 className="page-title">
              {displayUsername}'s Games List
            </h1>

            {loadingGames ? (
              <div>Loading games...</div>
            ) : (
              <div className="columns-wrapper">
                <div className="column">
                  <div className="column-title">Completed</div>
                  <div className="column-content">
                    {gamesByStatus("completed")}
                  </div>
                </div>

                <div className="column">
                  <div className="column-title">In Progress</div>
                  <div className="column-content">
                    {gamesByStatus("in-progress")}
                  </div>
                </div>

                <div className="column">
                  <div className="column-title">Paused</div>
                  <div className="column-content">
                    {gamesByStatus("on-hold")}
                  </div>
                </div>

                <div className="column">
                  <div className="column-title">Dropped</div>
                  <div className="column-content">
                    {gamesByStatus("dropped")}
                  </div>
                </div>

                <div className="column">
                  <div className="column-title">To Be Played</div>
                  <div className="column-content">
                    {gamesByStatus("to-play")}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {selectedGame && user && (
          <ViewUserGameModal
            game={selectedGame}
            username={displayUsername}
            onClose={() => setSelectedGame(null)}
          />
        )}
      </main>
    </>
  );
}

export default PublicUserProfilePage;
