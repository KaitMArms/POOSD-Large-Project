import { useState, useEffect } from 'react';

//Component for recommend page with global game databse and ML
function LoadGlobalGame()
{
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
                const response = await fetch('http://localhost:8080/api/globalgames/recommended', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setRecommendedGames(data);
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || "Failed to fetch recommended games.");
                }
            } catch (err) {
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
            const response = await fetch(`http://localhost:8080/api/globalgames/search?q=${searchQuery}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSearchedGames(data);
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to search for games.");
            }
        } catch (err) {
            setError("An error occurred while searching for games.");
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return(
        <div id="page-container">
            <div id="recommend-games-container">
                <h2>Recommended Games</h2>
                <div id="rec-results">
                    {recommendedGames.map(game => (
                        <div key={game.id}>{game.name}</div>
                    ))}
                </div>
            </div>
            <div id="search-games">
                <input type="text" id="searchGamesInput" placeholder="Game Name here" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/><br />
                <input type="submit" id="searchButton" className="buttons" value = "Search"
                onClick={doSearchGame} />
                <div id="searchResult">
                    {searchedGames.map(game => (
                        <div key={game.id}>{game.name}</div>
                    ))}
                </div>
            </div>            
        </div>
    );
};
export default LoadGlobalGame;