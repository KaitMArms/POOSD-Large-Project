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

  const ref = document.referrer || "";
  const isEditMode = ref.includes("/my-games");

  const [game, setGame] = useState<GlobalGame | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState<number>(5);
  const [status, setStatus] = useState<string>("to-play");

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
          return;
        }

        const data = (await resp.json()) as GlobalGame;
        if (!cancelled) setGame(data);
      } catch {
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

  useEffect(() => {
    if (!isEditMode) return;
    if (!id) return;

    let cancelled = false;

    const fetchUserGame = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const pathId = numericId ?? id;

      try {
        const resp = await fetch(`${API_BASE}/api/user/games/${pathId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!resp.ok) return;

        const data = await resp.json().catch(() => null);
        if (data && !cancelled) {
          if (typeof data.rating === "number") setRating(data.rating);
          if (typeof data.status === "string") setStatus(data.status);
          if (typeof data.isLiked === "boolean") {
            setGame((prev) =>
              prev ? { ...prev, isLiked: data.isLiked } : prev
            );
          }
        }
      } catch {}
    };

    fetchUserGame();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, id, numericId]);

  const submitUserGame = async () => {
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

    const gameIdToSend = numericId ?? id;

    const endpoint = isEditMode
      ? `${API_BASE}/api/user/games/${gameIdToSend}`
      : `${API_BASE}/api/user/games/add`;

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
          isLiked: !!game?.isLiked,
        }),
      });

      if (resp.ok) {
        setSubmitMessage(isEditMode ? "Game updated!" : "Game added!");
        setShowModal(false);
      } else {
        const text = await resp.text().catch(() => "");
        setSubmitMessage(text || "Error saving game.");
      }
    } catch {
      setSubmitMessage("Network error.");
    }
  };

  const likeGame = async () => {
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

      if (resp.ok) {
        setGame((prev) =>
          prev ? { ...prev, isLiked: !prev.isLiked } : prev
        );
      } else {
        const text = await resp.text().catch(() => "");
        setSubmitMessage(text || "Failed to like game.");
      }
    } catch {
      setSubmitMessage("Network error.");
    }
  };

  if (loading) return <div>Loading game…</div>;
  if (error) return <div style={{ color: "var(--text-color)" }}>Error: {error}</div>;
  if (!game) return <div>Game not found.</div>;

  const coverUrl = game.coverUrl || "/default-game.png";
  const releaseDate = formatUnixDate(game.first_release_date);

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
              {Array.isArray(game.genres)
                ? game.genres.join(", ")
                : "Unknown"}
            </div>

            <div className="added-description">
              {game.summary || "No description available."}
            </div>

            <button
              type="button"
              className="add-button"
              onClick={() => setShowModal(true)}
            >
              {isEditMode ? "Edit My Game" : "Add to My Games"}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{isEditMode ? "Edit Game Settings" : "User's Game Settings"}</h3>

            <label className="modal-label">Status</label>
            <select
              className="added-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="completed">Completed</option>
              <option value="in-progress">In In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="dropped">Dropped</option>
              <option value="to-play">To Play</option>
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
                checked={!!game.isLiked}
                onChange={likeGame}
              />
              <label htmlFor="like-checkbox">Like this game?</label>
            </div>

            <button
              type="button"
              className="modal-submit"
              onClick={submitUserGame}
            >
              {isEditMode ? "Save Changes" : "Submit"}
            </button>

            <p className="submit-message">{submitMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadGame;
