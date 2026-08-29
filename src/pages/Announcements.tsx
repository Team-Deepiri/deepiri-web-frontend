import React, { useEffect, useState } from 'react';
import { announcementApi, Announcement } from '../api/announcementApi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Announcements: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const res = await announcementApi.getAnnouncements();
    if (res.success && (res.data as any)?.announcements) {
      setAnnouncements((res.data as any).announcements);
    } else if (res.success && Array.isArray((res.data as any))) {
      setAnnouncements((res.data as any));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
    const id = setInterval(fetchAnnouncements, 15000);
    return () => clearInterval(id);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !body.trim()) {
      toast.error('Title or body required');
      return;
    }
    setSubmitting(true);
    const res = await announcementApi.createAnnouncement({ title: title.trim() || body.trim().slice(0, 60), body: body.trim() || title.trim() });
    if (res.success) {
      toast.success('Announcement posted — mirrored to Discord #announcements via Norozo');
      setTitle('');
      setBody('');
      fetchAnnouncements();
    } else {
      toast.error(res.message || 'Failed to create');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Synced with Discord #announcements via Norozo • Platform ↔ Discord bidirectional</p>
        </div>

        {isAuthenticated && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-6 mb-8 border">
            <h2 className="font-semibold mb-3">Create announcement (posts to platform + Discord)</h2>
            <input
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="Title (first line also becomes Discord title)"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <textarea
              className="w-full border rounded px-3 py-2 mb-3 min-h-[100px]"
              placeholder="Body — this will appear on platform.deepiri.com and in Discord #announcements"
              value={body}
              onChange={e => setBody(e.target.value)}
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Announcement'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-gray-500">No announcements yet. Discord #announcements will appear here via Norozo.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(a => (
              <div key={a.id} className="bg-white rounded-xl shadow border p-5">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg">{a.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${a.source === 'discord' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                    {a.source === 'discord' ? 'from Discord' : 'from Platform'}
                  </span>
                </div>
                <p className="text-gray-700 mt-2 whitespace-pre-wrap">{a.body}</p>
                <div className="text-xs text-gray-500 mt-3 flex gap-4">
                  <span>{a.author || 'Unknown'} • {new Date(a.createdAt).toLocaleString()}</span>
                  {a.jumpUrl && <a href={a.jumpUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">View on Discord</a>}
                  {a.url && !a.jumpUrl && <a href={a.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Link</a>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-xs text-gray-500 bg-white p-4 rounded border">
          <strong>Norozo bridge:</strong> Discord #announcements (1436509524818395156) ↔ Platform via Norozo webhooks.
          <br />Discord POST → <code>POST https://platform.deepiri.com/api/webhooks/norozo/announcements</code> (HMAC) → platform list.
          <br />Platform POST → <code>POST $NOROZO_ANNOUNCEMENTS_WEBHOOK_URL</code> → Norozo <code>/announcements/webhook</code> → Discord #announcements.
        </div>
      </div>
    </div>
  );
};

export default Announcements;
