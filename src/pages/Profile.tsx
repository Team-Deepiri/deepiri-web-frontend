import React, { useState, useEffect, ChangeEvent } from 'react';

const Profile: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [loading, setLoading] = useState<boolean>(false);

  const sections = [
    { id: 'personal', label: 'Personal Information', icon: '👤' },
    { id: 'professional', label: 'Professional Information', icon: '💼' },
    { id: 'preferences', label: 'Platform Preferences', icon: '⚙️' },
    { id: 'notifications', label: 'Notification Settings', icon: '🔔' },
    { id: 'integrations', label: 'Integrations & API', icon: '🔗' },
    { id: 'security', label: 'Security Settings', icon: '🔒' },
    { id: 'analytics', label: 'Usage Analytics', icon: '📊' },
    { id: 'billing', label: 'Billing & Subscription', icon: '💳' }
  ];

  const handleSave = () => {
    // Placeholder for save functionality
    console.log('Saving profile data...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
              {/* Personal Information */}
              {activeSection === 'personal' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Johnathan P. Whitaker"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        defaultValue="General Counsel"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue="j.whitaker@acme-global.com"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        defaultValue="+1 (212) 555-0147"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        defaultValue="Acme Global Corporation"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        defaultValue="Legal & Compliance"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Professional Information */}
              {activeSection === 'professional' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Professional Information</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Jurisdiction Expertise
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {['US Federal', 'New York', 'California', 'Delaware', 'EU GDPR', 'UK', 'APAC', 'Other'].map((jurisdiction) => (
                          <label key={jurisdiction} className="flex items-center">
                            <input
                              type="checkbox"
                              defaultChecked={['US Federal', 'New York', 'California', 'Delaware'].includes(jurisdiction)}
                              className="mr-2"
                            />
                            {jurisdiction}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Document Types You Manage
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          'Commercial Leases',
                          'MSAs (Master Service Agreements)',
                          'Office Leases',
                          'Service Agreements',
                          'Retail Leases',
                          'Industrial Leases',
                          'NDAs'
                        ].map((docType) => (
                          <label key={docType} className="flex items-center">
                            <input
                              type="checkbox"
                              defaultChecked={['Commercial Leases', 'MSAs (Master Service Agreements)', 'Office Leases', 'Service Agreements'].includes(docType)}
                              className="mr-2"
                            />
                            {docType}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Areas of Focus
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          'Financial Terms Extraction',
                          'Obligation Tracking',
                          'Compliance Monitoring',
                          'Risk Assessment',
                          'Clause Evolution Tracking'
                        ].map((focus) => (
                          <label key={focus} className="flex items-center">
                            <input
                              type="checkbox"
                              defaultChecked={['Financial Terms Extraction', 'Obligation Tracking', 'Compliance Monitoring'].includes(focus)}
                              className="mr-2"
                            />
                            {focus}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Average Document Volume
                        </label>
                        <div className="space-y-2">
                          {[
                            { value: '1-10', label: '1-10 per month' },
                            { value: '11-50', label: '11-50 per month' },
                            { value: '50+', label: '50+ per month' }
                          ].map((option) => (
                            <label key={option.value} className="flex items-center">
                              <input
                                type="radio"
                                name="documentVolume"
                                defaultChecked={option.value === '11-50'}
                                className="mr-2"
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Team Size
                        </label>
                        <div className="space-y-2">
                          {[
                            { value: 'solo', label: 'Solo' },
                            { value: '2-5', label: '2-5 members' },
                            { value: '6-10', label: '6-10 members' },
                            { value: '11-20', label: '11-20 members' },
                            { value: '20+', label: '20+ members' }
                          ].map((option) => (
                            <label key={option.value} className="flex items-center">
                              <input
                                type="radio"
                                name="teamSize"
                                defaultChecked={option.value === '6-10'}
                                className="mr-2"
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Professional Settings
                    </button>
                  </div>
                </div>
              )}

              {/* Platform Preferences */}
              {activeSection === 'preferences' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Preferences</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Dashboard Default View
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'kpi', label: 'KPI Overview' },
                          { value: 'activity', label: 'Activity Feed' },
                          { value: 'risk', label: 'Risk Dashboard' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="radio"
                              name="defaultView"
                              defaultChecked={option.value === 'kpi'}
                              className="mr-2"
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Document List View
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'grid', label: 'Grid View' },
                          { value: 'list', label: 'List View' },
                          { value: 'compact', label: 'Compact View' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="radio"
                              name="listView"
                              defaultChecked={option.value === 'list'}
                              className="mr-2"
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Items Per Page
                        </label>
                        <select
                          defaultValue={25}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Format
                        </label>
                        <select
                          defaultValue="MM/DD/YYYY"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency Display
                        </label>
                        <select
                          defaultValue="USD"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="JPY">JPY (¥)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time Zone
                        </label>
                        <input
                          type="text"
                          defaultValue="America/New_York"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          defaultValue="en"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="ja">Japanese</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Placeholder sections */}
              {activeSection === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Email Notifications
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-3" />
                          Daily Digest
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-3" />
                          Overdue Alerts
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-3" />
                          Processing Complete
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" />
                          Weekly Reports
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        In-App Notifications
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-3" />
                          All Activities
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-3" />
                          Critical Only
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Notification Settings
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'integrations' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Integrations & API</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Document Management Systems
                      </label>
                      <div className="space-y-4">
                        <div>
                          <label className="flex items-center mb-2">
                            <input type="checkbox" className="mr-3" />
                            SharePoint Integration
                          </label>
                          <input
                            type="text"
                            placeholder="SharePoint Folder URL"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="flex items-center mb-2">
                            <input type="checkbox" className="mr-3" />
                            Google Drive Integration
                          </label>
                          <input
                            type="text"
                            placeholder="Google Drive Folder ID"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        API Access
                      </label>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">API Key</label>
                          <div className="flex">
                            <input
                              type="password"
                              defaultValue="••••••••••••••••••••••••••••••••"
                              readOnly
                              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200">
                              Show
                            </button>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Regenerate Key
                          </button>
                          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                            Copy Key
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Integration Settings
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Two-Factor Authentication
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        Enable Two-Factor Authentication
                      </label>
                      <p className="text-sm text-gray-500 mt-2">Add an extra layer of security to your account</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Password Management
                      </label>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                          <input
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">New Password</label>
                          <input
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Change Password
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Session Management
                      </label>
                      <label className="flex items-center mb-3">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        Remember me on this device
                      </label>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Auto-logout after</label>
                        <select
                          defaultValue={60}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={240}>4 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Security Settings
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'analytics' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Usage Analytics</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Current Usage (Last 30 Days)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">48</div>
                          <div className="text-sm text-gray-600">Documents Processed</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">156</div>
                          <div className="text-sm text-gray-600">Clauses Identified</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">92.4%</div>
                          <div className="text-sm text-gray-600">Average Confidence</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Storage Usage</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Documents</span>
                          <span className="text-sm text-gray-600">4.2 GB / 10 GB</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                        </div>
                        <button className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                          Upgrade Storage
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'billing' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing & Subscription</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h3>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xl font-semibold text-gray-900">Enterprise Plan</h4>
                            <p className="text-gray-600 mt-1">$2,500/month</p>
                            <ul className="text-sm text-gray-600 mt-3 space-y-1">
                              <li>• 100 documents/month</li>
                              <li>• Advanced AI analysis</li>
                              <li>• Priority support</li>
                              <li>• API access</li>
                            </ul>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Next billing: Feb 15, 2024</div>
                            <div className="text-sm text-gray-600 mt-1">Visa •••• 4242</div>
                          </div>
                        </div>
                        <div className="mt-6 flex space-x-3">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Update Payment Method
                          </button>
                          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                            Upgrade Plan
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Usage This Period</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">48/100</div>
                          <div className="text-sm text-gray-600">Documents</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">1,245/5,000</div>
                          <div className="text-sm text-gray-600">API Calls</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">4.2/10 GB</div>
                          <div className="text-sm text-gray-600">Storage</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
