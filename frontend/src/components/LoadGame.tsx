import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function LoadGame() {
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
      {game.cover?.url && (
        <img src={game.cover.url.replace("t_thumb", "t_720p")} id="game-cover" />
      )}

      <h1 id="game-title">{game.name}</h1>

      <p><strong>Genre:</strong> {game.genres?.join(", ") || "Unknown"}</p>
      <p><strong>Release Date:</strong> {game.first_release_date || "Unknown"}</p>

      <p>{game.summary || "No description provided."}</p>

    </div>
  );
}

export default LoadGame;