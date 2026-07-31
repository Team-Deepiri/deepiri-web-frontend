import React from 'react';

const ITEMS: Array<{ key: string; label: string; hint: string }> = [
  { key: 'github', label: 'GitHub org access', hint: 'Team-Deepiri membership confirmed' },
  { key: 'env', label: 'Local env vars', hint: '.env with API / Hub / Cyrex URLs' },
  { key: 'clone', label: 'First clone', hint: 'deepiri-web-frontend (or platform) on disk' },
  { key: 'run', label: 'First run', hint: 'npm run dev (+ Hub) boots cleanly' },
];

type Props = {
  value: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
  onClose: () => void;
};

const AccessChecklist: React.FC<Props> = ({ value, onChange, onClose }) => {
  return (
    <div className="access-checklist-modal" role="dialog" aria-label="Access checklist" data-tour-id="tour-access-checklist">
      <div className="access-checklist-card">
        <h2>Access checklist</h2>
        {ITEMS.map((item) => (
          <label key={item.key}>
            <input
              type="checkbox"
              checked={Boolean(value[item.key])}
              onChange={(e) => onChange({ ...value, [item.key]: e.target.checked })}
            />
            <span>
              <strong>{item.label}</strong>
              <div style={{ color: '#8b949e', fontSize: '0.8rem' }}>{item.hint}</div>
            </span>
          </label>
        ))}
        <div className="access-checklist-actions">
          <button type="button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessChecklist;
