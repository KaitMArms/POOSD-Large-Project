import { Link } from "react-router-dom";

function PageTitle() {
  return (
    <header className="title-container">
      <nav className="nav-bar">
        <div className="logo-section">
          <img
            className="mascot"
            src="/Mascot.png"
            alt="Controllie - PlayedIt's Mascot, he's a living breathing controller"
            loading="lazy"
          />
          <h1 className="title">PlayedIt</h1>
        </div>

        <div className="nav-links">
          <Link to="/profile">Profile</Link>
          <Link to="/my-games">My Games</Link>
          <Link to="/all-games">All Games</Link>
          <Link to="/">Log Out</Link>
        </div>
      </nav>
    </header>
  );
}

export default PageTitle;