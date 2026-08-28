import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { Megaphone } from 'lucide-react';

const CreateAnnouncementTool: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return toast.error('Title and body required');
    setSending(true);
    try {
      await axiosInstance.post('/announcements', { title: title.trim(), body: body.trim() });
      toast.success('Announcement posted — will appear on Dashboard and via Norozo → Discord');
      setTitle('');
      setBody('');
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to post';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-vh-100 bg-gray-50">
      <div className="container px-3 py-4" style={{ maxWidth: 720 }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="d-inline-flex align-items-center justify-content-center rounded-3" style={{ width: 36, height: 36, background: '#7c3aed15', color: '#7c3aed' }}><Megaphone size={18} /></span>
          <div>
            <h1 className="h4 mb-0">Create Announcement</h1>
            <div className="small text-muted">Posts to dashboard window and is forwarded to Discord #announcements via Norozo (channel 1436509524818395156).</div>
          </div>
        </div>

        <form onSubmit={submit} className="card-modern bg-white p-4 d-flex flex-column gap-3">
          <div>
            <label className="form-label small fw-semibold">Title</label>
            <input className="form-control" placeholder="e.g. Platform outage Saturday 2am EST" value={title} onChange={e => setTitle(e.target.value)} maxLength={200} />
          </div>
          <div>
            <label className="form-label small fw-semibold">Body</label>
            <textarea className="form-control" rows={6} placeholder="Details, links, calendar URL..." value={body} onChange={e => setBody(e.target.value)} maxLength={4000} />
            <div className="small text-muted mt-1">Markdown supported. Norozo will forward verbatim to Discord.</div>
          </div>
          <div className="d-flex gap-2">
            <button type="submit" disabled={sending} className="btn btn-primary">{sending ? 'Posting…' : 'Post Announcement'}</button>
            <a href="/dashboard#announcements" className="btn btn-outline-secondary">View on Dashboard</a>
          </div>
        </form>

        <div className="alert alert-info small mt-3" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
          <strong>Norozo:</strong> Discord bot (token MTQ4...) watches #announcements (1436509524818395156) and POSTs to <code>/api/webhooks/norozo/announcements</code> with <code>X-Norozo-Secret</code>. This form and Norozo share the same feed.
        </div>
      </div>
    </div>
  );
};

export default CreateAnnouncementTool;
