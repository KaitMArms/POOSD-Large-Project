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
    const response = await fetch('https://playedit.games/api/globalgames/recommended', {
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const data = await response.json();
        console.log("Fetched recommended games:", data);
        const list = Array.isArray(data)
        ? data
        : Array.isArray(data.games)
        ? data.games
        : [];
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
            console.log("Fetched search results:", data);
            const list = Array.isArray(data)
                ? data
                : Array.isArray(data.games)
                ? data.games
                : [];
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
        <div className="global-games-page">
            <div className="recommend-games-container">
                <h2>Recommended Games</h2>
                <div className="rec-results">
                    {recommendedGames.length > 0 ? (
                        recommendedGames.map((game) => (
                            <Link key={game.id} to={`/game/${game.id}`} className="game-link">
                            {game.name}
                            </Link>
                        ))
                    ) : (
                        <p>No recommended games found.</p>
                    )}
                </div>
            </div>

        <div className="search-games">
            <h2>Search Global Games</h2>
            <input type="text" id="searchGamesInput" placeholder="Game name here" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
            <br />
            <input type="submit" id="searchButton" className="buttons" value="Search" onClick={doSearchGame}/>

            <div id="searchResult">
                {searchedGames.length > 0 ? (
                    searchedGames.map((game) => (
                        <Link key={game.id} to={`/game/${game.id}`} className="game-link">{game.name}</Link>
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