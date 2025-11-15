import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

function LoadGame() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New feature state
  const [rating, setRating] = useState<number>(5);
  const [status, setStatus] = useState<string>("To Be Played");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");

  useEffect(() => {
    const fetchGame = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/globalgames/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          setError("Failed to load game.");
          setLoading(false);
          return;
        }

        const data = await response.json();
        setGame(data);
      } catch (err) {
        setError("Error fetching game details.");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  const addToUserGames = async () => {
    setSubmitMessage(""); 
    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitMessage("You must be logged in.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/user/games/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: id,
          status,
          rating,
        }),
      });

      if (response.ok) {
        setSubmitMessage("Game added to your list!");
        setShowModal(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSubmitMessage(errorData.message || "Could not add game.");
      }
    } catch {
      setSubmitMessage("Network error.");
    }
  };

  if (loading) return <div>Loading game...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!game) return <div>Game not found.</div>;

  const coverUrl =
    game?.cover?.url && typeof game.cover.url === "string"
      ? game.cover.url.replace("t_thumb", "t_720p")
      : "/default-game.png";

  return (
    <div className="game-view-container">
      <div className="game-feature-wrapper">
        <button type="button" className="back-button" onClick={() => window.history.back()}> ← Back</button>
        <div className="added-feature-container">
          <div className="added-image-wrapper">
            <img src={coverUrl} className="added-image" alt={game.name ?? "cover"} />
          </div>
          <div className="added-info">
            <h2 className="added-title">{game.name}</h2>
            <div className="added-field">
              <strong>Genres:</strong> {game.genres?.join(", ") || "Unknown"}
            </div>
            <div className="added-description">
              {game.summary || "No description available."}
            </div>
            <div className="rating-box">
              <label className="rating-label">Rating: {rating.toFixed(1)} / 10</label>
              <input type="range" min={0} max={10} step={0.1} value={rating} onChange={(e) => setRating(parseFloat(e.target.value))} className="rating-slider"/>
            </div>
            <button type="button" className="add-button" onClick={() => setShowModal(true)}> Add to My Games</button>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>User's Game Settings</h3>

            <label className="modal-label" htmlFor="status-select">Status</label>
            <select id="status-select" value={status} onChange={(e) => setStatus(e.target.value)} className="modal-select">
              <option>Completed</option>
              <option>In Progress</option>
              <option>Paused</option>
              <option>Dropped</option>
              <option>To Be Played</option>
            </select>
            <label className="modal-label">Rating: {rating.toFixed(1)}</label>
            <input type="range" min={0} max={10} step={0.1} value={rating} onChange={(e) => setRating(parseFloat(e.target.value))} className="modal-slider"/>
            <button type="button" className="modal-submit" onClick={addToUserGames}> Submit </button>
            <p className="submit-message" role="status" aria-live="polite">{submitMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadGame;