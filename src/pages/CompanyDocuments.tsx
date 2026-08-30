import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../contexts/AuthContext";

type Doc = {
  id: string;
  title: string;
  url: string;
  tag?: string;
  addedBy?: string;
  createdAt: string;
};

const CompanyDocuments: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Doc[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tag, setTag] = useState("");
  const [posting, setPosting] = useState(false);

  const load = () => {
    axiosInstance
      .get("/documents/links")
      .then((r) => setItems(r.data?.documents ?? r.data ?? []))
      .catch((e) => setError(e.response?.status === 404 ? "not-wired" : e.message));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    setPosting(true);
    try {
      await axiosInstance.post("/documents/links", { title, url, tag: tag || undefined });
      setTitle("");
      setUrl("");
      setTag("");
      load();
    } catch {
      // backend route not live yet
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="container px-3" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 className="text-black" style={{ fontWeight: 800, fontSize: "1.6rem" }}>
        Documents
      </h1>
      <p style={{ color: "#616a77", marginBottom: 24 }}>
        A shared directory of docs — Google Docs, Sheets, decks, wikis. Links out to the source of
        truth rather than duplicating it.
      </p>

      {user && (
        <form onSubmit={submit} className="card-modern p-4 mb-4 row g-2">
          <div className="col-md-4">
            <input className="form-control" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="col-md-5">
            <input className="form-control" placeholder="https://docs.google.com/…" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="col-md-2">
            <input className="form-control" placeholder="Tag (optional)" value={tag} onChange={(e) => setTag(e.target.value)} />
          </div>
          <div className="col-md-1">
            <button className="btn-modern btn-deepiri w-100 py-2" disabled={posting}>+</button>
          </div>
        </form>
      )}

      {error === "not-wired" && (
        <div className="deepiri-panel is-soft p-4" style={{ color: "#616a77" }}>
          The documents-directory API isn't live on the backend yet — this page is wired and ready
          for a <code>GET/POST /api/documents/links</code> route.
        </div>
      )}
      {error && error !== "not-wired" && (
        <div className="deepiri-panel is-soft p-4">Couldn't load documents ({error}).</div>
      )}
      {items && items.length === 0 && !error && (
        <div className="deepiri-panel is-soft p-4" style={{ color: "#616a77" }}>
          Nothing shared yet.
        </div>
      )}
      <div className="row g-3">
        {items?.map((d) => (
          <div key={d.id} className="col-md-4">
            <a href={d.url} target="_blank" rel="noreferrer" className="deepiri-miniCard h-100 deepiri-cardLift text-decoration-none d-block">
              <div className="deepiri-miniCardTitle">{d.title}</div>
              <div className="deepiri-miniCardBody">{d.tag ?? "doc"} · {d.addedBy ?? "unknown"}</div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyDocuments;
