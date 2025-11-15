import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../pages/DevUserProfile.css";
import AddDevGame from "../components/AddDevGame";

type LoadDevUserProps = {
  event: boolean;
};

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

const LoadDevUser: React.FC<LoadDevUserProps> = ({ event }) => {
  const [devGames, setDevGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!event) return;

    const fetchDevGames = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        // matches dev.routes.js -> router.get('/games/view', viewGames);
        const response = await fetch(`${API_BASE}/api/dev/games/view`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched developer games:", data);
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data.games)
            ? data.games
            : [];
          setDevGames(list);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(
            errorData.message ||
              errorData.error ||
              "Failed to fetch developer games."
          );
        }
      } catch (err) {
        console.error("Error fetching dev games:", err);
        setError("An error occurred while fetching developer games.");
      } finally {
        setLoading(false);
      }
    };

    fetchDevGames();
  }, [event]);

  const handleAddGame = () => {
    setAdding(true);
  };

  if (!event) return null;

  // When adding, show the full AddDevGame form
  if (adding)
    return (
      <AddDevGame
        onClose={() => {
          setAdding(false);
          // easiest: reload for now; later we can refetch instead
          window.location.reload();
        }}
      />
    );

  if (loading) return <div>Loading your games...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div className="dev-game-container">
      <h1 className="page-title">Your Games in Development</h1>

      <div className="dev-games-container">
        <div className="dev-section-header">
          <h2 className="section-title">My Development Games</h2>
          <button className="add-game-button" onClick={handleAddGame}>
            + Add New Game
          </button>
        </div>

        <div className="columns-wrapper">
          {devGames.length > 0 ? (
            devGames.map((game) => (
              <div key={game.id || game.gameId} className="dev-game-row">
                <Link
                  to={`/game/${game.id || game.gameId}`}
                  className="game-link"
                >
                  {game.name || game.title}
                </Link>
              </div>
            ))
          ) : (
            <p>No games currently in development.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadDevUser;
