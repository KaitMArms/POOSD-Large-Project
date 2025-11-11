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
        const response = await fetch(`http://localhost:8080/api/game/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setGame(data);
        } else {
          setError("Failed to load game.");
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
    <div className="page-container">
    <div id="game-view-container">
      <img src={game.coverImageUrl} alt={game.title} id="game-cover" />

      <h1 id="game-title">{game.title}</h1>

      <p><strong>Genre:</strong> {game.genre}</p>
      <p><strong>Release Date:</strong> {game.releaseDate}</p>

      <p id="game-description">{game.description}</p>
    </div>
  </div>
  );
}

export default LoadGame;