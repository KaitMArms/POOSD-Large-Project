//Component for recommend page with global game databse and ML
function LoadGlobalGame()
{
    return(
        <div id="page-container">
            <div id="recommend-games-container">
                <span id="rec-results"></span>
            </div>
            <div id="search-games">
                <input type="text" id="searchGamesInput" placeholder="Game Name here"/><br />
                <input type="submit" id="searchButton" className="buttons" value = "Do It"
                /*onClick={doSearchGame}*/ />
                <span id="searchResult"></span>
            </div>            
        </div>
    );
};
export default LoadGlobalGame;