import { useState, type FormEvent, type ChangeEvent } from "react";
import "../pages/UserProfile.css"; // same style family as EditUser

// 🔹 Auto-resolves correct base URL
const API_BASE =
    window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

async function request<T>( path: string, opts: RequestInit = {}): 
    Promise<T> {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {
        ...(opts.headers as Record<string, string> || {}),
    };

    if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/api${path}`, {
        ...opts,
        headers,
    });
        const text = await res.text();
        const body = text ? JSON.parse(text) : null;
    if (!res.ok) {
        const msg = (body && (body.message || body.error)) || "Request failed";
    throw new Error(msg);
    }
    return body as T;
}

async function addDevGame(payload: any): Promise<any> {
    return request("/dev/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export default function AddDevGame({ onClose }: { onClose: () => void }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("");
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
        await addDevGame({
        title,
        description,
        genre,
        status,
        coverUrl,
        });
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
      <span id="inner-title">Add New Game</span>

      <div className="edit-user-grid">
        {/* LEFT: Cover preview + upload */}
        <div className="edit-user-left">
          <div className="edit-user-avatar-wrapper">
            <img src={coverUrl || "/GamePlaceholder.png"} alt="Cover Preview" className="edit-user-avatar"/>
          </div>

          <label className="edit-user-avatar-upload">
            <span>Upload Cover</span>
            <input type="file" accept="image/*" onChange={handleCoverUpload}/>
          </label>
        </div>

        <div className="edit-user-right">
          <div className="edit-user-fields">
            <input type="text" placeholder="Game Title" value={title}onChange={(e) => setTitle(e.target.value)} required/>
            <input type="text" placeholder="Genre (e.g. Action, Puzzle)" value={genre} onChange={(e) => setGenre(e.target.value)}/>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="in-development">In Development</option>
                <option value="released">Released</option>
                <option value="paused">Paused</option>
            </select>
          </div>

            <div className="edit-user-bio">
                <label htmlFor="description">Description</label>
                <textarea id="description" placeholder="Describe your game..." value={description} onChange={(e) => setDescription(e.target.value)} rows={6}/>
            </div>
        </div>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && (
        <div style={{ color: "limegreen" }}>Game added successfully!</div>
      )}

      <div id="signUpButtonsDiv">
        <input type="submit" id="submitButton" className="buttons" value={saving ? "Saving..." : "Add Game"} disabled={saving}/>
        <input type="button" id="cancelButton" className="buttons" value="Cancel"onClick={onClose}/>
      </div>
    </form>
  );
}