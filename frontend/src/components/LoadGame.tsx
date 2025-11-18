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
    if (!id) return;
    let cancelled = false;

    const fetchGameData = async () => {
      const token = localStorage.getItem("token");
      const pathId = numericId ?? id;

      try {
        // First, fetch the global game info.
        const gameResp = await fetch(`${API_BASE}/api/globalgames/${pathId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!gameResp.ok) return;
        const gameData = (await gameResp.json()) as GlobalGame;
        if (cancelled) return;

        setGame(gameData);
        setLocalLiked(!!gameData.isLiked);

        // If logged in, check if the user has this game in their list.
        if (token) {
          const userGameResp = await fetch(`${API_BASE}/api/user/games/${pathId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (cancelled) return;

          if (userGameResp.ok) {
            const data = await userGameResp.json().catch(() => null);
            setIsEditMode(true);
            if (data?.rating) setRating(data.rating);
            if (data?.status) setStatus(data.status);
            if (typeof data?.isLiked === "boolean") {
              setLocalLiked(data.isLiked);
              setGame((prev) => (prev ? { ...prev, isLiked: data.isLiked } : prev));
            }
          } else {
            setIsEditMode(false);
          }
        } else {
          setIsEditMode(false);
        }
      } catch {
        if (!cancelled) setIsEditMode(false);
      }
    };

    fetchGameData();
    return () => {
      cancelled = true;
    };
  }, [id, numericId]);

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

    // Optimistically update UI
    setLocalLiked((prev: boolean) => !prev);

    try {
      const resp = await fetch(`${API_BASE}/api/user/games/${pathId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (resp.ok) {
        const updated = await resp.json().catch(() => null);
        if (updated && typeof updated.isLiked === "boolean") {
          // Sync with server state
          setLocalLiked(updated.isLiked);
          setGame((prev) =>
            prev ? { ...prev, isLiked: updated.isLiked } : prev
          );
        }
      } else {
        // Revert on failure
        setLocalLiked((prev: boolean) => !prev);
        const text = await resp.text().catch(() => "");
        setSubmitMessage(text || `Could not like game (status ${resp.status}).`);
      }
    } catch {
      // Revert on network error
      setLocalLiked((prev: boolean) => !prev);
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
          isLiked: !!localLiked,
        }),
      });

      if (resp.ok) {
        setSubmitMessage(isEditMode ? "Game updated!" : "Game added!");
        setIsEditMode(true);
        setShowModal(false);
        return;
      }

      const text = await resp.text().catch(() => "");
      setSubmitMessage(text || `Error (status ${resp.status})`);
    } catch {
      setSubmitMessage("Network error.");
    }
  };

  if (!game) return <div>Game not found.</div>;

  const coverUrl = game.coverUrl || "/default-game.png";
  const releaseDate = formatUnixDate(
    typeof game.first_release_date === "number"
      ? game.first_release_date
      : null
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
              {Array.isArray(game.genres)
                ? game.genres.join(", ")
                : String(game.genres ?? "Unknown")}
            </div>

            <div className="added-description">
              {game.summary || "No description available."}
            </div>

            <button
              type="button"
              className="add-button"
              onClick={() => setShowModal(true)}
              disabled={isEditMode === null}
            >
              {isEditMode === null
                ? "Checking…"
                : isEditMode
                ? "Edit My Game"
                : "Add to My Games"}
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

            <button
              type="button"
              className="modal-submit"
              onClick={submitUserGame}
            >
              {isEditMode ? "Save Changes" : "Submit"}
            </button>

            <p className="submit-message" role="status" aria-live="polite">
              {submitMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadGame;
