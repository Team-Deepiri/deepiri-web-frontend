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
    console.log('Saving profile data');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold text-white">Profile</h1>
            <p className="text-gray-300 mt-1">
              Manage your account, preferences, and platform settings
            </p>
          </div>
          {activeSection === 'personal' && viewMode && (
            <button
              onClick={() => {
                setDraftProfile(savedProfile);
                setViewMode(false);
                setErrors({});
              }}
              className="px-6 py-2 bg-orange-500 text-black rounded-lg hover:bg-orange-600 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <nav className="space-y-1">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm transition
                      ${
                        activeSection === section.id
                          ? 'bg-orange-500 text-black underline font-bold'
                          : 'font-medium text-gray-300 hover:bg-gray-700'
                      }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 lg:col-span-9">
            <div className="bg-gray-800 rounded-xl border border-gray-700">
              <div className="border-b border-gray-700 px-8 py-6">
                <h2 className="text-xl font-semibold text-white">
                  {sections.find(s => s.id === activeSection)?.label}
                </h2>
              </div>

              <div className="px-8 py-6 space-y-8">
                {activeSection === 'personal' && (
                  <Section title="Basic Details">
                    <TwoCol>
                      {viewMode ? (
                        <>
                          <ProfileFieldView label="Full Name" value={savedProfile.fullName} />
                          <ProfileFieldView label="Title" value={savedProfile.title} />
                          <ProfileFieldView label="Email" value={savedProfile.email} />
                          <ProfileFieldView label="Phone" value={savedProfile.phone} />
                          <ProfileFieldView label="Company" value={savedProfile.company} />
                          <ProfileFieldView label="Department" value={savedProfile.department} />
                        </>
                      ) : (
                        <>
                          <ProfileFieldEdit
                            label="Full Name"
                            value={draftProfile.fullName}
                            onChange={(value) => setDraftProfile({ ...draftProfile, fullName: value })}
                            error={errors.fullName}
                            required
                          />
                          <ProfileFieldEdit
                            label="Title"
                            value={draftProfile.title}
                            onChange={(value) => setDraftProfile({ ...draftProfile, title: value })}
                            error={errors.title}
                          />
                          <ProfileFieldEdit
                            label="Email"
                            value={draftProfile.email}
                            onChange={(value) => setDraftProfile({ ...draftProfile, email: value })}
                            error={errors.email}
                            required
                          />
                          <ProfileFieldEdit
                            label="Phone"
                            value={draftProfile.phone}
                            onChange={(value) => setDraftProfile({ ...draftProfile, phone: value })}
                            error={errors.phone}
                          />
                          <ProfileFieldEdit
                            label="Company"
                            value={draftProfile.company}
                            onChange={(value) => setDraftProfile({ ...draftProfile, company: value })}
                            error={errors.company}
                          />
                          <ProfileFieldEdit
                            label="Department"
                            value={draftProfile.department}
                            onChange={(value) => setDraftProfile({ ...draftProfile, department: value })}
                            error={errors.department}
                          />
                        </>
                      )}
                    </TwoCol>
                  </Section>
                )}

                {activeSection === 'professional' && (
                  <Section title="Professional Scope">
                    <p className="text-sm text-gray-300">
                      Configure your legal and compliance focus areas.
                    </p>
                  </Section>
                )}

                {activeSection === 'preferences' && (
                  <Section title="Platform Preferences">
                    <p className="text-sm text-gray-300">
                      Control how information is displayed and processed.
                    </p>
                  </Section>
                )}

                {activeSection === 'security' && (
                  <Section title="Security Controls">
                    <p className="text-sm text-gray-300">
                      Manage authentication, passwords, and session policies.
                    </p>
                  </Section>
                )}

                {activeSection === 'billing' && (
                  <Section title="Billing Overview">
                    <div className="bg-gray-700 rounded-lg p-6">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-white">Enterprise Plan</p>
                          <p className="text-sm text-gray-300">$2,500 / month</p>
                        </div>
                        <div className="text-sm text-gray-300">
                          Next billing: Feb 15, 2026
                        </div>
                      </div>
                    </div>
                  </Section>
                )}
              </div>

              {/* Footer Actions */}
              {!viewMode && (
                <div className="border-t border-gray-700 px-8 py-4 flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setDraftProfile(savedProfile);
                      setViewMode(true);
                      setErrors({});
                    }}
                    className="px-6 py-2 bg-gray-600 text-black rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Validation
                      const newErrors: Record<string, string> = {};
                      if (!draftProfile.fullName.trim()) newErrors.fullName = 'Full Name is required';
                      if (!draftProfile.email.trim()) newErrors.email = 'Email is required';
                      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draftProfile.email)) newErrors.email = 'Invalid email format';
                      if (draftProfile.phone && !/^\+?[\d\s\-\(\)]+$/.test(draftProfile.phone)) newErrors.phone = 'Invalid phone format';

                      if (Object.keys(newErrors).length > 0) {
                        setErrors(newErrors);
                      } else {
                        setSavedProfile(draftProfile);
                        setViewMode(true);
                        setErrors({});
                      }
                    }}
                    className="px-6 py-2 bg-orange-500 text-black rounded-lg hover:bg-orange-600 transition-colors"
                  >
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

/* Internal helper components — still ONE file */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium text-white">{title}</h3>
    {children}
  </div>
);

const TwoCol: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
);

const ProfileFieldView: React.FC<{ label: string; value: string }> = ({
  label,
  value
}) => (
  <div>
    <label className="block text-sm text-gray-400 mb-1">{label}</label>
    <p className="text-base text-white">{value || 'Not set'}</p>
  </div>
);

const ProfileFieldEdit: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}> = ({ label, value, onChange, error, required }) => (
  <div>
    <label className="block text-sm font-medium text-white mb-1">
      {label}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
    {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
  </div>
);

export default Profile;
