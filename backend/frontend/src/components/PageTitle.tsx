//Title of the website plus global nav 
function PageTitle()
{
    // Add links when actual domain and website is set up
    return(
        <div id='titleContainer'>
            <h1 id="title">My Game List(working title)</h1>
            <nav>
                <a href="">Profile</a>
                <a href="">My Games</a>
                <a href="">All Games</a>
                <a href="">Sign Out</a>
            </nav>
        </div>
    );
};

export default PageTitle;