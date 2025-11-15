import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import "../pages/DevUserProfile.css";

type LoadDevUserProps = {
  event: boolean;
};

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

// 🔹 Inline AddDevGame form (mirrors EditUser)
function AddDevGame({ onClose }: { onClose: () => void }) {
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

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/dev/games`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title,
          description,
          genre,
          status,
          coverUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add game.");

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
        <div className="edit-user-left">
          <div className="edit-user-avatar-wrapper">
            <img
              src={coverUrl || "/GamePlaceholder.png"}
              alt="Cover Preview"
              className="edit-user-avatar"
              loading="lazy"
            />
          </div>
          <label className="edit-user-avatar-upload">
            <span>Upload Cover</span>
            <input type="file" accept="image/*" onChange={handleCoverUpload} />
          </label>
        </div>

        <div className="edit-user-right">
          <div className="edit-user-fields">
            <input
              type="text"
              placeholder="Game Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Genre (e.g. Action, Puzzle)"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="in-development">In Development</option>
              <option value="released">Released</option>
              <option value="paused">Paused</option>
            </select>
          </div>

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

      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "limegreen" }}>Game added successfully!</div>}

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
          onClick={onClose}
        />
      </div>
    </form>
  );
}

const LoadDevUser: React.FC<LoadDevUserProps> = ({ event }) => {
  const [devGames, setDevGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

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
        // 🔹 match dev.routes.js -> router.get('/games/view', viewGames);
        const response = await fetch(`${API_BASE}/api/dev/games/view`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched developer games:", data);
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data.games)
            ? data.games
            : [];
          setDevGames(list);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.message || errorData.error || "Failed to fetch developer games.");
        }
      } catch {
        setError("An error occurred while fetching developer games.");
      } finally {
        setLoading(false);
      }
    };

    fetchDevGames();
  }, [event]);

  const handleAddGame = () => {
    setAdding(true);
  };

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

  return (
    <div className="dev-game-container">
      <h1 className="page-title">Your Games in Development</h1>

      <div className="dev-games-container">
        <div className="dev-section-header">
          <h2 className="section-title">My Development Games</h2>
          <button className="add-game-button" onClick={handleAddGame}> + Add New Game</button>
        </div>

        <div className="columns-wrapper">
          {devGames.length > 0 ? (
            devGames.map((game) => (
              <div key={game.id || game.gameId} className="dev-game-row">
                <Link to={`/game/${game.id || game.gameId}`} className="game-link">{game.name || game.title}</Link>
              </div>
            ))
          ) : (
            <p>No games currently in development.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadDevUser;