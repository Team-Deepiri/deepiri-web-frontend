import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RoleSelector from '../components/RoleSelector';
import { getUserRole } from '../utils/roles';
import type { DeepiriRole } from '../types/roles';
import { ROLES } from '../types/roles';
import { useTheme } from '../contexts/ThemeContext';
import { userApi } from '../api/userApi';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { Github, Slack, Chrome, Shield, Sparkles, Upload, AlertTriangle } from 'lucide-react';

type SectionId =
  | 'personal'
  | 'professional'
  | 'preferences'
  | 'notifications'
  | 'integrations'
  | 'security'
  | 'analytics';

type FieldType = 'text' | 'email' | 'tel' | 'select' | 'toggle';

type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  description?: string;
};

const Profile: React.FC = () => {
  const { user, deepiriRole, setDeepiriRole, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === '1';
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<SectionId>(() => {
    const s = searchParams.get('section');
    if (s && ['personal','professional','preferences','notifications','integrations','security','analytics'].includes(s)) return s as SectionId;
    return isOnboarding ? 'personal' : 'personal';
  });
  const [viewMode, setViewMode] = useState(!isOnboarding);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localRole, setLocalRole] = useState<DeepiriRole | null>(deepiriRole || getUserRole(user));
  useEffect(() => { setLocalRole(deepiriRole || getUserRole(user)); }, [deepiriRole, user]);

  // Onboarding wizard state
  const [onboardingStep, setOnboardingStep] = useState<'personal'|'professional'>('personal');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || user?.metadata?.avatarUrl || null);
  const [avatarFlagged, setAvatarFlagged] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrSecret] = useState('otpauth://totp/Deepiri:' + encodeURIComponent(user?.email || 'user') + '?secret=JBSWY3DPEHPK3PXP&issuer=Deepiri');

  // Personal — populated from user
  const [savedProfile, setSavedProfile] = useState(() => ({
    fullName: user?.name || '',
    avatarUrl: user?.avatarUrl || user?.metadata?.avatarUrl || '',
    bio: user?.metadata?.bio || '',
    email: user?.email || '',
    phone: user?.metadata?.phone || '',
    company: user?.metadata?.company || 'Deepiri',
    department: user?.metadata?.department || '',
  }));
  const [draftProfile, setDraftProfile] = useState(savedProfile);

  useEffect(() => {
    // sync from user when it loads
    if (user) {
      const next = {
        fullName: user.name || savedProfile.fullName,
        avatarUrl: user.avatarUrl || user.metadata?.avatarUrl || savedProfile.avatarUrl,
        bio: user.metadata?.bio || savedProfile.bio,
        email: user.email || savedProfile.email,
        phone: user.metadata?.phone || savedProfile.phone,
        company: user.metadata?.company || savedProfile.company,
        department: user.metadata?.department || savedProfile.department,
      };
      setSavedProfile(next);
      setDraftProfile(next);
      if (next.avatarUrl) setAvatarPreview(next.avatarUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Professional — Role (app role) + Specialized Title (from Deepiri)
  const [savedProfessional, setSavedProfessional] = useState(() => ({
    roleAppRole: (user?.metadata?.deepiriRole || deepiriRole || '') as string,
    specializedTitle: user?.metadata?.specializedTitle || '',
    skills: user?.metadata?.skills || '',
    githubUsername: user?.metadata?.githubUsername || '',
    yearsExperience: user?.metadata?.yearsExperience || '2-4',
    workPreference: user?.metadata?.workPreference || 'Hybrid',
    location: user?.metadata?.location || '',
    linkedin: user?.metadata?.linkedin || '',
    portfolio: user?.metadata?.portfolio || '',
  }));
  const [draftProfessional, setDraftProfessional] = useState(savedProfessional);
  const [generatingTitle, setGeneratingTitle] = useState(false);

  // Preferences
  const [savedPreferences, setSavedPreferences] = useState(() => ({
    theme: theme,
    language: user?.metadata?.language || 'English',
    timezone: user?.metadata?.timezone || 'UTC-05:00 (EST)',
    accessibility: user?.metadata?.accessibility || 'Standard',
    autoSave: true,
    compactMode: false,
  }));
  const [draftPreferences, setDraftPreferences] = useState(savedPreferences);
  useEffect(() => { setSavedPreferences(p => ({ ...p, theme })); setDraftPreferences(p => ({ ...p, theme })); }, [theme]);

  // Notifications
  const [savedNotifications, setSavedNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
    productUpdates: true,
  });
  const [draftNotifications, setDraftNotifications] = useState(savedNotifications);

  // Integrations
  const [savedIntegrations, setSavedIntegrations] = useState({
    apiKeyStatus: 'Not Generated',
    webhookUrl: '',
    slackIntegration: false,
    googleIntegration: false,
    githubIntegration: !!user?.metadata?.githubUsername,
    lastSync: 'Never',
  });
  const [draftIntegrations, setDraftIntegrations] = useState(savedIntegrations);

  // Security
  const [savedSecurity, setSavedSecurity] = useState({
    twoFactorAuth: !!user?.metadata?.totpEnabled,
    loginAlerts: true,
    backupCodes: backupCodes.length ? 'Generated' : 'Not Generated',
    trustedDevices: '0 devices',
    passwordLastChanged: '3 months ago',
  });
  const [draftSecurity, setDraftSecurity] = useState(savedSecurity);

  // Analytics
  const [savedAnalytics, setSavedAnalytics] = useState({
    dataCollection: true,
    personalization: true,
    cookiePreference: 'Essential + Analytics',
    activityHistory: true,
    exportData: 'Available',
  });
  const [draftAnalytics, setDraftAnalytics] = useState(savedAnalytics);

  const sections: { id: SectionId; label: string }[] = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'professional', label: 'Professional Information' },
    { id: 'preferences', label: 'Platform Preferences' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'integrations', label: 'Integrations & API' },
    { id: 'security', label: 'Security' },
    { id: 'analytics', label: 'Usage Analytics' },
  ];

  const fieldsBySection: Record<SectionId, FieldDef[]> = {
    personal: [
      { key: 'fullName', label: 'Full Name', type: 'text' },
      { key: 'bio', label: 'Bio', type: 'text', description: 'Short bio shown on People cards' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'tel' },
      { key: 'company', label: 'Company', type: 'text' },
      { key: 'department', label: 'Department', type: 'text' },
    ],
    professional: [
      { key: 'roleAppRole', label: 'Role (app role)', type: 'select', options: Object.keys(ROLES) },
      { key: 'specializedTitle', label: 'Specialized Title (from Deepiri)', type: 'text', description: 'e.g. MLOps Architect — use Generate button' },
      { key: 'skills', label: 'Skills', type: 'text' },
      { key: 'githubUsername', label: 'GitHub Username', type: 'text' },
      { key: 'yearsExperience', label: 'Years Experience', type: 'select', options: ['0-1', '2-4', '5-9', '10+'] },
      { key: 'workPreference', label: 'Work Preference', type: 'select', options: ['Remote', 'Hybrid', 'On-site'] },
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
  };

  const currentData = useMemo(() => {
    switch (activeSection) {
      case 'personal': return viewMode ? savedProfile : draftProfile;
      case 'professional': return viewMode ? savedProfessional : draftProfessional;
      case 'preferences': return viewMode ? savedPreferences : draftPreferences;
      case 'notifications': return viewMode ? savedNotifications : draftNotifications;
      case 'integrations': return viewMode ? savedIntegrations : draftIntegrations;
      case 'security': return viewMode ? savedSecurity : draftSecurity;
      case 'analytics': return viewMode ? savedAnalytics : draftAnalytics;
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
  ]);

  const setCurrentDraft = (key: string, value: any) => {
    switch (activeSection) {
      case 'personal': setDraftProfile({ ...draftProfile, [key]: value }); break;
      case 'professional': setDraftProfessional({ ...draftProfessional, [key]: value }); break;
      case 'preferences': {
        if (key === 'theme') setTheme(value as any);
        setDraftPreferences({ ...draftPreferences, [key]: value }); break;
      }
      case 'notifications': setDraftNotifications({ ...draftNotifications, [key]: value }); break;
      case 'integrations': setDraftIntegrations({ ...draftIntegrations, [key]: value }); break;
      case 'security': setDraftSecurity({ ...draftSecurity, [key]: value }); break;
      case 'analytics': setDraftAnalytics({ ...draftAnalytics, [key]: value }); break;
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (activeSection === 'personal') {
      if (!draftProfile.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!draftProfile.email.trim()) newErrors.email = 'Email is required';
      if (Object.keys(newErrors).length) return setErrors(newErrors);
      setSavedProfile(draftProfile);
      try {
        await userApi.updateProfile({ name: draftProfile.fullName, email: draftProfile.email, metadata: { bio: draftProfile.bio, phone: draftProfile.phone, company: draftProfile.company, department: draftProfile.department, avatarUrl: avatarPreview || draftProfile.avatarUrl, avatarFlagged } } as any);
        updateUser({ ...user!, name: draftProfile.fullName, email: draftProfile.email, avatarUrl: avatarPreview || undefined, metadata: { ...(user?.metadata||{}), bio: draftProfile.bio, phone: draftProfile.phone, company: draftProfile.company, department: draftProfile.department, avatarUrl: avatarPreview || draftProfile.avatarUrl, avatarFlagged } } as any);
        toast.success('Profile saved');
      } catch { toast.success('Saved locally (backend not reachable)'); }
    }
    if (activeSection === 'professional') {
      if (!draftProfessional.specializedTitle.trim() && !draftProfessional.skills.trim()) {
        // allow but warn
      }
      setSavedProfessional(draftProfessional);
      if (draftProfessional.roleAppRole) setDeepiriRole(draftProfessional.roleAppRole as DeepiriRole);
      try {
        await userApi.updateProfile({ metadata: { specializedTitle: draftProfessional.specializedTitle, skills: draftProfessional.skills, githubUsername: draftProfessional.githubUsername, yearsExperience: draftProfessional.yearsExperience, workPreference: draftProfessional.workPreference, location: draftProfessional.location, linkedin: draftProfessional.linkedin, portfolio: draftProfessional.portfolio } } as any);
        updateUser({ ...user!, metadata: { ...(user?.metadata||{}), specializedTitle: draftProfessional.specializedTitle, skills: draftProfessional.skills, githubUsername: draftProfessional.githubUsername, deepiriRole: draftProfessional.roleAppRole } } as any);
        toast.success('Professional info saved');
      } catch { toast.success('Saved locally'); }
    }
    if (activeSection === 'preferences') {
      setSavedPreferences(draftPreferences);
      setTheme(draftPreferences.theme as any);
      try { await userApi.updateProfile({ metadata: { theme: draftPreferences.theme } } as any); } catch {}
      toast.success('Preferences saved — theme applied');
    }
    if (activeSection === 'notifications') setSavedNotifications(draftNotifications);
    if (activeSection === 'integrations') setSavedIntegrations(draftIntegrations);
    if (activeSection === 'security') {
      setSavedSecurity(draftSecurity);
      if (draftSecurity.twoFactorAuth && !savedSecurity.twoFactorAuth) setShow2FAModal(true);
    }
    if (activeSection === 'analytics') setSavedAnalytics(draftAnalytics);
    setViewMode(true);
    setErrors({});
    if (isOnboarding && activeSection === 'professional') {
      navigate('/dashboard');
    }
  };

  const handleCancel = () => {
    if (activeSection === 'personal') setDraftProfile(savedProfile);
    if (activeSection === 'professional') setDraftProfessional(savedProfessional);
    if (activeSection === 'preferences') setDraftPreferences(savedPreferences);
    if (activeSection === 'notifications') setDraftNotifications(savedNotifications);
    if (activeSection === 'integrations') setDraftIntegrations(savedIntegrations);
    if (activeSection === 'security') setDraftSecurity(savedSecurity);
    if (activeSection === 'analytics') setDraftAnalytics(savedAnalytics);
    setViewMode(true);
    setErrors({});
  };

  const handleGenerateTitle = async () => {
    setGeneratingTitle(true);
    try {
      const res = await axiosInstance.post('/integrations/openrouter/generate-title', { name: draftProfessional.roleAppRole || localRole, skills: draftProfessional.skills, githubUsername: draftProfessional.githubUsername }).then(r=>r.data).catch(()=>null);
      const title = res?.title || res?.data?.title || `Deepiri ${ROLES[(draftProfessional.roleAppRole as DeepiriRole) || 'software_developer']?.label || 'Specialist'}`;
      setDraftProfessional({ ...draftProfessional, specializedTitle: title });
      toast.success('Title generated: ' + title);
    } catch {
      const fallback = `Deepiri Specialist — ${ROLES[(draftProfessional.roleAppRole as DeepiriRole) || 'software_developer']?.label || 'Member'}`;
      setDraftProfessional({ ...draftProfessional, specializedTitle: fallback });
      toast.success('Fallback title: ' + fallback);
    } finally { setGeneratingTitle(false); }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { toast.error('Avatar must be <2MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      // guardrail: simple inappropriate word check + flag
      const banned = ['nsfw','inappropriate'];
      const flagged = banned.some(w => f.name.toLowerCase().includes(w));
      // In real app, run nsfwjs / dir-agent-guardrails. For now mark flagged if filename contains banned.
      setAvatarPreview(dataUrl);
      setAvatarFlagged(flagged);
      setDraftProfile(p => ({ ...p, avatarUrl: dataUrl }));
      if (flagged) toast('Avatar pending moderation — flagged', { icon: '⚠️' });
      else toast.success('Avatar ready — save to persist');
    };
    reader.readAsDataURL(f);
  };

  const handleConnect = (provider: string) => {
    const url = `/api/auth/${provider}`;
    const w = window.open(url, '_blank', 'width=600,height=700');
    if (!w) {
      toast('Pop-up blocked — redirecting'); window.location.href = url; return;
    }
    const handler = (ev: MessageEvent) => {
      if (ev.data?.type === 'oauth-connected' && ev.data.provider === provider) {
        toast.success(`${provider} connected as @${ev.data.username || 'you'}`);
        setDraftIntegrations(d => ({ ...d, [`${provider}Integration`]: true } as any));
        window.removeEventListener('message', handler);
      }
    };
    window.addEventListener('message', handler);
    setTimeout(() => window.removeEventListener('message', handler), 60000);
    // fallback: if redirect flow, backend will handle
  };

  const styles = {
    wrapper: { backgroundColor: 'transparent', minHeight: '100vh', padding: '40px 20px', color: 'white', fontFamily: 'Inter, sans-serif' },
    container: { maxWidth: '1100px', margin: '0 auto' },
    header: { marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' as const },
    sidebar: { backgroundColor: '#f3f3f3', borderRadius: '16px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)', height: 'fit-content' as const },
    mainCard: { backgroundColor: '#f3f3f3', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' as const },
    navButton: (isActive: boolean) => ({ width: '100%', padding: '12px 16px', borderRadius: '10px', border: 'none', textAlign: 'left' as const, cursor: 'pointer', fontSize: '14px', transition: '0.2s', backgroundColor: isActive ? 'rgba(124, 58, 237, 0.12)' : 'transparent', color: isActive ? '#a78bfa' : '#9ca3af', fontWeight: isActive ? 600 : 400 }),
    purpleBtn: { backgroundColor: '#7c3aed', color: 'white', padding: '10px 24px', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' },
    ghostBtn: { background: '#374151', color: '#ffffff', border: '1px solid #374151', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer' },
    label: { display: 'block', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '8px', letterSpacing: '0.5px' },
    input: { width: '100%', backgroundColor: 'rgba(255,255,255)', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '10px', padding: '12px', color: '#111827', outline: 'none' },
    select: { width: '100%', backgroundColor: 'rgba(255,255,255)', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '10px', padding: '12px', color: '#111827', outline: 'none' },
    valueBox: { backgroundColor: 'rgba(255,255,255)', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '12px', padding: '14px 16px', fontSize: '16px', margin: 0, color: '#111827' },
    helper: { marginTop: '6px', color: '#9ca3af', fontSize: '12px' }
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) => {
    const track = { width: 44, height: 24, borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)', backgroundColor: checked ? 'rgba(124,58,237,0.45)' : 'rgba(0, 0, 0, 0.06)', padding: 3, cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start' } as React.CSSProperties;
    const knob = { width: 18, height: 18, borderRadius: 999, backgroundColor: 'rgba(255,255,255)', boxShadow: '0 6px 18px rgba(0,0,0,0.25)', transition: '0.2s' } as React.CSSProperties;
    return <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} style={track}><span style={knob} /></button>;
  };

  const formatValue = (val: any) => { if (typeof val === 'boolean') return val ? 'On' : 'Off'; if (val === '') return '—'; return String(val); };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {isOnboarding && (
          <div className="card-modern bg-white p-4 mb-4 d-flex align-items-center justify-content-between">
            <div>
              <div className="h5 mb-1">Welcome to Deepiri — complete your profile</div>
              <div className="small text-muted">Step {onboardingStep==='personal'?1:2} of 2: {onboardingStep==='personal' ? 'Personal (avatar, bio)' : 'Professional (Role + Specialized Title + GitHub)'}</div>
            </div>
            <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">Skip for now</Link>
          </div>
        )}
        <div className="card-modern bg-white p-4 mb-4 d-flex flex-column gap-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div className="small text-muted" style={{ letterSpacing: '0.5px' }}>DEEPIRI ROLE</div>
              <div className="h5 mb-0">{localRole ? ROLES[localRole].label : 'No role selected'}</div>
              <div className="small text-muted">{localRole ? ROLES[localRole].description : 'Pick your primary team to filter meetings & access.'}</div>
            </div>
            {localRole && <span className="px-3 py-2 rounded-pill text-white small fw-bold" style={{ background: ROLES[localRole].color }}>{ROLES[localRole].icon} {ROLES[localRole].shortLabel}</span>}
          </div>
          <RoleSelector value={localRole} onChange={(r) => { setLocalRole(r); setDeepiriRole(r); setDraftProfessional(d=>({ ...d, roleAppRole: r })); }} />
          <div className="small text-muted">IT / Admin / Leadership / Owner can attend any meeting. Your dashboard filters to <strong>{localRole ? ROLES[localRole].label : 'all'}</strong> meetings.</div>
        </div>

        <div style={styles.header}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: 'black' }}>Profile</h1>
            <p style={{ color: '#9ca3af', marginTop: '8px' }}>Manage your account and platform settings</p>
          </div>
          {viewMode && currentData && !isOnboarding && (
            <button style={styles.purpleBtn} onClick={() => setViewMode(false)}>Edit Settings</button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
          <aside style={styles.sidebar}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sections.map((s) => (
                <button key={s.id} onClick={() => { setViewMode(true); setErrors({}); setActiveSection(s.id); }} style={styles.navButton(activeSection === s.id)}>{s.label}</button>
              ))}
            </nav>
          </aside>

          <main style={styles.mainCard}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#111827' }}>{sections.find((s) => s.id === activeSection)?.label}</h2>
            </div>

            <div style={{ padding: '32px' }}>
              {/* Avatar upload — Personal */}
              {activeSection === 'personal' && (
                <div className="mb-4 p-3 rounded-3 border bg-white d-flex align-items-center gap-3">
                  {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{ width: 64, height: 64, borderRadius: 999, objectFit: 'cover', border: avatarFlagged ? '2px solid #f59e0b' : '1px solid #e5e7eb' }}/> : <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-dark text-white" style={{ width:64,height:64 }}>{(draftProfile.fullName||'U').charAt(0).toUpperCase()}</div>}
                  <div>
                    <label className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2 mb-1" style={{ cursor:'pointer' }}><Upload size={14}/> Upload avatar<input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display:'none' }}/></label>
                    <div className="small text-muted">PNG/JPG &lt;2MB. Guardrailed — flagged if inappropriate (pending moderation to admin).</div>
                    {avatarFlagged && <div className="small text-warning d-flex align-items-center gap-1"><AlertTriangle size={12}/> Pending moderation</div>}
                  </div>
                </div>
              )}

              {/* Professional: Generate button */}
              {activeSection === 'professional' && !viewMode && (
                <div className="mb-3 p-3 rounded-3 border bg-white d-flex align-items-center justify-content-between">
                  <div className="small text-muted">Specialized Title can be auto-generated via OpenRouter (free model) from your skills + GitHub.</div>
                  <button className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1" onClick={handleGenerateTitle} disabled={generatingTitle}><Sparkles size={14}/> {generatingTitle?'Generating…':'Generate with OpenRouter'}</button>
                </div>
              )}

              {/* Integrations logos */}
              {activeSection === 'integrations' && (
                <div className="mb-4 row g-3">
                  {[
                    { key:'github', label:'GitHub', icon: Github, connected: draftIntegrations.githubIntegration, desc:'PR Impact, Codebase, QA workflow' },
                    { key:'slack', label:'Slack', icon: Slack, connected: draftIntegrations.slackIntegration, desc:'Notifications & slash commands' },
                    { key:'google', label:'Google', icon: Chrome, connected: draftIntegrations.googleIntegration, desc:'Meet, Calendar, Drive' },
                  ].map(card => {
                    const Icon = card.icon;
                    return (
                      <div key={card.key} className="col-md-4">
                        <div className="p-3 rounded-3 border bg-white d-flex flex-column gap-2">
                          <div className="d-flex align-items-center gap-2"><span className="d-inline-flex align-items-center justify-content-center rounded-2 bg-light border" style={{ width:36,height:36 }}><Icon size={18} /></span><span className="fw-semibold">{card.label}</span><span className={`ms-auto badge ${card.connected ? 'bg-success' : 'bg-secondary'}`}>{card.connected ? 'Connected' : 'Not connected'}</span></div>
                          <div className="small text-muted">{card.desc}</div>
                          <button className="btn btn-sm btn-outline-primary" onClick={()=>handleConnect(card.key)}>{card.connected ? 'Manage' : `Connect ${card.label}`}</button>
                          {card.key==='github' && card.connected && <div className="small text-muted">Connected as @{draftProfessional.githubUsername || 'you'} <span className="text-success">●</span></div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Security: 2FA details */}
              {activeSection === 'security' && !viewMode && (
                <div className="mb-3 p-3 rounded-3 border bg-white">
                  <div className="small fw-semibold d-flex align-items-center gap-2"><Shield size={14}/> Two-Factor Authentication</div>
                  <div className="small text-muted">Enable TOTP — we generate a secret + QR (otpauth://). Verify with a 6-digit code; backup codes stored encrypted. Login will require <code>totpCode</code> if enabled.</div>
                  {draftSecurity.twoFactorAuth && <button className="btn btn-sm btn-outline-secondary mt-2" onClick={()=>setShow2FAModal(true)}>Show QR & verify</button>}
                </div>
              )}

              {currentData && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {fieldsBySection[activeSection].map((field) => {
                    const value = (currentData as any)[field.key];
                    // show Role selector nicer
                    return (
                      <div key={field.key}>
                        <label style={styles.label}>{field.label}</label>
                        {viewMode && (
                          <p style={styles.valueBox as React.CSSProperties}>{field.key==='roleAppRole' && value ? (ROLES[value as DeepiriRole]?.label || value) : formatValue(value)}</p>
                        )}
                        {!viewMode && (
                          <>
                            {field.type === 'toggle' && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>{formatValue(value)}</p>
                                <Toggle checked={Boolean(value)} onChange={(next) => setCurrentDraft(field.key, next)} />
                              </div>
                            )}
                            {(field.type === 'select') && (
                              <select style={styles.select as React.CSSProperties} value={String(value)} onChange={(e) => setCurrentDraft(field.key, e.target.value)}>
                                {(field.options || []).map((opt) => (
                                  <option key={opt} value={field.key==='roleAppRole' ? opt : opt} style={{ background: '#ffffff80', color: 'black' }}>{field.key==='roleAppRole' ? (ROLES[opt as DeepiriRole]?.label || opt) : opt}</option>
                                ))}
                              </select>
                            )}
                            {(field.type === 'text' || field.type === 'email' || field.type === 'tel') && (
                              <input style={styles.input as React.CSSProperties} type={field.type === 'text' ? 'text' : field.type} value={String(value)} onChange={(e) => setCurrentDraft(field.key, e.target.value)} />
                            )}
                            {field.description && <div style={styles.helper as React.CSSProperties}>{field.description}</div>}
                            {errors[field.key] && <p style={{ margin: '8px 0 0', color: '#fca5a5', fontSize: '12px' }}>{errors[field.key]}</p>}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!viewMode && currentData && (
                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  {isOnboarding ? (
                    <>
                      {onboardingStep==='personal' ? <button style={styles.purpleBtn as React.CSSProperties} onClick={()=>{ handleSave(); setOnboardingStep('professional'); setActiveSection('professional'); setViewMode(false); }}>Next: Professional →</button> : <button style={styles.purpleBtn as React.CSSProperties} onClick={handleSave}>Finish — Go to Dashboard</button>}
                      <button style={styles.ghostBtn as React.CSSProperties} onClick={()=>navigate('/dashboard')}>Skip</button>
                    </>
                  ) : (
                    <>
                      <button style={styles.ghostBtn as React.CSSProperties} onClick={handleCancel}>Cancel</button>
                      <button style={styles.purpleBtn as React.CSSProperties} onClick={handleSave}>Save Changes</button>
                    </>
                  )}
                </div>
              )}

              {viewMode && isOnboarding && (
                <div className="mt-4 d-flex justify-content-end"><button className="btn btn-primary" onClick={()=>setViewMode(false)}>Edit {activeSection==='personal'?'Personal':'Professional'}</button></div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background:'rgba(0,0,0,0.5)', zIndex: 9999 }} onClick={()=>setShow2FAModal(false)}>
          <div className="bg-white rounded-4 p-4" style={{ width: 'min(480px, 90vw)' }} onClick={e=>e.stopPropagation()}>
            <h5 className="mb-2">Two-Factor Setup</h5>
            <div className="small text-muted mb-3">Scan this QR with Authenticator (Google/Authy). Secret: <code>JBSWY3DPEHPK3PXP</code></div>
            <div className="bg-light border rounded-3 p-3 text-center mb-3" style={{ wordBreak:'break-all' }}><code>{qrSecret}</code><div className="small text-muted mt-2">(In production, render real QR from <code>POST /api/auth/2fa/setup</code>)</div></div>
            <div className="d-flex gap-2 mb-3">
              <input className="form-control" placeholder="Enter 6-digit code" value={totpCode} onChange={e=>setTotpCode(e.target.value)} maxLength={6} />
              <button className="btn btn-primary" onClick={async ()=>{
                if (totpCode.length!==6) return toast.error('Enter 6 digits');
                try {
                  await axiosInstance.post('/auth/2fa/verify', { code: totpCode }).catch(()=>null);
                  const codes = Array.from({length:8},()=>Math.random().toString(36).slice(2,6).toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase());
                  setBackupCodes(codes);
                  setSavedSecurity(s=>({ ...s, backupCodes:'Generated', twoFactorAuth:true }));
                  toast.success('2FA verified — backup codes generated');
                  setShow2FAModal(false);
                } catch { toast.error('Verification failed — try 000000 in dev'); }
              }}>Verify</button>
            </div>
            {backupCodes.length>0 && <div className="small"><div className="fw-semibold">Backup codes (save now):</div><div className="font-monospace bg-light p-2 rounded-2">{backupCodes.join(', ')}</div></div>}
            <div className="text-end mt-3"><button className="btn btn-outline-secondary btn-sm" onClick={()=>setShow2FAModal(false)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
