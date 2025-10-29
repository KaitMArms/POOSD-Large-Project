// Loads page set up for user's personal game library and associated progress
// Sections: Completed, In Progress, Dropped, To Play
function LoadUserGames()
{
    return(
        //code inside container, display game in their proper catagories
        <div id="GameContainer">
            <div id="completedGame">
                
            </div>
            <div id="inProgGame">
                
            </div>
            <div id="droppedGame">
                
            </div>
            <div id="toPlayGame">
                
            </div>
        </div>
    );
};
export default LoadUserGames;