import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

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
        const response = await fetch(`${API_BASE}/api/user/games`, {
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
        const filteredGames = games.filter(game => game.status === status);

        if (filteredGames.length === 0) {
            return <p className="empty-column-message">No games in this category.</p>;
        }

        return filteredGames.map(game => (
            <Link to={`/game/${game.id}`} key={game.id} className="user-game-card">
                <img
                    src={game.coverUrl || "/default-game.png"}
                    alt={game.name}
                    className="user-game-cover"
                />
                {}
            </Link>
        ));
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

    return (
        <div className="game-container">
            <h1 className="page-title">Your Games List</h1>

            <div className="columns-wrapper">
                <div className="column">
                    <div className="column-title">Completed</div>
                    <div className="column-content">{gamesByStatus("completed")}</div>
                </div>

                <div className="column">
                    <div className="column-title">In Progress</div>
                    <div className="column-content">{gamesByStatus("in-progress")}</div>
                </div>

                <div className="column">
                    <div className="column-title">Paused</div>
                    <div className="column-content">{gamesByStatus("on-hold")}</div>
                </div>

                <div className="column">
                    <div className="column-title">Dropped</div>
                    <div className="column-content">{gamesByStatus("dropped")}</div>
                </div>

                <div className="column">
                    <div className="column-title">To Be Played</div>
                    <div className="column-content">{gamesByStatus("to-play")}</div>
                </div>
            </div>
        </div>
    );
}

export default LoadUserGames;