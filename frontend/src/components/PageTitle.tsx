//Title of the website plus global nav
function PageTitle()
{
    // Add links when actual domain and website is set up
    return(
        <div id='title-container'>
            <h1 id="title">PlayedIt</h1>
            <nav>
                <a href="frontend\src\pages\UserProfilePage.tsx">Profile</a>
                <a href="frontend\src\pages\UserGamesPage.tsx">My Games</a>
                <a href="frontend\src\pages\GlobalGamesPage.tsx">All Games</a>
                <a href="frontend\src\pages\LoginPage.tsx">Sign Out</a>
            </nav>
        </div>
    );
};

export default PageTitle;