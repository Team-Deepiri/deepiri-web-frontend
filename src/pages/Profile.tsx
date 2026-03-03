import React, { useState } from 'react';

const Profile: React.FC = () => {
  const [activeSection, setActiveSection] = useState('personal');
  const [viewMode, setViewMode] = useState(true);
  const [savedProfile, setSavedProfile] = useState({
    fullName: 'Johnathan P. Whitaker',
    title: 'General Counsel',
    email: 'j.whitaker@acme-global.com',
    phone: '+1 (212) 555-0147',
    company: 'Acme Global Corporation',
    department: 'Legal & Compliance',
  });
  const [draftProfile, setDraftProfile] = useState(savedProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sections = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'professional', label: 'Professional Information' },
    { id: 'preferences', label: 'Platform Preferences' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'integrations', label: 'Integrations & API' },
    { id: 'security', label: 'Security' },
    { id: 'analytics', label: 'Usage Analytics' },
    { id: 'billing', label: 'Billing & Subscription' }
  ];

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!draftProfile.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!draftProfile.email.trim()) newErrors.email = 'Email is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setSavedProfile(draftProfile);
      setViewMode(true);
      setErrors({});
    }
  };

  const styles = {
    wrapper: {
      backgroundColor: '#0b1020',
      minHeight: '100vh',
      padding: '40px 20px',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    },
    container: {
      maxWidth: '1100px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end'
    },
    sidebar: {
      backgroundColor: '#111827',
      borderRadius: '16px',
      padding: '12px',
      border: '1px solid rgba(255,255,255,0.05)',
      height: 'fit-content'
    },
    mainCard: {
      backgroundColor: '#111827',
      borderRadius: '24px',
      border: '1px solid rgba(255,255,255,0.05)',
      overflow: 'hidden'
    },
    navButton: (isActive: boolean) => ({
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: 'none',
      textAlign: 'left' as const,
      cursor: 'pointer',
      fontSize: '14px',
      transition: '0.2s',
      backgroundColor: isActive ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
      color: isActive ? '#a78bfa' : '#9ca3af',
      fontWeight: isActive ? '600' : '400'
    }),
    purpleBtn: {
      backgroundColor: '#7c3aed',
      color: 'white',
      padding: '10px 24px',
      borderRadius: '12px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      transition: '0.2s'
    },
    input: {
      width: '100%',
      backgroundColor: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
      padding: '12px',
      color: 'white',
      outline: 'none'
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Profile</h1>
            <p style={{ color: '#9ca3af', marginTop: '8px' }}>Manage your account and platform settings</p>
          </div>
          {activeSection === 'personal' && viewMode && (
            <button style={styles.purpleBtn} onClick={() => setViewMode(false)}>
              Edit Profile
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
          <aside style={styles.sidebar}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  style={styles.navButton(activeSection === s.id)}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </aside>

          <main style={styles.mainCard}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                {sections.find(s => s.id === activeSection)?.label}
              </h2>
            </div>

            <div style={{ padding: '32px' }}>
              {activeSection === 'personal' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {Object.entries(viewMode ? savedProfile : draftProfile).map(([key, value]) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                      {viewMode ? (
                        <p style={{ fontSize: '16px', margin: 0 }}>{value}</p>
                      ) : (
                        <input
                          style={styles.input}
                          value={value}
                          onChange={(e) => setDraftProfile({ ...draftProfile, [key]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!viewMode && (
                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button 
                    style={{ background: 'transparent', color: '#9ca3af', border: '1px solid #374151', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer' }}
                    onClick={() => setViewMode(true)}
                  >
                    Cancel
                  </button>
                  <button style={styles.purpleBtn} onClick={handleSave}>
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
