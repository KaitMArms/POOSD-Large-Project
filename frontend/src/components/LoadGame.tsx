import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

type GlobalGame = {
  id?: number | string;
  name?: string;
  summary?: string;
  coverUrl?: string | null;
  genres?: (string | number)[] | null;
  first_release_date?: number | null;
  isLiked?: boolean;
};

function formatUnixDate(unixSeconds: number | null | undefined): string {
  if (!unixSeconds || typeof unixSeconds !== "number") return "Unknown";
  try {
    const d = new Date(unixSeconds * 1000);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown";
  }
}

function LoadGame() {
  const { id } = useParams<{ id?: string }>();

  const [game, setGame] = useState<GlobalGame | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditMode, setIsEditMode] = useState<boolean | null>(null);

  const [rating, setRating] = useState<number>(5);
  const [status, setStatus] = useState<string>("to-play");
  const [localLiked, setLocalLiked] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");

  const numericId = (() => {
    if (!id) return null;
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  })();

  useEffect(() => {
    let cancelled = false;

    const fetchGame = async () => {
      setLoading(true);
      setError(null);
      setIsEditMode(null); 

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }
      if (!id) {
        setError("No game id provided.");
        setLoading(false);
        return;
      }

      const pathId = numericId ?? id;
      try {
        const resp = await fetch(`${API_BASE}/api/globalgames/${pathId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!resp.ok) {
          const t = await resp.text().catch(() => "");
          setError(t || `Failed to load game (status ${resp.status})`);
          setLoading(false);
          return;
        }

        const data = (await resp.json()) as GlobalGame;
        if (!cancelled) {
          setGame(data);
          setLocalLiked(!!data.isLiked);
        }

        await determineEditMode(pathId, cancelled);
      } catch (e) {
        if (!cancelled) setError("Error fetching game details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchGame();
    return () => {
      cancelled = true;
    };
  }, [id, numericId]);

  async function determineEditMode(pathId: number | string, cancelledFlag = false) {
    const token = localStorage.getItem("token");
    if (!token) {
      if (!cancelledFlag) setIsEditMode(false);
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/api/user/games/${pathId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (resp.ok) {
        const ud = await resp.json().catch(() => null);
        if (!cancelledFlag) {
          setIsEditMode(true);
          if (ud) {
            if (typeof ud.rating === "number") setRating(ud.rating);
            if (typeof ud.status === "string") setStatus(ud.status);
            if (typeof ud.isLiked === "boolean") setLocalLiked(ud.isLiked);
          }
        }
      } else if (resp.status === 404) {
        if (!cancelledFlag) setIsEditMode(false);
      } else {
        if (!cancelledFlag) setIsEditMode(false);
      }
    } catch (e) {
      if (!cancelledFlag) setIsEditMode(false);
    }
  }

  const likeGame = async (): Promise<void> => {
    setSubmitMessage("");
    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitMessage("You must be logged in.");
      return;
    }
    if (!id) {
      setSubmitMessage("No game id.");
      return;
    }

    const pathId = numericId ?? id;

    try {
      const resp = await fetch(`${API_BASE}/api/user/games/${pathId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setLocalLiked((prev) => !prev);

      if (resp.ok) {
        const updated = await resp.json().catch(() => null);
        if (updated && typeof updated.isLiked === "boolean") {
          setLocalLiked(updated.isLiked);
          setGame((prev) => (prev ? { ...prev, isLiked: updated.isLiked } : prev));
        }
      } else {
        setLocalLiked((prev) => !prev);
        const text = await resp.text().catch(() => "");
        setSubmitMessage(text || `Could not like game (status ${resp.status}).`);
      }
    } catch (err) {
      setLocalLiked((prev) => !prev);
      setSubmitMessage("Network error.");
    }
  };

  const submitUserGame = async (): Promise<void> => {
    setSubmitMessage("");

    if (isEditMode === null) {
      setSubmitMessage("Still determining mode, please wait...");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitMessage("You must be logged in.");
      return;
    }
    if (!id) {
      setSubmitMessage("No game id.");
      return;
    }

    const gameIdToSend: number | string = numericId ?? id;
    const endpoint = isEditMode
      ? `${API_BASE}/api/user/games/${gameIdToSend}` // PATCH existing
      : `${API_BASE}/api/user/games/add`; // POST to add new
    const method = isEditMode ? "PATCH" : "POST";

    try {
      const resp = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: gameIdToSend,
          name: game?.name,
          status,
          rating,
          isLiked: !!localLiked,
        }),
      });

      if (resp.ok) {
        setSubmitMessage(isEditMode ? "Game updated!" : "Game added!");
        setIsEditMode(true);
        setShowModal(false);
        return;
      }

      const contentType = resp.headers.get("content-type") || "";
      const text = await resp.text().catch(() => "");
      if (!contentType.includes("application/json") && text) {
        const lower = text.toLowerCase();
        if (lower.includes("already") || lower.includes("exists")) {
          setIsEditMode(true);
          await determineEditMode(gameIdToSend, false);
          setSubmitMessage("Game already in your list — switched to edit mode.");
          return;
        }
      }

      // if JSON, try parse message
      if (contentType.includes("application/json")) {
        const json = await resp.json().catch(() => ({}));
        const msg = json?.message || json?.error || text || `Error (${resp.status})`;
        if ((json?.error && String(json.error).toLowerCase().includes("already")) ||
            (json?.message && String(json.message).toLowerCase().includes("already"))) {
          setIsEditMode(true);
          await determineEditMode(gameIdToSend, false);
          setSubmitMessage("Game already in your list — switched to edit mode.");
          return;
        }
        setSubmitMessage(msg);
      } else {
        setSubmitMessage(text || `Could not ${isEditMode ? "update" : "add"} game (status ${resp.status}).`);
      }
    } catch (err) {
      setSubmitMessage("Network error.");
    }
  };

  if (loading) return <div>Loading game...</div>;
  if (error) return <div style={{ color: "var(--text-color)" }}>Error: {error}</div>;
  if (!game) return <div>Game not found.</div>;

  const coverUrl = game.coverUrl || "/default-game.png";
  const releaseDate = formatUnixDate(
    typeof game.first_release_date === "number" ? game.first_release_date : null
  );

  return (
    <div className="game-view-container">
      <div className="game-feature-wrapper">
        <div className="added-feature-container">
          <div className="added-image-wrapper">
            <img src={coverUrl} className="added-image" alt={game.name ?? "cover"} />
          </div>

          <div className="added-info">
            <h2 className="added-title">{game.name}</h2>
            <p><strong>Release Date:</strong> {releaseDate}</p>

            <div className="added-field">
              <strong>Genres:</strong>{" "}
              {Array.isArray(game.genres) ? game.genres.join(", ") : String(game.genres ?? "Unknown")}
            </div>

            <div className="added-description">{game.summary || "No description available."}</div>

            <button
              type="button"
              className="add-button"
              onClick={() => setShowModal(true)}
              disabled={isEditMode === null} 
            >
              {isEditMode === null ? "Checking…" : isEditMode ? "Edit My Game" : "Add to My Games"}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{isEditMode ? "Edit Game Settings" : "User's Game Settings"}</h3>

            <label className="modal-label">Status</label>
            <select className="added-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">Paused</option>
              <option value="dropped">Dropped</option>
              <option value="to-play">To Be Played</option>
            </select>

            <label className="modal-label">Rating: {rating.toFixed(1)}</label>
            <input
              type="range"
              min={0}
              max={10}
              step={0.1}
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value))}
              className="modal-slider"
            />

            <div className="modal-checkbox">
              <input
                type="checkbox"
                id="like-checkbox"
                checked={!!localLiked}
                onChange={likeGame}
              />
              <label htmlFor="like-checkbox">Like this game?</label>
            </div>

            <button type="button" className="modal-submit" onClick={submitUserGame}>
              {isEditMode ? "Save Changes" : "Submit"}
            </button>

            <p className="submit-message" role="status" aria-live="polite">{submitMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadGame;
