import { useState, type ChangeEvent, type FormEvent } from "react";
import "../pages/DevUserProfile.css";

const API_BASE =
  window.location.hostname === "localhost" ? "http://localhost:8080" : "https://playedit.games";

type Props = {
  onClose: () => void;
};

export default function AddDevGame({ onClose }: Props) {
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [firstReleaseDate, setFirstReleaseDate] = useState("");
  const [platforms, setPlatforms] = useState("");
  const [genres, setGenres] = useState("");
  const [developersUsernames, setDevelopersUsernames] = useState("");
  const [status, setStatus] = useState("in-development");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleCoverUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("cover", file);

      const res = await fetch(`${API_BASE}/api/dev/games/cover`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to upload cover.");

      // server returns coverUrl or id — store raw value and render if it's a url
      setCoverUrl(data.coverUrl || data.cover || null);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");

      // parse comma-separated numeric IDs for platforms & genres (same logic as before)
      const platformsArr = platforms
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
        .filter((n) => Number.isFinite(n));

      const genresArr = genres
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
        .filter((n) => Number.isFinite(n));

      if (!platformsArr.length) {
        throw new Error("Platforms must be a non-empty comma-separated list of IDs (numbers).");
      }

      if (!genresArr.length) {
        throw new Error("Genres must be a non-empty comma-separated list of IDs (numbers).");
      }

      const releaseUnix = firstReleaseDate ? Math.floor(new Date(firstReleaseDate).getTime() / 1000) : undefined;

      const body: any = {
        name,
        summary,
        first_release_date: releaseUnix,
        platforms: platformsArr,
        genres: genresArr,
        developersUsernames: developersUsernames
          ? developersUsernames
              .split(",")
              .map((u) => u.trim().toLowerCase())
              .filter(Boolean)
          : [],
        cover: coverUrl ? Number(coverUrl) : undefined,
        status,
      };

      const res = await fetch(`${API_BASE}/api/dev/games`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || "Failed to add game.");

      setSuccess(true);
      // small delay so user sees success, then close
      setTimeout(() => onClose(), 900);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="adddev-container">
      <span id="inner-title">Add New Developer Game</span>

      <div className="adddev-grid" style={{ alignItems: "start" }}>
        <div className="adddev-left">
          <div style={{ width: 240 }}>
            <img
              src={coverUrl || "/GamePlaceholder.png"}
              alt="Cover Preview"
              className="adddev-cover"
              style={{ width: "100%", borderRadius: 12 }}
            />
          </div>

          <label className="adddev-upload-label" htmlFor="coverUpload">
            <span>Upload Cover</span>
            <input id="coverUpload" type="file" accept="image/*" onChange={handleCoverUpload} />
          </label>
        </div>

        <div className="adddev-fields">
          <input
            type="text"
            placeholder="Game Title (name)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <textarea
            placeholder="Game Summary (summary)"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
            rows={4}
          />

          <label htmlFor="firstRelease" style={{ fontSize: "0.9rem", marginTop: 6 }}>
            First Release Date
          </label>
          <input
            id="firstRelease"
            type="date"
            value={firstReleaseDate}
            onChange={(e) => setFirstReleaseDate(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Platform IDs (comma-separated numbers, e.g. 6,48)"
            value={platforms}
            onChange={(e) => setPlatforms(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Genre IDs (comma-separated numbers, e.g. 4,12)"
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Other Developer Usernames (comma-separated)"
            value={developersUsernames}
            onChange={(e) => setDevelopersUsernames(e.target.value)}
          />

          <div className="dropdown-themed" style={{ marginTop: 8 }}>
            <label htmlFor="status" className="dropdown-label">
              Progress
            </label>
            <select id="status" className="theme-dropdown" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="in-development">In Development</option>
              <option value="released">Released</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
      {success && <div style={{ color: "limegreen", marginTop: 10 }}>Game added successfully!</div>}

      <div className="adddev-buttons" style={{ marginTop: 12 }}>
        <input type="submit" id="submitButton" className="buttons" value={saving ? "Saving..." : "Add Game"} disabled={saving} />
        <input type="button" id="cancelButton" className="buttons" value="Cancel" onClick={onClose} />
      </div>
    </form>
  );
}