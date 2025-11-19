
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

function formatUnixDate(unixSeconds: number | null | undefined): string {
  if (!unixSeconds || typeof unixSeconds !== "number") return "Unknown";
  try {
    const d = new Date(unixSeconds * 1000);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown";
  }
}

type GlobalGame = {
  id?: number | string;
  name?: string;
  summary?: string;
  slug?: string;
  coverUrl?: string | null;
  bannerUrl?: string | null;
  genres?: (string | number)[] | null;
  first_release_date?: number | null;
  isLiked?: boolean;
};

function LoadGame() {
  console.log("Result from useParams():", useParams());


  const [game, setGame] = useState<GlobalGame | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [status, setStatus] = useState<string>("to-play");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [modalIsLiked, setModalIsLiked] = useState<boolean>(!!game?.isLiked);
  const { slug } = useParams<{ slug?: string }>();

  useEffect(() => {
    let cancelled = false;

    const fetchGame = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }
      console.log(slug);
      if (!slug) {
        setError("Invalid Slug.");
        setLoading(false);
        return;
      }

      try {
        const resp = await fetch(`${API_BASE}/api/globalgames/${slug}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          setError(text || `Failed to load game (status ${resp.status}).`);
          setLoading(false);
          return;
        }

        const data = (await resp.json()) as GlobalGame;
        if (!cancelled) {
          setGame(data);
          setModalIsLiked(!!data.isLiked);
        }
      } catch (e) {
        if (!cancelled) setError("Error fetching game details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchGame();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const addToUserGames = async (): Promise<void> => {
    setSubmitMessage("");
    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitMessage("You must be logged in.");
      return;
    }
    if (!game || !game.id) {
      setSubmitMessage("No game id.");
      return;
    }

    const gameIdToSend = game.id;

    try {
      const resp = await fetch(`${API_BASE}/api/user/games/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: gameIdToSend,
          name: game?.name,
          status,
          rating,
          isLiked: modalIsLiked,
        }),
      });

      if (resp.ok) {
        setSubmitMessage("Game added to your list!");
        setShowModal(false);
      } else {
        const contentType = resp.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await resp.json().catch(() => ({}));
          setSubmitMessage(json?.message || `Could not add game (status ${resp.status}).`);
        } else {
          const text = await resp.text().catch(() => "");
          setSubmitMessage(text || `Could not add game (status ${resp.status}).`);
        }
      }
    } catch (err) {
      setSubmitMessage("Network error.");
    }
  };

  // const likeGame = async (): Promise<void> => {
  //   setSubmitMessage("");
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     setSubmitMessage("You must be logged in.");
  //     return;
  //   }
  //   if (!id) {
  //     setSubmitMessage("No game id.");
  //     return;
  //   }

  //   const pathId = numericId ?? id;

  //   try {
  //     const resp = await fetch(`${API_BASE}/api/user/games/${pathId}/like`, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     if (resp.ok) {
  //       setGame((prev) => {
  //         if (!prev) return prev;
  //         return { ...prev, isLiked: !prev.isLiked };
  //       });

  //       try {
  //         const updated = await resp.json().catch(() => null);
  //         if (updated && typeof updated.isLiked === "boolean") {
  //           setGame((prev) => (prev ? { ...prev, isLiked: updated.isLiked } : prev));
  //         }
  //       } catch (e) {
  //         console.warn("Failed to parse like response JSON:", e);
  //       }
  //     } else {
  //       const contentType = resp.headers.get("content-type") || "";
  //       if (contentType.includes("application/json")) {
  //         const json = await resp.json().catch(() => ({}));
  //         setSubmitMessage(json?.message || `Could not like game (status ${resp.status}).`);
  //       } else {
  //         const text = await resp.text().catch(() => "");
  //         setSubmitMessage(text || `Could not like game (status ${resp.status}).`);
  //       }
  //     }
  //   } catch (err) {
  //     setSubmitMessage("Network error.");
  //   }
  // };

  if (loading) return <div>Loading game...</div>;
  if (error) return <div style={{ color: "var(--text-color)" }}>Error: {error}</div>;
  if (!game) return <div>Game not found.</div>;

  const coverUrl = game.bannerUrl || game.coverUrl || "/default-game.png";
  const releaseDate = formatUnixDate(
    typeof game.first_release_date === "number" ? game.first_release_date : null
  );

  return (
    <div className="game-view-container">
      <div className="game-feature-wrapper">
        <div className="added-feature-container">
          <div className="added-info">
            <h2 className="added-title">{game.name}</h2>
            <img src={coverUrl} className="added-image" alt={game.name ?? "cover"} />

            <p><strong>Release Date:</strong> {releaseDate}</p>

            <div className="added-field">
              <strong>Genres:</strong>{" "}
              {Array.isArray(game.genres) ? game.genres.join(", ") : String(game.genres ?? "Unknown")}
            </div>

            <div className="added-description">{game.summary || "No description available."}</div>

            <button type="button" className="add-button" onClick={() => setShowModal(true)}>
              Add to My Games
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>User's Game Settings</h3>

            <label className="modal-label">Status</label>
            <select className="added-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">Paused</option>
              <option value="dropped">Dropped</option>
              <option value="to-played">To Be Played</option>
            </select>

            <label className="modal-label">Rating: {rating.toFixed(1)}</label>
            <input
              type="range"
              min={0}
              max={10}
              step={0.1}
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value))}
              className="modal-slider"
            />

            <div className="modal-checkbox">
              <input
                type="checkbox"
                id="like-checkbox"
                checked={modalIsLiked}
                onChange={(e) => setModalIsLiked(e.target.checked)}
              />
              <label htmlFor="like-checkbox">Like this game?</label>
            </div>

            <button type="button" className="modal-submit" onClick={addToUserGames}>
              Submit
            </button>

            <p className="submit-message" role="status" aria-live="polite">{submitMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadGame;