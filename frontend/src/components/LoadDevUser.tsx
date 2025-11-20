import {
  useState,
  useEffect,
  type FormEvent,
  type ChangeEvent,
} from "react";
import "../pages/DevUserProfile.css";
import AddDevGame from "../components/AddDevGame";

type LoadDevUserProps = {
  event: boolean;
};

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

function formatUnixTimestamp(unixTimestamp?: number): string {
  if (!unixTimestamp) return "Unknown";
  const date = new Date(unixTimestamp * 1000);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

// Convert unix seconds → yyyy-MM-dd string for <input type="date">
function unixToDateInput(unix?: number): string {
  if (!unix) return "";
  const d = new Date(unix * 1000);
  return d.toISOString().slice(0, 10);
}

// Convert yyyy-MM-dd → unix seconds (or undefined if empty)
function dateInputToUnix(value: string): number | undefined {
  if (!value) return undefined;
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return undefined;
  return Math.floor(t / 1000);
}

const LoadDevUser: React.FC<LoadDevUserProps> = ({ event }) => {
  const [devGames, setDevGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // modal state
  const [selectedGame, setSelectedGame] = useState<any | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  // edit form state – mirrors AddDevGame fields
  const [editTitle, setEditTitle] = useState("");
  const [editReleaseDate, setEditReleaseDate] = useState(""); // yyyy-MM-dd
  const [editPlatforms, setEditPlatforms] = useState("");
  const [editGenres, setEditGenres] = useState("");
  const [editDevUsernames, setEditDevUsernames] = useState("");
  const [editStatus, setEditStatus] = useState<
    "In Development" | "Released" | "Cancelled"
  >("In Development");
  const [editDescription, setEditDescription] = useState("");
  // raw path from backend/upload, e.g. "/uploads/gamecovers/elmo-123.png"
  const [editCoverUrl, setEditCoverUrl] = useState<string | null>(null);

  // Fetch dev games once dev mode is enabled
  useEffect(() => {
    if (!event) return;

    const fetchDevGames = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/dev/games/view`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data.games)
            ? data.games
            : [];
          setDevGames(list);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(
            errorData.message ||
              errorData.error ||
              "Failed to fetch developer games."
          );
        }
      } catch (err) {
        console.error("Error fetching dev games:", err);
        setError("An error occurred while fetching developer games.");
      } finally {
        setLoading(false);
      }
    };

    fetchDevGames();
  }, [event]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const original = document.body.style.overflow;
    if (selectedGame) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original;
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [selectedGame]);

  // Set edit form values when modal opens
  useEffect(() => {
    if (!selectedGame) return;

    setEditTitle(selectedGame.name || selectedGame.title || "");
    setEditDescription(selectedGame.summary || "");
    setEditReleaseDate(unixToDateInput(selectedGame.first_release_date));

    setEditCoverUrl(
      selectedGame.dev_cover_url ||
        selectedGame.coverUrl ||
        null
    );

    const platformsText =
      Array.isArray(selectedGame.devPlatformNames) &&
      selectedGame.devPlatformNames.length
        ? selectedGame.devPlatformNames.join(", ")
        : Array.isArray(selectedGame.platformNames)
        ? selectedGame.platformNames.join(", ")
        : typeof selectedGame.platformsText === "string"
        ? selectedGame.platformsText
        : "";

    const genresText =
      Array.isArray(selectedGame.devGenreNames) &&
      selectedGame.devGenreNames.length
        ? selectedGame.devGenreNames.join(", ")
        : Array.isArray(selectedGame.genreNames)
        ? selectedGame.genreNames.join(", ")
        : typeof selectedGame.genresText === "string"
        ? selectedGame.genresText
        : "";

    const devNamesText =
      Array.isArray(selectedGame.devDeveloperUsernames) &&
      selectedGame.devDeveloperUsernames.length
        ? selectedGame.devDeveloperUsernames.join(", ")
        : Array.isArray(selectedGame.developersUsernames)
        ? selectedGame.developersUsernames.join(", ")
        : Array.isArray(selectedGame.devUsernames)
        ? selectedGame.devUsernames.join(", ")
        : "";

    setEditPlatforms(platformsText);
    setEditGenres(genresText);
    setEditDevUsernames(devNamesText);
    setEditStatus(selectedGame.devStatus || "In Development");
  }, [selectedGame]);

  const handleAddGame = () => {
    setAdding(true);
  };

  const closeModal = () => {
    setSelectedGame(null);
    setModalError(null);
    setShowDeleteConfirm(false);
    setDeleting(false);
    setEditing(false);
  };

  const openGameModal = (game: any) => {
    setSelectedGame(game);
    setModalError(null);
    setShowDeleteConfirm(false);
    setDeleting(false);
    setEditing(false);
  };

  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setModalError("No token found. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("cover", file);

    try {
      const res = await fetch(`${API_BASE}/api/dev/games/cover`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        } as any,
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Failed to upload cover."
        );
      }

      const url: string | undefined =
        data.coverUrl || data.devCoverUrl;
      if (url) {
        setEditCoverUrl(url);
      }
    } catch (err: any) {
      console.error("Error uploading cover:", err);
      setModalError(err?.message || "Error uploading cover.");
    } finally {
      e.target.value = "";
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (!selectedGame) return;
    setDeleting(true);
    setModalError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setModalError("No token found. Please log in again.");
      setDeleting(false);
      return;
    }

    const gameId = selectedGame.id || selectedGame.gameId;

    try {
      const res = await fetch(`${API_BASE}/api/dev/games/${gameId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Failed to delete game."
        );
      }

      setDevGames((prev) =>
        prev.filter((g) => (g.id || g.gameId) !== gameId)
      );

      closeModal();
    } catch (err: any) {
      console.error("Error deleting game:", err);
      setModalError(err?.message || "Error deleting game.");
      setDeleting(false);
    }
  };

  // EDIT
  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGame) return;

    setModalError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setModalError("No token found. Please log in again.");
      return;
    }

    const gameId = selectedGame.id || selectedGame.gameId;

    const platformNames = editPlatforms
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const genreNames = editGenres
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const developersUsernames = editDevUsernames
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const body: any = {
      name: editTitle.trim(),
      summary: editDescription.trim(),
      first_release_date: dateInputToUnix(editReleaseDate),
      platformNames,
      genreNames,
      developersUsernames,
      devStatus: editStatus,
    };

    if (editCoverUrl) {
      body.devCoverUrl = editCoverUrl; // send raw path to backend
    }

    try {
      const res = await fetch(`${API_BASE}/api/dev/games/${gameId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Failed to update game."
        );
      }

      const updated = data.game || data;

      setDevGames((prev) =>
        prev.map((g) =>
          (g.id || g.gameId) === (updated.id || updated.gameId)
            ? updated
            : g
        )
      );

      setSelectedGame(updated);
      setEditing(false);
    } catch (err: any) {
      console.error("Error updating game:", err);
      setModalError(err?.message || "Error updating game.");
    }
  };

  // ───────────────────────────────────────────────────────────
  // Resolve cover URL for display (keeps layout the same)
  // ───────────────────────────────────────────────────────────
  const resolvedEditCoverSrc: string | null = (() => {
    if (!editCoverUrl) return null;

    // already absolute URL
    if (
      editCoverUrl.startsWith("http://") ||
      editCoverUrl.startsWith("https://")
    ) {
      return editCoverUrl;
    }

    // if it's just a filename, assume gamecovers folder
    let path = editCoverUrl;
    if (!path.startsWith("/")) {
      path = `/uploads/gamecovers/${path}`;
    }

    return `${API_BASE}${path}`;
  })();

  if (!event) return null;

  if (adding)
    return (
      <AddDevGame
        onClose={() => {
          setAdding(false);
          window.location.reload();
        }}
      />
    );

  if (loading) return <div>Loading your games...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  const renderModal = () => {
    if (!selectedGame) return null;

    const releaseDateLabel = formatUnixTimestamp(
      selectedGame.first_release_date
    );

    return (
      <div className="dev-modal-backdrop">
        <div className="dev-modal">
          <button className="dev-modal-close" onClick={closeModal}>
            ×
          </button>

          {/* VIEW MODE */}
          {!editing && !showDeleteConfirm && (
            <>
              <h2 className="dev-modal-title">{selectedGame.name}</h2>
              <p className="dev-modal-meta">
                <strong>Release Date:</strong> {releaseDateLabel}
              </p>
              <p className="dev-modal-description">
                {selectedGame.summary || "No description provided."}
              </p>

              <div className="dev-modal-actions">
                <button
                  className="dev-modal-primary"
                  onClick={() => setEditing(true)}
                >
                  Edit Game
                </button>
                <button
                  className="dev-modal-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Game
                </button>
              </div>
            </>
          )}

          {/* EDIT MODE */}
          {editing && !showDeleteConfirm && (
            <form onSubmit={handleEditSubmit} className="dev-modal-form">
              <h2 className="dev-modal-title">Edit Game</h2>

              {/* SIDE-BY-SIDE SECTION */}
              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  alignItems: "flex-start",
                  flexWrap: "nowrap",
                  width: "100%",
                }}
              >
                {/* LEFT: COVER CIRCLE */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.6rem",
                    minWidth: "130px",
                  }}
                >
                  <div
                    style={{
                      width: "110px",
                      height: "110px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      boxShadow: "0 0 12px rgba(162, 89, 255, 0.8)",
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    {resolvedEditCoverSrc ? (
                      <img
                        src={resolvedEditCoverSrc}
                        alt="Game cover"
                        className="dev-modal-cover"
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          opacity: 0.7,
                        }}
                      >
                        No Cover
                      </div>
                    )}
                  </div>

                  <label
                    style={{
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      color: "var(--accent-color)",
                    }}
                  >
                    Change Cover
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleCoverUpload}
                    />
                  </label>
                </div>

                {/* RIGHT: FORM FIELDS */}
                <div className="adddev-fields">
                  <input
                    type="text"
                    placeholder="Game Title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />

                  <label className="dev-modal-label">
                    Release Date (optional)
                    <input
                      type="date"
                      value={editReleaseDate}
                      onChange={(e) => setEditReleaseDate(e.target.value)}
                    />
                  </label>

                  <input
                    type="text"
                    placeholder="Platforms (comma separated, e.g. PC, PlayStation 5)"
                    value={editPlatforms}
                    onChange={(e) => setEditPlatforms(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Genres (comma separated, e.g. Action, RPG)"
                    value={editGenres}
                    onChange={(e) => setEditGenres(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Developer Usernames (comma separated)"
                    value={editDevUsernames}
                    onChange={(e) => setEditDevUsernames(e.target.value)}
                  />

                  <label
                    className="dev-modal-label"
                    style={{ textAlign: "left" }}
                  >
                    Game Status
                    <select
                      value={editStatus}
                      onChange={(e) =>
                        setEditStatus(
                          e.target.value as
                            | "In Development"
                            | "Released"
                            | "Cancelled"
                        )
                      }
                    >
                      <option value="In Development">In Development</option>
                      <option value="Released">Released</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </label>

                  <div>
                    <div
                      style={{
                        marginBottom: "0.4em",
                        textAlign: "center",
                      }}
                    >
                      Description
                    </div>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Describe your game..."
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div
                className="dev-modal-actions"
                style={{ marginTop: "1.2em" }}
              >
                <button type="submit" className="dev-modal-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="dev-modal-secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>

              {modalError && (
                <div className="dev-modal-error">{modalError}</div>
              )}
            </form>
          )}

          {/* DELETE CONFIRM */}
          {showDeleteConfirm && (
            <div className="dev-modal-confirm">
              <h2 className="dev-modal-title">Delete Game?</h2>
              <p className="dev-modal-warning-text">
                Are you sure you want to delete{" "}
                <strong>{selectedGame.name}</strong>? This will:
              </p>
              <ul className="dev-modal-warning-list">
                <li>
                  Remove this game from the global games collection (
                  <code>Game</code>).
                </li>
                <li>
                  Remove it from every user&apos;s library (
                  <code>userGames</code>) where it appears.
                </li>
              </ul>
              <p className="dev-modal-warning-text">
                This action cannot be undone.
              </p>

              <div className="dev-modal-actions">
                <button
                  className="dev-modal-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  className="dev-modal-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>

              {modalError && (
                <div className="dev-modal-error">{modalError}</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const resolveGameCoverUrl = (coverUrl: any): string => {
    if (typeof coverUrl !== 'string' || !coverUrl) {
        return "/default-game.png";
    }
    if (coverUrl.startsWith("http")) {
        return coverUrl;
    }
    if (!coverUrl.startsWith("/")) {
        return `${API_BASE}/uploads/gamecovers/${coverUrl}`;
    }
    return `${API_BASE}${coverUrl}`;
  };

  // MAIN RENDER
  return (
    <div className="dev-game-container">
      <h1 className="page-title">Your Games in Development</h1>

      <div className="dev-games-container">
        <div className="dev-section-header">
          <h2 className="section-title">My Developing Games</h2>
          <button className="add-game-button" onClick={handleAddGame}>
            + Add New Game
          </button>
        </div>

        <div className="columns-wrapper">
          {devGames.length > 0 ? (
            devGames.map((game) => (
              <div
                key={game.id || game.gameId}
                className="user-game-card"
                onClick={() => openGameModal(game)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && openGameModal(game)}
              >
                <img
                  src={resolveGameCoverUrl(game.dev_cover_url || game.coverUrl)}
                  alt={game.name || game.title}
                  className="user-game-cover"
                />
              </div>
            ))
          ) : (
            <p>No games currently in development.</p>
          )}
        </div>
      </div>

      {renderModal()}
    </div>
  );
};

export default LoadDevUser;
