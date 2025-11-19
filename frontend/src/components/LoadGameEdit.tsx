import { useState} from "react";
import { Link } from "react-router-dom";
import type { CSSProperties } from 'react';

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

type EditGameModalProps = {
  game: any;
  onClose: () => void;
  onSave: (updatedGame: any) => void;
  onRemove: (gameId: number | string) => void;
};

function EditGameModal({ game, onClose, onSave ,onRemove}: EditGameModalProps) {
  const [status, setStatus] = useState<string>(game.status || "to-play");
  const [rating, setRating] = useState<number>(typeof game.userRating === 'number' ? game.userRating : 5);
  const [isLiked, setIsLiked] = useState<boolean>(!!game.isLiked);
  const [submitMessage, setSubmitMessage] = useState("");

  const submitUserGame = async () => {
    setSubmitMessage("");
    const token = localStorage.getItem("token");
    if (!token || !game.id) {
      setSubmitMessage("Cannot update game: missing token or game ID.");
      return;
    }
    const updatedGameData = {
      status,
      rating,
      isLiked,
    }
    try {
      const resp = await fetch(`${API_BASE}/api/user/games/${game.slug}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          rating,
          isLiked,
        }),
      });

      if (resp.ok) {
        setSubmitMessage("Game updated successfully!");
        onSave({ ...game, ...updatedGameData });
        setTimeout(onClose, 1500);
      } else {
        const errorData = await resp.json().catch(() => ({}));
        setSubmitMessage(errorData.message || "An error occurred.");
      }
    } catch (err) {
      setSubmitMessage("A network error occurred.");
    }
  };

  const handleRemove = async () => {
    if (!window.confirm(`Are you sure you want to remove "${game.name}" from your list?`)) {
      return;
    }

    setSubmitMessage("");
    const token = localStorage.getItem("token");
    if (!token || !game.id) {
      setSubmitMessage("Cannot remove game: missing token or game ID.");
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/api/user/games/${game.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resp.ok) {
        setSubmitMessage("Game removed successfully!");
        onRemove(game.id);
        setTimeout(onClose, 1500);
      } else {
        const errorData = await resp.json().catch(() => ({}));
        setSubmitMessage(errorData.message || "Failed to remove game.");
      }
    } catch (err) {
      setSubmitMessage("A network error occurred.");
    }
  };
  const gameLinkStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    textDecoration: 'none',
    color: '#fff',
    width: '100%',
    alignItems: 'center',
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <Link to={`/game/${game.slug}`} className="game-link" style={gameLinkStyles}>

          <img
            src={game.bannerUrl || game.coverUrl || "/default-game.png"}
            alt={game.name}
            className="modal-banner-image"
          />
        </Link>
        <div className="modal-content">

          <h3>Editing: {game.name}</h3>

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
              id={`like-checkbox-${game.id}`}
              checked={isLiked}
              onChange={(e) => setIsLiked(e.target.checked)}
            />
            <label htmlFor={`like-checkbox-${game.id}`}>Like this game?</label>
          </div>

          <button className="modal-submit" onClick={submitUserGame}>
            Save Changes
          </button>

          <button
            className="modal-remove-button"
            onClick={handleRemove}
          >
            Remove Game
          </button>

          <p className="submit-message">{submitMessage}</p>

          <button className="modal-close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditGameModal;


