import Mode from '../components/ColorMode.tsx';

// Loads page set up for user's personal game library and associated progress
// Sections: Completed, In Progress, Dropped, To Play
function LoadUserGames()
{
    return(
        //code inside container, display game in their proper catagories
        <div id="page-container">
            <span id="page-title">Your Games List</span><br />
            <div id="game-container">
                <div id="game-column">
                    <span id="column-title">Completed</span>
                    <span id="completed-games"></span>
                </div>
                <div id="game-column">
                    <span id="column-title">In Progress</span>
                    <span id="in-prog-games"></span>
                </div>
                <div id="game-column">
                    <span id="column-title">Paused</span>
                    <span id="paused-games"></span>
                </div>
                <div id="game-column">
                    <span id="column-title">Dropped</span>
                    <span id="dropped-games"></span>
                </div>
                <div id="game-column">
                    <span id="column-title">To Be Played</span>
                    <span id="to-play-games"></span>
                </div>
            </div>
        </div>
    );
};
export default LoadUserGames;