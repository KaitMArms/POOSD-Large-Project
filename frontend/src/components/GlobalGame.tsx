import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

function LoadGlobalGame() {
  const [recommendedGames, setRecommendedGames] = useState<any[]>([]);
  const [searchedGames, setSearchedGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRecommendedGames = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("No token found. Please log in.");
            setLoading(false);
            return;
        }

        try {
        const response = await fetch(
            `https://playedit.games/api/globalgames/recommended`,
            {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
            }
        );

        if (response.ok) {
            const data = await response.json();

            const list = Array.isArray(data.games) ? data.games : [];

            setRecommendedGames(list);
        } else {
            const errorData = await response.json().catch(() => ({}));
            setError(errorData.message || "Failed to fetch recommended games.");
        }
        } catch {
            setError("An error occurred while fetching recommended games.");
        } finally {
            setLoading(false);
        }
    };

    fetchRecommendedGames();
  }, []);

  const doSearchGame = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }

    try {
      const response = await fetch(
        `https://playedit.games/api/globalgames/search?q=${encodeURIComponent(searchQuery)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();

        const list = Array.isArray(data.data) ? data.data : [];

        setSearchedGames(list);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Failed to search for games.");
      }
    } catch {
      setError("An error occurred while searching for games.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div className="game-container">
      <h1 className="page-title">Global Games</h1>
      <div className="recommend-games-container">
        <h2 className="section-title">Recommended Games</h2>
        <div className="columns-wrapper">
          {recommendedGames.length > 0 ? (
            recommendedGames.map((game) => (
              <div key={game._id} className="user-game-row">
                <Link to={`/game/${game._id}`} className="game-link">
                  {game.name}
                </Link>
              </div>
            ))
          ) : (
            <p>No recommended games found.</p>
          )}
        </div>
      </div>
      <div className="search-games">
        <h2 className="section-title">Search Global Games</h2>
        <div className="search-bar">
          <input
            type="text"
            id="searchGamesInput"
            placeholder="Enter game name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button id="searchButton" className="buttons" onClick={doSearchGame}>
            Search
          </button>
        </div>

        <div className="columns-wrapper">
          {searchedGames.length > 0 ? (
            searchedGames.map((game) => (
              <div key={game._id} className="user-game-row">
                <Link to={`/game/${game._id}`} className="game-link">
                  {game.name}
                </Link>
              </div>
            ))
          ) : (
            searchQuery && <p>No games found for your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoadGlobalGame;