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
        <div className="game-container">
            <h1 className="page-title">Your Games List</h1>

            <div className="columns-wrapper">
                <div className="column">
                    <div className="column-title">Completed</div>
                    <div className="column-content">{gamesByStatus("Completed")}</div>
                </div>

                <div className="column">
                    <div className="column-title">In Progress</div>
                    <div className="column-content">{gamesByStatus("In Progress")}</div>
                </div>

                <div className="column">
                    <div className="column-title">Paused</div>
                    <div className="column-content">{gamesByStatus("Paused")}</div>
                </div>

                <div className="column">
                    <div className="column-title">Dropped</div>
                    <div className="column-content">{gamesByStatus("Dropped")}</div>
                </div>

                <div className="column">
                    <div className="column-title">To Be Played</div>
                    <div className="column-content">{gamesByStatus("To Be Played")}</div>
                </div>

                <div className="column">
                    <div className="column-title">Liked Games</div>
                    <div className="column-content">{}</div> {/*Adding in proper link to liked games*/}
                </div>
            </div>
        </div>
    );
}

export default LoadUserGames;