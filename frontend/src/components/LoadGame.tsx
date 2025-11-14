import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function GamePage() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://playedit.games/api/globalgames/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

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

  if (loading) return <div>Loading game...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!game) return <div>Game not found.</div>;

  return (
    <div className="game-view-container">
      {game.coverImageUrl && (
        <img src={game.coverImageUrl} alt={game.title} id="game-cover" />
      )}

      <h1 id="game-title">{game.title}</h1>

      <p><strong>Genre:</strong> {game.genre || "Unknown"}</p>
      <p><strong>Release Date:</strong> {game.releaseDate || "Unknown"}</p>

      <p id="game-description">
        {game.description || "No description provided."}
      </p>
    </div>
  );
}

export default GamePage;