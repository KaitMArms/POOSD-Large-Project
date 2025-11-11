import { useState, useEffect } from 'react';

// Loads page set up for user's personal game library and associated progress
// Sections: Completed, In Progress, Dropped, To Play
function LoadUserGames()
{
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
                const response = await fetch('http://localhost:8080/api/user/games', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setGames(data);
                } else {
                    const errorData = await response.json();
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
        return games.filter(game => game.status === status).map(game => (
            <div key={game.gameId}>{game.title}</div>
        ));
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return(
        //code inside container, display game in their proper catagories
        <div id="page-container">
            <span id="page-title">Your Games List</span><br />
            <div id="game-container">
                <div id="game-column">
                    <span id="column-title">Completed</span>
                    <span id="completed-games">{gamesByStatus('Completed')}</span>
                </div>
                <div id="game-column">
                    <span id="column-title">In Progress</span>
                    <span id="in-prog-games">{gamesByStatus('In Progress')}</span>
                </div>
                <div id="game-column">
                    <span id="column-title">Paused</span>
                    <span id="paused-games">{gamesByStatus('Paused')}</span>
                </div>
                <div id="game-column">
                    <span id="column-title">Dropped</span>
                    <span id="dropped-games">{gamesByStatus('Dropped')}</span>
                </div>
                <div id="game-column">
                    <span id="column-title">To Be Played</span>
                    <span id="to-play-games">{gamesByStatus('To Be Played')}</span>
                </div>
            </div>
        </div>
    );
};
export default LoadUserGames;