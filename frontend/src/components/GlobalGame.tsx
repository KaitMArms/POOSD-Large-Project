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

  const [isSearching, setIsSearching] = useState(false);

    const doSearchGame = async () => {
    // small guard: don't search empty queries
    const q = (searchQuery || "").trim();
    if (!q) {
        // keep previous behavior but show user feedback
        setSearchedGames([]);
        setError(null);
        console.log("Search skipped: empty query");
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        setError("No token found. Please log in.");
        return;
    }

    try {
        setError(null);
        setIsSearching(true);
        // clear previous results immediately so UI updates
        setSearchedGames([]);
        console.log(`Searching for: "${q}"`);

        const url = `https://playedit.games/api/globalgames/search?q=${encodeURIComponent(q)}`;
        console.log("Search URL:", url);

        const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
        });

        console.log("Search response status:", response.status);

        if (!response.ok) {
        // try to show the server error message if present
        const errorBody = await response.json().catch(() => ({}));
        const msg = errorBody?.message || `Search failed (${response.status})`;
        setError(msg);
        console.error("Search error response:", errorBody);
        setIsSearching(false);
        return;
        }

        const data = await response.json();
        console.log("Search response body:", data);

        const list =
        Array.isArray(data.data) ? data.data :
        Array.isArray(data.games) ? data.games :
        Array.isArray(data) ? data : // sometimes API returns straight array
        [];

        setSearchedGames(list);
        if (list.length === 0) {
        console.log("Search returned 0 results.");
        }
    } catch (err) {
        console.error("Search threw error:", err);
        setError("An error occurred while searching for games.");
    } finally {
        setIsSearching(false);
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
            <input type="text" id="searchGamesInput" placeholder="Enter game name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
            <button type="button" id="searchButton" className="buttons" onClick={doSearchGame} disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
            </button>
        </div>
        <div className="columns-wrapper">
          {searchedGames.length > 0 ? (
            searchedGames.map((game) => (
              <div key={game._id} className="user-game-row">
                <Link to={`/game/${game._id}`} className="game-link"> {game.name}</Link>
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