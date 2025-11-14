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
        const response = await fetch(`http://localhost:8080/api/globalgames/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        );

        if (!response.ok) {
          setError("Failed to load games.");
          setLoading(false);
          return;
        }

        const data = await response.json();
        const gameData = data.data.find((g: any) => g.id === parseInt(id || ""));
        if (gameData) {
          setGame(gameData);
        } else {
          setError("Game not found.");
        }
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

export default GamePage;