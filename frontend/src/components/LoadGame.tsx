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
  coverUrl?: string | null;
  genres?: (string | number)[] | null;
  first_release_date?: number | null;
  isLiked?: boolean;
};

function LoadGame() {
  const { id } = useParams<{ id?: string }>();
  const [game, setGame] = useState<GlobalGame | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [status, setStatus] = useState<string>("To Be Played");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");

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

      if (!id) {
        setError("No game id provided.");
        setLoading(false);
        return;
      }

      try {
        const resp = await fetch(`${API_BASE}/api/globalgames/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          setError(text || "Failed to load game.");
          setLoading(false);
          return;
        }

        const data = (await resp.json()) as GlobalGame;
        if (!cancelled) setGame(data);
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
  }, [id]);

  const addToUserGames = async (): Promise<void> => {
    setSubmitMessage("");
    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitMessage("You must be logged in.");
      return;
    }
    if (!id) {
      setSubmitMessage("No game id.");
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/api/user/games/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: id,
          status,
          rating,
          isLiked: game?.isLiked,
        }),
      });

      if (resp.ok) {
        setSubmitMessage("Game added to your list!");
        setShowModal(false);
      } else {
        const json = await resp.json().catch(() => ({}));
        setSubmitMessage(json?.message || "Could not add game.");
      }
    } catch {
      setSubmitMessage("Network error.");
    }
  };

export default LoadGame;