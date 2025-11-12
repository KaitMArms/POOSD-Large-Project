import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function LoadUserGames() {
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
    const fetchUserGames = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("No token found. Please log in.");
            setLoading(false);
            return;
        }

        try {
        const response = await fetch('https://playedit.games/api/user/games', {
            method: 'GET',
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Fetched user games:", data);
            const list = Array.isArray(data)
            ? data
            : Array.isArray(data.games)
            ? data.games
            : [];
            setGames(list);
        } else {
            const errorData = await response.json().catch(() => ({}));
            setError(errorData.message || "Failed to fetch user games.");
        }
        } catch (err) {
            setError("An error occurred while fetching user games.");
        } finally {
            setLoading(false);
        }
    };

    fetchUserGames();
    }, []);

    const gamesByStatus = (status: string) => {
    return games
        .filter(game => game.status === status)
        .map(game => (
        <div key={game.gameId} className="user-game-row">
            <Link to={`/game/${game.gameId}`} className="game-link"> {game.title}</Link>
        </div>
        ));
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

    return (
        <div>
            <span className="page-title">Your Games List</span><br />
            <div className="game-container">
            <div className="game-column">
                <span className="column-title">Completed</span>
                <span className="completed-games">{gamesByStatus('Completed')}</span>
            </div>
            <div className="game-column">
                <span className="column-title">In Progress</span>
                <span className="in-prog-games">{gamesByStatus('In Progress')}</span>
            </div>
            <div className="game-column">
                <span className="column-title">Paused</span>
                <span className="paused-games">{gamesByStatus('Paused')}</span>
            </div>
            <div className="game-column">
                <span className="column-title">Dropped</span>
                <span className="dropped-games">{gamesByStatus('Dropped')}</span>
            </div>
            <div className="game-column">
                <span className="column-title">To Be Played</span>
                <span className="to-play-games">{gamesByStatus('To Be Played')}</span>
            </div>
            </div>
        </div>
    );
}

export default LoadUserGames;