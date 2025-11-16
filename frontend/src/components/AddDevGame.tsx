import { useState, type ChangeEvent, type FormEvent } from "react";
import "../pages/DevUserProfile.css";
import "../pages/UserProfile.css";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

type Props = {
  onClose?: () => void;
};

function resolveCoverUrl(url?: string | null) {
  if (!url) return "/GamePlaceholder.png";
  if (url.startsWith("/uploads")) return `${API_BASE}${url}`;
  return url;
}

export default function AddDevGame({ onClose }: Props) {
  const [gameTitle, setGameTitle] = useState("");
  const [firstReleaseDate, setFirstReleaseDate] = useState(""); // optional

  // raw text inputs (allow spaces/commas freely)
  const [platformText, setPlatformText] = useState("");
  const [genreText, setGenreText] = useState("");
  const [devUsernamesText, setDevUsernamesText] = useState("");

  const [gameStatus, setGameStatus] = useState("In Development");
  const [description, setDescription] = useState("");

  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- Upload cover to /api/dev/games/cover ---
  async function handleCoverUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadingCover(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Missing auth token. Please log in again.");
        setUploadingCover(false);
        return;
      }

      const formData = new FormData();
      formData.append("cover", file);

      const res = await fetch(`${API_BASE}/api/dev/games/cover`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data.error || data.message || "Failed to upload cover image.";
        throw new Error(msg);
      }

      // backend: { success, coverUrl }
      setCoverUrl(data.coverUrl);
    } catch (err: any) {
      console.error("Cover upload error:", err);
      setError(err?.message || "Error uploading cover.");
    } finally {
      setUploadingCover(false);
    }
  }

  // --- Submit new game ---
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    if (!gameTitle.trim()) {
      setError("Game title is required.");
      setSaving(false);
      return;
    }

    // turn raw text into arrays on submit
    const platformsClean = platformText
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const genresClean = genreText
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    if (!platformsClean.length) {
      setError("At least one platform is required.");
      setSaving(false);
      return;
    }

    if (!genresClean.length) {
      setError("At least one genre is required.");
      setSaving(false);
      return;
    }

    const devUsernamesClean = devUsernamesText
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u.length > 0)
      .map((u) => u.toLowerCase()); // case-insensitive

    const body = {
      name: gameTitle,
      summary: description, // description → summary
      first_release_date: firstReleaseDate || undefined, // optional
      platformNames: platformsClean,
      genreNames: genresClean,
      developersUsernames: devUsernamesClean,
      devCoverUrl: coverUrl || undefined,
      gameStatus,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Missing auth token. Please log in again.");
        setSaving(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/dev/games/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg =
          data.error || data.message || "Failed to add game. Please try again.";
        throw new Error(msg);
      }

      console.log("Game added:", data);
      setSuccess(true);
      setTimeout(() => {
        onClose?.();
      }, 800);
    } catch (err: any) {
      console.error("Error adding game:", err);
      setError(err?.message || "Error adding game.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="edit-user-container">
      <span id="inner-title">Add New Game</span>

      <div className="edit-user-grid">
        {/* LEFT – circular cover + upload button */}
        <div className="edit-user-left">
          <div className="edit-user-avatar-wrapper">
            <img
              src={resolveCoverUrl(coverUrl)}
              alt="Cover Preview"
              className="edit-user-avatar"
            />
          </div>

          <label className="edit-user-avatar-upload">
            <span>{uploadingCover ? "Uploading..." : "Upload Cover"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
            />
          </label>
        </div>

        {/* RIGHT – fields */}
        <div className="edit-user-right">
          <div className="edit-user-fields">
            <input
              type="text"
              placeholder="Game Title"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              required
            />

            {/* Release Date hint */}
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.3em",
              }}
            >
              <span>Release Date (optional)</span>
              <input
                type="date"
                value={firstReleaseDate}
                onChange={(e) => setFirstReleaseDate(e.target.value)}
              />
            </label>

            <input
              type="text"
              placeholder="Platforms (comma separated, e.g. PC, PlayStation 5)"
              value={platformText}
              onChange={(e) => setPlatformText(e.target.value)}
            />

            <input
              type="text"
              placeholder="Genres (comma separated, e.g. Action, RPG)"
              value={genreText}
              onChange={(e) => setGenreText(e.target.value)}
            />

            <input
              type="text"
              placeholder="Developer Usernames (comma separated)"
              value={devUsernamesText}
              onChange={(e) => setDevUsernamesText(e.target.value)}
            />

            {/* Status with label/hint and same styling as inputs */}
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.3em",
              }}
            >
              <span>Game Status</span>
              <select
                value={gameStatus}
                onChange={(e) => setGameStatus(e.target.value)}
              >
                <option>In Development</option>
                <option>Released</option>
                <option>Cancelled</option>
              </select>
            </label>
          </div>

          {/* Description box */}
          <div className="edit-user-bio">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Describe your game..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ color: "red", marginTop: "0.75rem" }}>{error}</div>
      )}
      {success && (
        <div style={{ color: "limegreen", marginTop: "0.75rem" }}>
          Game added successfully!
        </div>
      )}

      <div id="signUpButtonsDiv">
        <input
          type="submit"
          id="submitButton"
          className="buttons"
          value={saving ? "Saving..." : "Add Game"}
          disabled={saving}
        />
        <input
          type="button"
          id="cancelButton"
          className="buttons"
          value="Cancel"
          onClick={() => onClose?.()}
        />
      </div>
    </form>
  );
}
