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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [rating, setRating] = useState<number>(5);
  const [status, setStatus] = useState<string>("to-play");
  const [localLiked, setLocalLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");

  const numericId = (() => {
    if (!id) return null;
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  })();

  useEffect(() => {
    let cancelled = false;

    const fetchGameData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const pathId = numericId ?? id;

      try {
        // 1. Fetch global game details
        const gameResp = await fetch(`${API_BASE}/api/globalgames/${pathId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!gameResp.ok) {
          throw new Error("Game not found");
        }
        const gameData = (await gameResp.json()) as GlobalGame;
        if (cancelled) return;

        setGame(gameData);
        setLocalLiked(!!gameData.isLiked);

        // 2. If logged in, check for user-specific game data
        if (token) {
          const userGameResp = await fetch(`${API_BASE}/api/user/games/${pathId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (cancelled) return;

          if (userGameResp.ok) {
            const data = await userGameResp.json().catch(() => null);
            setIsEditMode(true); // User has this game
            if (data?.rating) setRating(data.rating);
            if (data?.status) setStatus(data.status);
            if (typeof data?.isLiked === "boolean") {
              setLocalLiked(data.isLiked);
            }
          } else {
            setIsEditMode(false); // User does not have this game
          }
        } else {
          setIsEditMode(false); // Not logged in
        }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof Error) {
            setSubmitMessage(error.message);
          } else {
            setSubmitMessage("An unknown error occurred.");
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchGameData();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, id, numericId]);

  const likeGame = async (): Promise<void> => {
    if (isLiking) return;
    setIsLiking(true);
    setSubmitMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitMessage("You must be logged in.");
      setIsLiking(false);
      return;
    }

    if (!id) {
      setSubmitMessage("No game id.");
      setIsLiking(false);
      return;
    }

    const pathId = numericId ?? id;

    try {
      const resp = await fetch(`${API_BASE}/api/user/games/${pathId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.ok) {
        const updated = await resp.json().catch(() => null);
        if (updated && typeof updated.isLiked === "boolean") {
          setLocalLiked(updated.isLiked);
        }
      } else {
        const text = await resp.text().catch(() => "");
        setSubmitMessage(text || `Could not like game (status ${resp.status}).`);
      }
    } catch (error) {
      if (error instanceof Error) {
        setSubmitMessage(error.message);
      } else {
        setSubmitMessage("An unknown error occurred.");
      }
    } finally {
      setIsLiking(false);
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

    if (!numericId) {
      setSubmitMessage("Invalid game ID.");
      return;
    }

    const gameIdToSend: number = numericId;
    const endpointUrl = isEditMode
      ? `${API_BASE}/api/user/games/${gameIdToSend}`
      : `${API_BASE}/api/user/games/add`;
    const httpMethod = isEditMode ? "PATCH" : "POST";

    try {
      const resp = await fetch(endpointUrl, {
        method: httpMethod,
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
      } else {
        const text = await resp.text().catch(() => "");
        setSubmitMessage(text || `Error (status ${resp.status})`);
      }
    } catch (error) {
      if (error instanceof Error) {
        setSubmitMessage(error.message);
      } else {
        setSubmitMessage("An unknown error occurred.");
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
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
            <h3>{isEditMode ? "Edit Game Settings" : "Add Game to List"}</h3>

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
                disabled={isLiking}
              />
              <label htmlFor="like-checkbox">
                {isLiking ? "Liking..." : "Like this game?"}
              </label>
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
