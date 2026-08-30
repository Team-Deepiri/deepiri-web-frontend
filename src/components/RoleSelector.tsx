import React from 'react';
import { ROLE_OPTIONS } from '../types/roles';
import type { DeepiriRole } from '../types/roles';
import { setStoredRole } from '../utils/roles';

interface Props {
  value: DeepiriRole | null;
  onChange: (r: DeepiriRole) => void;
}

const RoleSelector: React.FC<Props> = ({ value, onChange }) => {
  const handle = (r: DeepiriRole) => {
    setStoredRole(r);
    onChange(r);
  };

  return (
    <div className="d-flex flex-column gap-2">
      <label className="small fw-semibold text-muted" style={{ letterSpacing: '0.5px' }}>DEEPIRI ROLE</label>
      <div className="d-flex flex-wrap gap-2">
        {ROLE_OPTIONS.map(o => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              onClick={() => handle(o.value)}
              className="px-3 py-2 rounded-pill border small fw-semibold"
              style={{
                background: active ? '#7c3aed' : 'white',
                color: active ? 'white' : '#374151',
                borderColor: active ? '#7c3aed' : '#e5e7eb',
                transition: '0.15s',
              }}
            >
              <div>{o.label}</div>
              <div style={{ fontSize: '0.70rem', opacity: active ? 0.9 : 0.6, fontWeight: 400 }}>{o.hint}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;
