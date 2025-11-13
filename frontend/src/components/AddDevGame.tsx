import { useState, type FormEvent, type ChangeEvent } from "react";
import "../pages/UserProfile.css";

const API_BASE =
    window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

export default function AddDevGame({ onClose }: { onClose: () => void }) {
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
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("cover", file);

        const res = await fetch(`${API_BASE}/api/dev/games/cover`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to upload cover.");
        setCoverUrl(data.coverUrl);
    } catch (err: any) {
        setError(err.message);
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
        const platformsArr = platforms
        .split(",")
        .map((n) => Number(n.trim()))
        .filter((n) => Number.isFinite(n));
        const genresArr = genres
        .split(",")
        .map((n) => Number(n.trim()))
        .filter((n) => Number.isFinite(n));

        if (!platformsArr.length || !genresArr.length) {
        throw new Error("Platforms and genres must be non-empty arrays of numbers.");
    }

    const body = {
    name,
    summary,
    first_release_date: firstReleaseDate,
    platforms: platformsArr,
    genres: genresArr,
    developersUsernames: developersUsernames
        ? developersUsernames
            .split(",")
            .map((u) => u.trim().toLowerCase())
            .filter((u) => u)
        : [],
    status,
    cover: coverUrl ? Number(coverUrl) : undefined,
    };

    const res = await fetch(`${API_BASE}/api/dev/games`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || "Failed to add game.");

    setSuccess(true);
    setTimeout(() => onClose(), 1000);
    } catch (err: any) {
    setError(err.message);
    } finally {
    setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="edit-user-container">
        <span id="inner-title">Add New Developer Game</span>

        <div className="edit-user-grid">
            <div className="edit-user-left">
                <div className="edit-user-avatar-wrapper">
                <img src={coverUrl || "/GamePlaceholder.png"} alt="Cover Preview" className="edit-user-avatar"/>
                </div>
                <label className="edit-user-avatar-upload">
                <span>Upload Cover</span>
                <input type="file" accept="image/*" onChange={handleCoverUpload} />
                </label>
            </div>
            <div className="edit-user-right">
                <div className="edit-user-fields">
                    <input type="text" placeholder="Game Title (name)" value={name} onChange={(e) => setName(e.target.value)} required/>
                    <textarea placeholder="Game Summary (brief description)" value={summary} onChange={(e) => setSummary(e.target.value)} required rows={4}/>
                    <input type="date" placeholder="First Release Date" value={firstReleaseDate} onChange={(e) => setFirstReleaseDate(e.target.value)} required/>
                    <input type="text" placeholder="Platform IDs (comma-separated numbers)" value={platforms} onChange={(e) => setPlatforms(e.target.value)} required />
                    <input type="text" placeholder="Genre IDs (comma-separated numbers)" value={genres} onChange={(e) => setGenres(e.target.value)} required/>
                    <input type="text" placeholder="Other Developer Usernames (comma-separated)" value={developersUsernames} onChange={(e) => setDevelopersUsernames(e.target.value)}/>
                    <div className="dropdown-themed">
                        <label htmlFor="status">Progress</label>
                        <select id="status" className="theme-dropdown" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="in-development">In Development</option>
                        <option value="released">Released</option>
                        <option value="paused">Paused</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {error && <div style={{ color: "red" }}>{error}</div>}
        {success && (
        <div style={{ color: "limegreen" }}>Game added successfully!</div>
        )}

        <div id="signUpButtonsDiv">
            <input type="submit" id="submitButton" className="buttons" value={saving ? "Saving..." : "Add Game"} disabled={saving}/>
            <input type="button" id="cancelButton" className="buttons" value="Cancel" onClick={onClose}/>
        </div>
    </form>
  );
}