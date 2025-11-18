import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Select from 'react-select';

const gameTypeOptions = [
  { value: '0', label: 'Main Game' },
  { value: '8', label: 'Remake' },
  { value: '9', label: 'Remaster' },
  { value: '4', label: 'Standalone Expansion' },
  { value: '10', label: 'Expanded Game' },
  { value: '2', label: 'Expansion' },
  { value: '1', label: 'DLC' },
  { value: '3', label: 'Bundle' },
  { value: '5', label: 'Mod' },
  { value: '6', label: 'Episode' },
  { value: '7', label: 'Season' },
  { value: '11', label: 'Port' },
  { value: '12', label: 'Fork' },
  { value: '13', label: 'Pack / Addon' },
  { value: '14', label: 'Update' }
];


const defaultGameTypeFilters = [
  gameTypeOptions.find(opt => opt.value === '0'),
  gameTypeOptions.find(opt => opt.value === '8')
].filter(Boolean);

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

function LoadGlobalGame() {
  const [selectedGameTypes, setSelectedGameTypes] = useState(defaultGameTypeFilters);
  const [recommendedGames, setRecommendedGames] = useState<any[]>([]);
  const [searchedGames, setSearchedGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratedOnly, setRatedOnly] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecommendedGames = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${BASE_URL}/api/globalgames/browse/recommended`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Recommend API Response: ", data);
          const list = Array.isArray(data.recommendations)
            ? data.recommendations.map((rec: any) => rec.game).filter(Boolean)
            : [];
          setRecommendedGames(list);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.message || "Failed to fetch recommended games.");
        }
      } catch {
        setError("An error occurred while fetching recommended games.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedGames();
  }, []);

  const [isSearching, setIsSearching] = useState(false);

  const doSearchGame = async () => {
    const q = (searchQuery || "").trim();
    if (!q) {
      setSearchedGames([]);
      setError(null);
      console.log("Search skipped: empty query");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }

    try {
      setError(null);
      setIsSearching(true);
      setSearchedGames([]);
      console.log(`Searching for: "${q}"`);

      const urlParams = new URLSearchParams({ q });

      let filtersToUse = selectedGameTypes;

      if (selectedGameTypes.length === 0) {
        filtersToUse = defaultGameTypeFilters;
      }
      if (filtersToUse.length > 0) {
        filtersToUse.forEach(option => {
          if (option) {
            urlParams.append('game_types', option.value);
          }
        });
      }
      if (ratedOnly) {
        urlParams.append('ratedOnly', 'true');
      }

      const url = `${BASE_URL}/api/globalgames/search?${urlParams.toString()}`;
      console.log("Search URL:", url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        setError(errorBody?.message || `Search failed (${response.status})`);
        return;
      }

      const data = await response.json();
      const list = Array.isArray(data.data) ? data.data : [];
      setSearchedGames(list);

    } catch (err) {
      console.error("Search threw error:", err);
      setError("An error occurred while searching for games.");
    } finally {
      setIsSearching(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div className="game-container">
      <h1 className="page-title">Global Games</h1>
      <div className="components-container">
        <div className="recommend-games-container">
          <h2 className="section-title">Recommended Games</h2>
          {}
          <div className="columns-wrapper">
            {recommendedGames.length > 0 ? (
              recommendedGames.map((game) => (
                <div key={game._id} className="user-game-row">
                  <Link to={`/game/${game.id}`} className="game-link">
                    <img
                      src={game.coverUrl || "/default-game.png"}
                      alt={game.name}
                      className="search-result-thumbnail"
                    />
                    <div className="game-title-container">
                      {game.name}
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <p>No recommended games found.</p>
            )}
          </div>
        </div>
        <div className="search-games">
          <h2 className="section-title">Search Global Games</h2>
          <div className="search-bar">
            <input
              type="text"
              id="searchGamesInput"
              placeholder="Enter game name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              id="searchButton"
              className="buttons"
              onClick={doSearchGame}
              disabled={isSearching}
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
            <div className="search-filters-dropdown">
              <label>Filter by Game Type:</label>
              <Select
                isMulti // This enables multi-select
                options={gameTypeOptions}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select game types..."
                value={selectedGameTypes}
                onChange={(selectedOptions: any) => {
                  setSelectedGameTypes(selectedOptions as any);
                }}
              />
            </div>
            <div className="search-filter-checkbox">
              <input
                type="checkbox"
                id="ratedOnlyCheckbox"
                checked={ratedOnly}
                onChange={(e) => setRatedOnly(e.target.checked)}
              />
              <label htmlFor="ratedOnlyCheckbox">Show only games with age ratings</label>
            </div>
          </div>

          <div className="columns-wrapper">
            {searchedGames.length > 0 ? (
              searchedGames.map((game) => (
                <div key={game._id} className="user-game-row">
                  <div className="game-title-container">
                    <Link to={`/game/${game.id}`} className="game-link"> {game.name}</Link>
                  </div>
                  <img
                    src={game.coverUrl || "/default-game.png"}
                    alt={game.name}
                    className="search-result-thumbnail"
                  />
                </div>
              ))
            ) : (
              searchQuery && <p>No games found for your search.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadGlobalGame;