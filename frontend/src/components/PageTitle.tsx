import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

type SearchUser = {
  _id?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: string;
};

function resolveAvatarUrl(url?: string | null): string {
  if (!url || url.trim() === "") return "/Mascot.png";
  if (url.startsWith("/uploads")) return `${API_BASE}${url}`;
  return url;
}

function PageTitle() {
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const toggleSearch = () => {
    setSearchOpen((prev) => !prev);
    setSearchError(null);
    setResults([]);
    setQuery("");
  };

  useEffect(() => {
    if (!searchOpen || !query.trim()) {
      setResults([]);
      setSearchError(null);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setSearchError("You must be logged in to search users.");
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const handle = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError(null);

        const resp = await fetch(
          `${API_BASE}/api/user/search?query=${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          setSearchError(data.message || "Failed to search users.");
          setResults([]);
        } else {
          const data = await resp.json().catch(() => ({}));
          const list = Array.isArray(data.users) ? data.users : [];
          setResults(list);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setSearchError("Error searching users.");
          setResults([]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 300); // debounce

    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [searchOpen, query]);

  const handleResultClick = (u: SearchUser) => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    navigate(`/user/${u.username}`);
  };

  return (
    <header className="title-container">
      <nav className="nav-bar">
        <div className="logo-section">
          <img
            className="mascot"
            src="/Mascot.png"
            alt="Controllie - PlayedIt's Mascot, he's a living breathing controller"
          />
          <h1 className="title">PlayedIt</h1>
        </div>

        <div className="nav-links">
          <Link to="/profile">Profile</Link>
          <Link to="/my-games">My Games</Link>
          <Link to="/all-games">All Games</Link>

          {/* Search Users dropdown trigger */}
          <div className="nav-user-search">
            <button
              type="button"
              className="nav-user-search-trigger"
              onClick={toggleSearch}
            >
              Search Users
            </button>

            {searchOpen && (
              <div className="nav-user-search-dropdown">
                <input
                  type="text"
                  className="nav-user-search-input"
                  placeholder="Search by username..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />

                {searchLoading && (
                  <div className="nav-user-search-status">Searching...</div>
                )}

                {searchError && (
                  <div className="nav-user-search-error">{searchError}</div>
                )}

                {!searchLoading && !searchError && query.trim() !== "" && (
                  <div className="nav-user-search-results">
                    {results.length === 0 ? (
                      <div className="nav-user-search-empty">
                        No users found.
                      </div>
                    ) : (
                      results.map((u) => (
                        <button
                          key={u._id || u.username}
                          type="button"
                          className="nav-user-search-item"
                          onClick={() => handleResultClick(u)}
                        >
                          <img
                            src={resolveAvatarUrl(u.avatarUrl)}
                            alt={`${u.username}'s avatar`}
                            className="nav-user-search-avatar"
                          />
                          <div className="nav-user-search-text">
                            <span className="nav-user-search-username">
                              {u.username}
                            </span>
                            {(u.firstName || u.lastName) && (
                              <span className="nav-user-search-name">
                                {(u.firstName || "") +
                                  (u.lastName ? ` ${u.lastName}` : "")}
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <Link to="/">Log Out</Link>
        </div>
      </nav>
    </header>
  );
}

export default PageTitle;
