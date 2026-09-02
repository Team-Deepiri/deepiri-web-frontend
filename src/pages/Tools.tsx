import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserRole } from '../utils/roles';
import { getToolsForRole } from '../data/tools';
import { Shield } from 'lucide-react';

type ToolItem = ReturnType<typeof getToolsForRole>[number];

const Section: React.FC<{ title: string; items: ToolItem[] }> = ({ title, items }) => {
  if (items.length === 0) return null;
  return (
    <div className="mb-4">
      <div className="small text-muted mb-2" style={{ letterSpacing: '0.5px', fontWeight: 600 }}>{title}</div>
      <div className="row g-3">
        {items.map(t => {
          const Icon = t.icon;
          const isExternal = t.route.startsWith('http');
          const CardInner = (
            <>
              <div className="d-flex align-items-center gap-2">
                <span className="d-inline-flex align-items-center justify-content-center rounded-3" style={{ width: 36, height: 36, background: `${t.color}15`, color: t.color }}>
                  <Icon size={18} />
                </span>
                <span className="fw-semibold text-dark small" style={{ lineHeight: 1.2 }}>{t.label}</span>
              </div>
              <div className="small text-muted" style={{ lineHeight: 1.5 }}>{t.description}</div>
              <div className="mt-auto small text-primary fw-semibold">{isExternal ? 'Open ↗' : 'Open →'}</div>
            </>
          );
          return (
            <div key={t.id} className="col-6 col-md-4 col-lg-3">
              {isExternal ? (
                <a href={t.route} target="_blank" rel="noreferrer" className="card-modern bg-white p-4 h-100 text-decoration-none d-flex flex-column gap-2" style={{ borderTop: `3px solid ${t.color}` }}>
                  {CardInner}
                </a>
              ) : (
                <Link to={t.route} className="card-modern bg-white p-4 h-100 text-decoration-none d-flex flex-column gap-2" style={{ borderTop: `3px solid ${t.color}` }}>
                  {CardInner}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Tools: React.FC = () => {
  const { user, deepiriRole } = useAuth();
  const role = deepiriRole || getUserRole(user);
  const tools = getToolsForRole(role);

  const grouped = {
    comms: tools.filter(t => t.category === 'comms'),
    catalog: tools.filter(t => t.category === 'catalog'),
    dev: tools.filter(t => t.category === 'dev'),
    ops: tools.filter(t => t.category === 'ops'),
  };

  if (!role) {
    return (
      <div className="min-vh-100 bg-gray-50">
        <div className="container px-3 py-5 text-center">
          <Shield size={32} className="mx-auto mb-3 text-muted" />
          <h2>Pick your role first</h2>
          <p className="text-muted">Go to Profile → select your Deepiri role to see your tools.</p>
          <Link to="/profile" className="btn btn-primary mt-2">Go to Profile</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-gray-50">
      <div className="container px-3 py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h1 className="h3 mb-1">Tools</h1>
            <div className="small text-muted">Grid of tools for your role — each spawns its own instance. Admin sees all.</div>
          </div>
          <span className="badge rounded-pill bg-dark">{tools.length} tools</span>
        </div>

        <Section title="Comms" items={grouped.comms} />
        <Section title="Catalog" items={grouped.catalog} />
        <Section title="Dev" items={grouped.dev} />
        <Section title="Ops" items={grouped.ops} />

        <div className="card-modern bg-white p-3 mt-4 d-flex align-items-center gap-2 small text-muted">
          <Shield size={14} /> Role <strong>{role}</strong> — IT/Admin/Leadership see all tools. Change in Profile.
          <Link to="/profile" className="ms-auto btn btn-sm btn-outline-secondary">Change role</Link>
        </div>
      </div>
    </div>
  );
};

export default Tools;
