import {useState, type FormEvent} from "react";

export interface EditUserProps {
  initial: ProfileUser
  onClose: () => void;
}

// TODO: move this and other API calls to a central "api" and "types" file
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

export default function EditUser({initial, onClose}: {initial: ProfileUser; onClose: () => void;}) {
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl || "");
  const [, setSaving] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [, setSuccess] = useState(false);

async function request<T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`http://localhost:8080/api${path}`, {
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
  
  async function handleSubmit (e: FormEvent) {
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
        <form onSubmit={handleSubmit}>
            <div id="signUpDiv">
            <span id="inner-title">Edit User Details</span><br />
            <input type="text" id="avatarURL" placeholder="Avatar URL" onChange={(e) => setAvatarUrl(e.target.value)}/><br />
            <input type="text" id="loginName" placeholder="Username" onChange={(e) => setUsername(e.target.value)}/><br />  
            <input type="text" id="firstName" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)}/><br />
            <input type="text" id="lastName" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)}/><br />
            <input type="text" id="bio" placeholder="I am a gamer!" onChange={(e) => setBio(e.target.value)}/><br />
            </div>
            <div id="signUpButtonsDiv">
            <input type="submit" id="submitButton" className="buttons" value = "Submit" onClick={onClose} />
            <input type="Cancel" id="cancelButton" className="buttons" value = "Cancel" onClick={onClose} /> // todo: make this red or some other color that's good for indicating that it's 
            </div>
        </form>
    );
}

