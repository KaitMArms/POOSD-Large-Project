import { useState, type ChangeEvent, type FormEvent } from "react";
import "../pages/DevUserProfile.css";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

type Props = {
  onClose?: () => void;
};

export default function AddDevGame({ onClose }: Props) {
  const [gameTitle, setGameTitle] = useState("");
  const [gameSummary, setGameSummary] = useState("");
  const [firstReleaseDate, setFirstReleaseDate] = useState("");
  const [platformIds, setPlatformIds] = useState<string[]>([]);
  const [genreIds, setGenreIds] = useState<string[]>([]);
  const [developerUsernames, setDeveloperUsernames] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState("In Development");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [gameURL, setGameURL] = useState("");

  function handleCoverUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const body = {
      gameTitle,
      gameSummary,
      firstReleaseDate,
      platformIds,
      genreIds,
      developerUsernames,
      gameStatus,
      description,
      coverImage,
      gameURL,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/dev/games/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to add game");

      alert("Game added!");
      onClose?.();
    } catch (err) {
      alert("Error adding game.");
      console.error(err);
    }
  }

  return (
    <div className="adddev-container">
      <h2 className="adddev-title">Add New Game</h2>

      <form className="adddev-form" onSubmit={handleSubmit}>
        <div className="adddev-grid">
          <div className="adddev-left">
            <div className="adddev-cover-wrapper">
              {coverImage ? (
                <img src={coverImage} className="adddev-cover" alt="Cover preview" loading="lazy" />
              ) : (
                <div className="adddev-cover-placeholder"></div>
              )}
            </div>

            <label className="adddev-upload-label">
              <span>Upload Cover</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                hidden
              />
            </label>
          </div>
          <div className="adddev-fields">
            <input type="text" placeholder="Game Title" value={gameTitle} onChange={(e) => setGameTitle(e.target.value)}required/>
            <input type="text" placeholder="Game Summary" value={gameSummary} onChange={(e) => setGameSummary(e.target.value)}/>
            <input type="date" value={firstReleaseDate} onChange={(e) => setFirstReleaseDate(e.target.value)} required/>
            <input type="text" placeholder="Game URL" value={gameURL} onChange={(e) => setGameURL(e.target.value)} />
            <input type="text" placeholder="Platform IDs (comma separated)" value={platformIds.join(",")} onChange={(e) => setPlatformIds(e.target.value.split(",").map((id) => id.trim()))}/>
            <input type="text" placeholder="Genre IDs (comma separated)" value={genreIds.join(",")} onChange={(e) => setGenreIds(e.target.value.split(",").map((id) => id.trim()))}/>
            <input type="text" placeholder="Developer Usernames (comma separated)" value={developerUsernames.join(",")} onChange={(e) => setDeveloperUsernames(e.target.value.split(",").map((u) => u.trim()))}/>
            <select value={gameStatus} onChange={(e) => setGameStatus(e.target.value)}>
              <option>In Development</option>
              <option>Released</option>
              <option>Cancelled</option>
            </select>
            <div className="adddev-description-box">
              <p className="adddev-description-title">Description</p>
              <textarea
                placeholder="Describe your game..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="adddev-buttons">
          <button type="submit" className="adddev-submit">Add Game</button>
          <button type="button" className="adddev-cancel" onClick={() => onClose?.()}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
