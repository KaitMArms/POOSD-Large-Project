import { useState, type FormEvent, type ChangeEvent } from "react";

export interface EditUserProps {
  initial: ProfileUser;
  onClose: () => void;
}

export interface ProfileUser {
  username: string;
  email: string;
  avatarUrl?: string | null;
  firstName: string;
  lastName: string;
  bio?: string | null;
  role: "user" | "dev";
}
export interface ProfileUpdateRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string | null;
}

export interface ProfileUpdateResponse {
  success: true;
  user: ProfileUser;
}

// 🔹 helper to resolve avatar URL (dev + prod)
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

function resolveAvatarUrl(url?: string | null): string {
  if (!url || url.trim() === "") return "/Mascot.png";
  if (url.startsWith("/uploads")) return `${API_BASE}${url}`;
  return url;
}

async function request<T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`https://playedit.games/api${path}`, {
    ...opts,
    headers,
  });

  const text = await res.text();
  // parse JSON when available
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    // pick error when applicable
    const errMsg =
      (body && (body.message || (body as any).error)) ||
      res.statusText ||
      "Request failed";
    const err: any = new Error(errMsg);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body as T;
}

async function updateProfile(
  payload: ProfileUpdateRequest
): Promise<ProfileUpdateResponse> {
  return request<ProfileUpdateResponse>("/user/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export default function EditUser({ initial, onClose }: EditUserProps) {
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl || "/Mascot.png");
  const [, setSaving] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [, setSuccess] = useState(false);

  // Upload avatar file -> POST /api/user/avatar
  async function handleAvatarFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("https://playedit.games/api/user/avatar", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          (data && (data.message || data.error)) ||
          "Failed to upload avatar.";
        throw new Error(msg);
      }

      // Backend returns { success, user: { ... } }
      setAvatarUrl(data.user.avatarUrl || "/Mascot.png");
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Error uploading avatar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    const payload: ProfileUpdateRequest = {
      firstName,
      lastName,
      username,
      bio,
      avatarUrl: avatarUrl || null,
    };

    try {
      await updateProfile(payload);
      setSuccess(true);
      // Let the parent re-fetch via onClose
      setTimeout(() => onClose(), 700);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="edit-user-container">
      <span id="inner-title">Edit User Details</span>

      <div className="edit-user-grid">
        {/* LEFT: avatar circle + upload */}
        <div className="edit-user-left">
          <div className="edit-user-avatar-wrapper">
            <img
              src={resolveAvatarUrl(avatarUrl)}
              alt="Avatar preview"
              className="edit-user-avatar"
              loading="lazy"
            />
          </div>

          <label className="edit-user-avatar-upload">
            <span>Change Avatar</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
            />
          </label>
        </div>

        {/* RIGHT: fields + bio */}
        <div className="edit-user-right">
          <div className="edit-user-fields">
            <input
              type="text"
              id="loginName"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="text"
              id="firstName"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              id="lastName"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="edit-user-bio">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              placeholder="I am a gamer!"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={6}
            />
          </div>
        </div>
      </div>

      <div id="signUpButtonsDiv">
        <input
          type="submit"
          id="submitButton"
          className="buttons"
          value="Submit"
        />
        <input
          type="button"
          id="cancelButton"
          className="buttons"
          value="Cancel"
          onClick={onClose}
        />
      </div>
    </form>
  );
}
