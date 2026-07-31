import React from 'react';

type Props = {
  title: string;
  phase?: string;
  children?: React.ReactNode;
};

const PlaceholderPage: React.FC<Props> = ({ title, phase = 'Phase 4', children }) => (
  <div className="portal-placeholder">
    <h1>{title}</h1>
    <p>
      Routed and ready in the Phase 3 shell. Full visualization ships in {phase}.
    </p>
    {children}
  </div>
);

export default PlaceholderPage;
