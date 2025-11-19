import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

function LoadGameEdit() {
  const { id } = useParams<{ id?: string }>();
  const numericId = id ? Number(id) : null;

  const [game, setGame] = useState<any>(null);
  const [rating, setRating] = useState<number>(5);
  const [status, setStatus] = useState<string>("to-play");
  const [localLiked, setLocalLiked] = useState<boolean>(false);

  const [submitMessage, setSubmitMessage] = useState("");

  // Load user's saved game entry
  useEffect(() => {
    if (!numericId) return;
    let cancelled = false;

    const loadUserGame = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const resp = await fetch(`${API_BASE}/api/user/games/${numericId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resp.ok) return;
        const data = await resp.json();

        if (!cancelled) {
          setGame(data);
          if (data.rating) setRating(data.rating);
          if (data.status) setStatus(data.status);
          if (typeof data.isLiked === "boolean") setLocalLiked(data.isLiked);
        }
      } catch {
        /* no-op */
      }
    };

    loadUserGame();
    return () => {
      cancelled = true;
    };
  }, [numericId]);

  // Toggle like
  const likeGame = async () => {
    setSubmitMessage("");

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const resp = await fetch(`${API_BASE}/api/user/games/${numericId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.ok) {
        const updated = await resp.json().catch(() => null);
        if (updated && typeof updated.isLiked === "boolean") {
          setLocalLiked(updated.isLiked);
        }
      }
    } catch {
      setSubmitMessage("Network error.");
    }
  };

  // Submit edited game
  const submitUserGame = async () => {
    setSubmitMessage("");

    const token = localStorage.getItem("token");
    if (!token || !numericId) {
      setSubmitMessage("No game id.");
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/api/user/games/${numericId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: numericId,
          status,
          rating,
          isLiked: !!localLiked,
        }),
      });

      if (resp.ok) {
        setSubmitMessage("Game updated!");
        return;
      }

      const text = await resp.text().catch(() => "");
      setSubmitMessage(text || `Error (status ${resp.status}).`);
    } catch {
      setSubmitMessage("Network error.");
    }
  };

  if (!game) return <div>Loading…</div>;

  return (
    <div className="game-edit-container">
      <h2>Edit My Game</h2>

      <label>Status</label>
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

      <label>Rating: {rating.toFixed(1)}</label>
      <input
        type="range"
        min={0}
        max={10}
        step={0.1}
        value={rating}
        onChange={(e) => setRating(parseFloat(e.target.value))}
      />

      <div className="modal-checkbox">
        <input
          type="checkbox"
          id="like-checkbox"
          checked={!!localLiked}
          onChange={() => likeGame()}
        />
        <label htmlFor="like-checkbox">Like this game?</label>
      </div>

      <button className="modal-submit" onClick={submitUserGame}>
        Save Changes
      </button>

      <p className="submit-message">{submitMessage}</p>
    </div>
  );
}

export default LoadGameEdit;
