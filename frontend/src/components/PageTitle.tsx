//Title of the website plus global nav
function PageTitle()
{
    // Add links when actual domain and website is set up
    return(
        <div id='title-container'>
            <h1 id="title">PlayedIt</h1>
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