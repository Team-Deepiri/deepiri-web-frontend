import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../contexts/AuthContext";

type Announcement = {
  id: string;
  title: string;
  body: string;
  authorName?: string;
  createdAt: string;
  color?: string;
};

// Only trust a strict "#rrggbb" shape as a literal style value -- this comes from
// the API (ultimately a Discord embed color relayed through Norozo), never render
// anything else as CSS.
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const Announcements: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Announcement[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = () => {
    axiosInstance
      .get("/announcements")
      .then((r) => setItems(r.data?.announcements ?? r.data ?? []))
      .catch((e) => setError(e.response?.status === 404 ? "not-wired" : e.message));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setPosting(true);
    try {
      await axiosInstance.post("/announcements", { title, body });
      setTitle("");
      setBody("");
      load();
    } catch {
      // backend route not live yet — nothing to do but leave the form as-is
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="container px-3" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 className="text-black" style={{ fontWeight: 800, fontSize: "1.6rem" }}>
        Announcements
      </h1>
      <p style={{ color: "#616a77", marginBottom: 24 }}>
        Company-wide posts — the replacement for scattered Discord announcements.
      </p>

      {user && (
        <form onSubmit={submit} className="card-modern p-4 mb-4">
          <input
            className="form-control mb-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="form-control mb-2"
            placeholder="What's the announcement?"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button className="btn-modern btn-deepiri px-4 py-2" disabled={posting}>
            {posting ? "Posting…" : "Post announcement"}
          </button>
        </form>
      )}

      {error === "not-wired" && (
        <div className="deepiri-panel is-soft p-4" style={{ color: "#616a77" }}>
          The announcements API isn't live on the backend yet — this page is wired and ready
          for a <code>GET/POST /api/announcements</code> route.
        </div>
      )}
      {error && error !== "not-wired" && (
        <div className="deepiri-panel is-soft p-4">Couldn't load announcements ({error}).</div>
      )}
      {items && items.length === 0 && !error && (
        <div className="deepiri-panel is-soft p-4" style={{ color: "#616a77" }}>
          No announcements yet.
        </div>
      )}
      {items?.map((a) => (
        <div
          key={a.id}
          className="card-modern p-4 mb-3"
          style={
            a.color && HEX_COLOR_RE.test(a.color) ? { borderLeft: `4px solid ${a.color}` } : undefined
          }
        >
          <div style={{ fontWeight: 700 }}>{a.title}</div>
          <div style={{ color: "#616a77", margin: "6px 0" }}>{a.body}</div>
          <div style={{ fontSize: 12, color: "#9aa4ae" }}>
            {a.authorName ?? "Unknown"} · {new Date(a.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Announcements;
