import { Link } from "react-router-dom";

//Title of the website plus global nav
function PageTitle()
{
    // Add links when actual domain and website is set up
    return(
        <div id='title-container'>
            <nav>
                <img src="/Mascot.png" alt="Controllie - PlayedIt's Mascot, he's a living breathing controller" />
                <h1 id="title">PlayedIt</h1>
                <Link to="/profile">Profile</Link>
                <Link to="/my-games">My Games</Link>
                <Link to="/all-games">All Games</Link>
                <Link to="/">Log Out</Link>
            </nav>
        </div>
    );
};

export default PageTitle;