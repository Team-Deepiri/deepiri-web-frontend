import React, { useMemo, useState } from 'react';

type SectionId =
  | 'personal'
  | 'professional'
  | 'preferences'
  | 'notifications'
  | 'integrations'
  | 'security'
  | 'analytics'
  | 'billing';

type FieldType = 'text' | 'email' | 'tel' | 'select' | 'toggle';

type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[]; // for select
  description?: string;
};

const Profile: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('personal');
  const [viewMode, setViewMode] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Personal
  const [savedProfile, setSavedProfile] = useState({
    fullName: 'Johnathan P. Whitaker',
    title: 'General Counsel',
    email: 'j.whitaker@acme-global.com',
    phone: '+1 (212) 555-0147',
    company: 'Acme Global Corporation',
    department: 'Legal & Compliance',
  });
  const [draftProfile, setDraftProfile] = useState(savedProfile);

  // Professional
  const [savedProfessional, setSavedProfessional] = useState({
    jobTitle: 'General Counsel',
    industry: 'Legal Services',
    yearsExperience: '10+',
    skills: 'Contract Law, Compliance, Risk Management',
    linkedin: 'linkedin.com/in/johnathanwhitaker',
    portfolio: 'https://acme-global.com',
    workPreference: 'Hybrid',
    location: 'New York, NY',
  });
  const [draftProfessional, setDraftProfessional] = useState(savedProfessional);

  // Preferences (toggles + selects)
  const [savedPreferences, setSavedPreferences] = useState({
    theme: 'Dark',
    language: 'English',
    timezone: 'UTC-05:00 (EST)',
    accessibility: 'Standard',
    autoSave: true,
    compactMode: false,
  });
  const [draftPreferences, setDraftPreferences] = useState(savedPreferences);

  // Notifications (toggles)
  const [savedNotifications, setSavedNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
    productUpdates: true,
  });
  const [draftNotifications, setDraftNotifications] = useState(savedNotifications);

  // Integrations (toggles + text)
  const [savedIntegrations, setSavedIntegrations] = useState({
    apiKeyStatus: 'Not Generated',
    webhookUrl: '',
    slackIntegration: false,
    googleIntegration: false,
    githubIntegration: false,
    lastSync: 'Never',
  });
  const [draftIntegrations, setDraftIntegrations] = useState(savedIntegrations);

  // Security (toggles + select/text)
  const [savedSecurity, setSavedSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    backupCodes: 'Not Generated',
    trustedDevices: '0 devices',
    passwordLastChanged: '3 months ago',
  });
  const [draftSecurity, setDraftSecurity] = useState(savedSecurity);

  // Analytics (toggles + select)
  const [savedAnalytics, setSavedAnalytics] = useState({
    dataCollection: true,
    personalization: true,
    cookiePreference: 'Essential + Analytics',
    activityHistory: true,
    exportData: 'Available',
  });
  const [draftAnalytics, setDraftAnalytics] = useState(savedAnalytics);

  // Billing (select + text)
  const [savedBilling, setSavedBilling] = useState({
    plan: 'Free',
    billingCycle: 'Monthly',
    paymentMethod: 'None',
    billingEmail: 'you@example.com',
    invoices: 'No invoices yet',
  });
  const [draftBilling, setDraftBilling] = useState(savedBilling);


  // SECTIONS + FIELD DEFINITIONS

  const sections: { id: SectionId; label: string }[] = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'professional', label: 'Professional Information' },
    { id: 'preferences', label: 'Platform Preferences' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'integrations', label: 'Integrations & API' },
    { id: 'security', label: 'Security' },
    { id: 'analytics', label: 'Usage Analytics' },
    { id: 'billing', label: 'Billing & Subscription' },
  ];

  const fieldsBySection: Record<SectionId, FieldDef[]> = {
    personal: [
      { key: 'fullName', label: 'Full Name', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'tel' },
      { key: 'company', label: 'Company', type: 'text' },
      { key: 'department', label: 'Department', type: 'text' },
    ],
    professional: [
      { key: 'jobTitle', label: 'Job Title', type: 'text' },
      { key: 'industry', label: 'Industry', type: 'text' },
      { key: 'yearsExperience', label: 'Years Experience', type: 'select', options: ['0-1', '2-4', '5-9', '10+'] },
      { key: 'workPreference', label: 'Work Preference', type: 'select', options: ['Remote', 'Hybrid', 'On-site'] },
      { key: 'skills', label: 'Skills', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'linkedin', label: 'LinkedIn', type: 'text' },
      { key: 'portfolio', label: 'Portfolio', type: 'text' },
    ],
    preferences: [
      { key: 'theme', label: 'Theme', type: 'select', options: ['Dark', 'Light', 'System'] },
      { key: 'language', label: 'Language', type: 'select', options: ['English', 'Spanish', 'French'] },
      { key: 'timezone', label: 'Timezone', type: 'select', options: ['UTC-08:00 (PST)', 'UTC-05:00 (EST)', 'UTC+00:00 (GMT)', 'UTC+01:00 (CET)'] },
      { key: 'accessibility', label: 'Accessibility', type: 'select', options: ['Standard', 'High Contrast', 'Large Text'] },
      { key: 'autoSave', label: 'Auto Save', type: 'toggle', description: 'Automatically save changes while editing.' },
      { key: 'compactMode', label: 'Compact Mode', type: 'toggle', description: 'Reduce spacing for denser layouts.' },
    ],
    notifications: [
      { key: 'emailAlerts', label: 'Email Alerts', type: 'toggle' },
      { key: 'smsAlerts', label: 'SMS Alerts', type: 'toggle' },
      { key: 'pushNotifications', label: 'Push Notifications', type: 'toggle' },
      { key: 'marketingEmails', label: 'Marketing Emails', type: 'toggle' },
      { key: 'securityAlerts', label: 'Security Alerts', type: 'toggle' },
      { key: 'productUpdates', label: 'Product Updates', type: 'toggle' },
    ],
    integrations: [
      { key: 'apiKeyStatus', label: 'API Key Status', type: 'select', options: ['Not Generated', 'Active', 'Revoked'] },
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text' },
      { key: 'slackIntegration', label: 'Slack Integration', type: 'toggle' },
      { key: 'googleIntegration', label: 'Google Integration', type: 'toggle' },
      { key: 'githubIntegration', label: 'GitHub Integration', type: 'toggle' },
      { key: 'lastSync', label: 'Last Sync', type: 'select', options: ['Never', 'Today', 'This Week', 'This Month'] },
    ],
    security: [
      { key: 'twoFactorAuth', label: 'Two-Factor Authentication', type: 'toggle' },
      { key: 'loginAlerts', label: 'Login Alerts', type: 'toggle' },
      { key: 'backupCodes', label: 'Backup Codes', type: 'select', options: ['Not Generated', 'Generated'] },
      { key: 'trustedDevices', label: 'Trusted Devices', type: 'select', options: ['0 devices', '1 device', '2 devices', '3+ devices'] },
      { key: 'passwordLastChanged', label: 'Password Last Changed', type: 'select', options: ['Today', 'This Week', 'This Month', '3 months ago'] },
    ],
    analytics: [
      { key: 'dataCollection', label: 'Data Collection', type: 'toggle' },
      { key: 'personalization', label: 'Personalization', type: 'toggle' },
      { key: 'cookiePreference', label: 'Cookie Preference', type: 'select', options: ['Essential Only', 'Essential + Analytics', 'All Cookies'] },
      { key: 'activityHistory', label: 'Activity History', type: 'toggle' },
      { key: 'exportData', label: 'Export Data', type: 'select', options: ['Available', 'Unavailable'] },
    ],
    billing: [
      { key: 'plan', label: 'Plan', type: 'select', options: ['Free', 'Pro', 'Enterprise'] },
      { key: 'billingCycle', label: 'Billing Cycle', type: 'select', options: ['Monthly', 'Yearly'] },
      { key: 'paymentMethod', label: 'Payment Method', type: 'select', options: ['None', 'Visa **** 1234', 'Mastercard **** 5678'] },
      { key: 'billingEmail', label: 'Billing Email', type: 'email' },
      { key: 'invoices', label: 'Invoices', type: 'select', options: ['No invoices yet', 'Download latest'] },
    ],
  };


  // PICK CURRENT SAVED/DRAFT

  const currentData = useMemo(() => {
    switch (activeSection) {
      case 'personal': return viewMode ? savedProfile : draftProfile;
      case 'professional': return viewMode ? savedProfessional : draftProfessional;
      case 'preferences': return viewMode ? savedPreferences : draftPreferences;
      case 'notifications': return viewMode ? savedNotifications : draftNotifications;
      case 'integrations': return viewMode ? savedIntegrations : draftIntegrations;
      case 'security': return viewMode ? savedSecurity : draftSecurity;
      case 'analytics': return viewMode ? savedAnalytics : draftAnalytics;
      case 'billing': return viewMode ? savedBilling : draftBilling;
      default: return null;
    }
  }, [
    activeSection, viewMode,
    savedProfile, draftProfile,
    savedProfessional, draftProfessional,
    savedPreferences, draftPreferences,
    savedNotifications, draftNotifications,
    savedIntegrations, draftIntegrations,
    savedSecurity, draftSecurity,
    savedAnalytics, draftAnalytics,
    savedBilling, draftBilling
  ]);

  const setCurrentDraft = (key: string, value: any) => {
    switch (activeSection) {
      case 'personal': setDraftProfile({ ...draftProfile, [key]: value }); break;
      case 'professional': setDraftProfessional({ ...draftProfessional, [key]: value }); break;
      case 'preferences': setDraftPreferences({ ...draftPreferences, [key]: value }); break;
      case 'notifications': setDraftNotifications({ ...draftNotifications, [key]: value }); break;
      case 'integrations': setDraftIntegrations({ ...draftIntegrations, [key]: value }); break;
      case 'security': setDraftSecurity({ ...draftSecurity, [key]: value }); break;
      case 'analytics': setDraftAnalytics({ ...draftAnalytics, [key]: value }); break;
      case 'billing': setDraftBilling({ ...draftBilling, [key]: value }); break;
    }
  };


  // SAVE / CANCEL

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (activeSection === 'personal') {
      if (!draftProfile.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!draftProfile.email.trim()) newErrors.email = 'Email is required';
      if (Object.keys(newErrors).length) return setErrors(newErrors);
      setSavedProfile(draftProfile);
    }

    if (activeSection === 'professional') {
      if (!draftProfessional.jobTitle.trim()) newErrors.jobTitle = 'Job Title is required';
      if (!draftProfessional.skills.trim()) newErrors.skills = 'Skills are required';
      if (Object.keys(newErrors).length) return setErrors(newErrors);
      setSavedProfessional(draftProfessional);
    }

    if (activeSection === 'preferences') setSavedPreferences(draftPreferences);
    if (activeSection === 'notifications') setSavedNotifications(draftNotifications);
    if (activeSection === 'integrations') setSavedIntegrations(draftIntegrations);
    if (activeSection === 'security') setSavedSecurity(draftSecurity);
    if (activeSection === 'analytics') setSavedAnalytics(draftAnalytics);
    if (activeSection === 'billing') setSavedBilling(draftBilling);

    setViewMode(true);
    setErrors({});
  };

  const handleCancel = () => {
    if (activeSection === 'personal') setDraftProfile(savedProfile);
    if (activeSection === 'professional') setDraftProfessional(savedProfessional);
    if (activeSection === 'preferences') setDraftPreferences(savedPreferences);
    if (activeSection === 'notifications') setDraftNotifications(savedNotifications);
    if (activeSection === 'integrations') setDraftIntegrations(savedIntegrations);
    if (activeSection === 'security') setDraftSecurity(savedSecurity);
    if (activeSection === 'analytics') setDraftAnalytics(savedAnalytics);
    if (activeSection === 'billing') setDraftBilling(savedBilling);

    setViewMode(true);
    setErrors({});
  };

  // STYLES (keep your UI)

  const styles = {
    wrapper: {
      backgroundColor: 'transparent',
      minHeight: '100vh',
      padding: '40px 20px',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    },
    container: { maxWidth: '1100px', margin: '0 auto' },
    header: {
      marginBottom: '40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end'
    },
    sidebar: {
      backgroundColor: '#f3f3f3',
      borderRadius: '16px',
      padding: '12px',
      border: '1px solid rgba(255,255,255,0.05)',
      height: 'fit-content' as const
    },
    mainCard: {
      backgroundColor: '#f3f3f3',
      borderRadius: '24px',
      border: '1px solid rgba(255,255,255,0.05)',
      overflow: 'hidden' as const
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
      backgroundColor: isActive ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
      color: isActive ? '#a78bfa' : '#9ca3af',
      fontWeight: isActive ? 600 : 400
    }),
    purpleBtn: {
      backgroundColor: '#7c3aed',
      color: 'white',
      padding: '10px 24px',
      borderRadius: '12px',
      border: 'none',
      fontWeight: 600,
      cursor: 'pointer',
      transition: '0.2s'
    },
    ghostBtn: {
      background: '#374151',
      color: '#ffffff',
      border: '1px solid #374151',
      padding: '10px 20px',
      borderRadius: '12px',
      cursor: 'pointer'
    },
    label: {
      display: 'block',
      fontSize: '12px',
      color: '#6b7280',
      textTransform: 'uppercase' as const,
      marginBottom: '8px',
      letterSpacing: '0.5px'
    },
    input: {
      width: '100%',
      backgroundColor: 'rgba(255,255,255)',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      borderRadius: '10px',
      padding: '12px',
      color: '#111827',
      outline: 'none'
    },
    select: {
      width: '100%',
      backgroundColor: 'rgba(255,255,255)',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      borderRadius: '10px',
      padding: '12px',
      color: '#111827',
      outline: 'none'
    },
    valueBox: {
      backgroundColor: 'rgba(255,255,255)',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      borderRadius: '12px',
      padding: '14px 16px',
      fontSize: '16px',
      margin: 0,
      color: '#111827'
    },
    helper: { marginTop: '6px', color: '#9ca3af', fontSize: '12px' }
  };


  // TOGGLE COMPONENT (switch UI)

  const Toggle = ({
    checked,
    onChange
  }: {
    checked: boolean;
    onChange: (next: boolean) => void;
  }) => {
    const track = {
      width: 44,
      height: 24,
      borderRadius: 999,
      border: '1px solid rgba(255,255,255,0.12)',
      backgroundColor: checked ? 'rgba(124,58,237,0.45)' : 'rgba(0, 0, 0, 0.06)',
      padding: 3,
      cursor: 'pointer',
      transition: '0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: checked ? 'flex-end' : 'flex-start'
    } as React.CSSProperties;

    const knob = {
      width: 18,
      height: 18,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255)',
      boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
      transition: '0.2s'
    } as React.CSSProperties;

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={track}
      >
        <span style={knob} />
      </button>
    );
  };

  const formatValue = (val: any) => {
    if (typeof val === 'boolean') return val ? 'On' : 'Off';
    if (val === '') return '—';
    return String(val);
  };

  // RENDER


  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: 'black' }}>Profile</h1>
            <p style={{ color: '#9ca3af', marginTop: '8px' }}>Manage your account and platform settings</p>
          </div>

          {viewMode && currentData && (
            <button style={styles.purpleBtn} onClick={() => setViewMode(false)}>
              Edit Settings
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
          <aside style={styles.sidebar}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setViewMode(true);
                    setErrors({});
                    setActiveSection(s.id);
                  }}
                  style={styles.navButton(activeSection === s.id)}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </aside>

          <main style={styles.mainCard}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#111827' }}>
                {sections.find((s) => s.id === activeSection)?.label}
              </h2>
            </div>

            <div style={{ padding: '32px' }}>
              {currentData && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {fieldsBySection[activeSection].map((field) => {
                    const value = (currentData as any)[field.key];

                    return (
                      <div key={field.key}>
                        <label style={styles.label}>{field.label}</label>

                        {/* VIEW MODE */}
                        {viewMode && (
                          <p style={styles.valueBox as React.CSSProperties}>
                            {formatValue(value)}
                          </p>
                        )}

                        {/* EDIT MODE */}
                        {!viewMode && (
                          <>
                            {field.type === 'toggle' && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>
                                  {formatValue(value)}
                                </p>
                                <Toggle
                                  checked={Boolean(value)}
                                  onChange={(next) => setCurrentDraft(field.key, next)}
                                />
                              </div>
                            )}

                            {(field.type === 'select') && (
                              <select
                                style={styles.select as React.CSSProperties}
                                value={String(value)}
                                onChange={(e) => setCurrentDraft(field.key, e.target.value)}
                              >
                                {(field.options || []).map((opt) => (
                                  <option key={opt} value={opt} style={{ background: '#ffffff80', color: 'black' }}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            )}

                            {(field.type === 'text' || field.type === 'email' || field.type === 'tel') && (
                              <input
                                style={styles.input as React.CSSProperties}
                                type={field.type === 'text' ? 'text' : field.type}
                                value={String(value)}
                                onChange={(e) => setCurrentDraft(field.key, e.target.value)}
                              />
                            )}

                            {field.description && (
                              <div style={styles.helper as React.CSSProperties}>{field.description}</div>
                            )}

                            {errors[field.key] && (
                              <p style={{ margin: '8px 0 0', color: '#fca5a5', fontSize: '12px' }}>
                                {errors[field.key]}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!viewMode && currentData && (
                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button style={styles.ghostBtn as React.CSSProperties} onClick={handleCancel}>
                    Cancel
                  </button>
                  <button style={styles.purpleBtn as React.CSSProperties} onClick={handleSave}>
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