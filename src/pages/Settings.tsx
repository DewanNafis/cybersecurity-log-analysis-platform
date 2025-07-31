import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Key,
  Save,
  AlertTriangle,
  Clock,
  Globe,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      logRetentionDays: 90,
      maxLogSize: 1000000,
      realTimeUpdates: true,
      autoRefresh: 30
    },
    alerts: {
      emailNotifications: true,
      slackIntegration: false,
      criticalThresholds: 5,
      emailAddress: 'admin@company.com',
      slackWebhook: ''
    },
    security: {
      sessionTimeout: 60,
      requireMFA: false,
      passwordExpiry: 90,
      maxLoginAttempts: 5
    },
    ai: {
      enabled: true,
      provider: 'openai',
      apiKey: '',
      model: 'gpt-4',
      confidenceThreshold: 0.8
    }
  });

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'alerts', name: 'Alerts & Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'ai', name: 'AI Integration', icon: Globe },
    { id: 'users', name: 'User Management', icon: User }
  ];

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const saveSettings = () => {
    // Save settings to backend
    console.log('Saving settings:', settings);
    // Show success message
  };

  const testConnection = (type: string) => {
    console.log(`Testing ${type} connection...`);
    // Test connection logic
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <button
          onClick={saveSettings}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="flex space-x-6">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-800 rounded-lg p-6 border border-gray-700">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">General Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Log Retention Period (days)
                  </label>
                  <input
                    type="number"
                    value={settings.general.logRetentionDays}
                    onChange={(e) => handleSettingChange('general', 'logRetentionDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Logs older than this will be automatically deleted</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maximum Log File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.general.maxLogSize / 1000000}
                    onChange={(e) => handleSettingChange('general', 'maxLogSize', parseInt(e.target.value) * 1000000)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Auto Refresh Interval (seconds)
                  </label>
                  <select
                    value={settings.general.autoRefresh}
                    onChange={(e) => handleSettingChange('general', 'autoRefresh', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={300}>5 minutes</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="realTimeUpdates"
                    checked={settings.general.realTimeUpdates}
                    onChange={(e) => handleSettingChange('general', 'realTimeUpdates', e.target.checked)}
                    className="mr-3 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="realTimeUpdates" className="text-sm text-gray-300">
                    Enable real-time updates
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Alerts & Notifications</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-400">Receive alerts via email</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.alerts.emailNotifications}
                    onChange={(e) => handleSettingChange('alerts', 'emailNotifications', e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {settings.alerts.emailNotifications && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.alerts.emailAddress}
                      onChange={(e) => handleSettingChange('alerts', 'emailAddress', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium">Slack Integration</p>
                      <p className="text-sm text-gray-400">Send alerts to Slack channel</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.alerts.slackIntegration}
                    onChange={(e) => handleSettingChange('alerts', 'slackIntegration', e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {settings.alerts.slackIntegration && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Slack Webhook URL
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={settings.alerts.slackWebhook}
                        onChange={(e) => handleSettingChange('alerts', 'slackWebhook', e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => testConnection('slack')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Critical Alert Threshold
                  </label>
                  <input
                    type="number"
                    value={settings.alerts.criticalThresholds}
                    onChange={(e) => handleSettingChange('alerts', 'criticalThresholds', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Send alert when this many critical threats are detected</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Security Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={480}>8 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password Expiry (days)
                  </label>
                  <input
                    type="number"
                    value={settings.security.passwordExpiry}
                    onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireMFA"
                    checked={settings.security.requireMFA}
                    onChange={(e) => handleSettingChange('security', 'requireMFA', e.target.checked)}
                    className="mr-3 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="requireMFA" className="text-sm text-gray-300">
                    Require Multi-Factor Authentication
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">AI Integration</h2>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  <p className="text-blue-400 font-medium">AI-Powered Threat Detection</p>
                </div>
                <p className="text-sm text-gray-300">
                  Enable AI analysis to automatically detect anomalies and classify threats using machine learning models.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Enable AI Analysis</p>
                    <p className="text-sm text-gray-400">Use AI to analyze logs and detect threats</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.ai.enabled}
                    onChange={(e) => handleSettingChange('ai', 'enabled', e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {settings.ai.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        AI Provider
                      </label>
                      <select
                        value={settings.ai.provider}
                        onChange={(e) => handleSettingChange('ai', 'provider', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="local">Local Model</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Key
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="password"
                          value={settings.ai.apiKey}
                          onChange={(e) => handleSettingChange('ai', 'apiKey', e.target.value)}
                          placeholder="Enter your API key"
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => testConnection('ai')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Test
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Model
                      </label>
                      <select
                        value={settings.ai.model}
                        onChange={(e) => handleSettingChange('ai', 'model', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="claude-3">Claude 3</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confidence Threshold
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={settings.ai.confidenceThreshold}
                        onChange={(e) => handleSettingChange('ai', 'confidenceThreshold', parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Low (0.1)</span>
                        <span>Current: {settings.ai.confidenceThreshold}</span>
                        <span>High (1.0)</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">User Management</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <User className="h-4 w-4" />
                  <span>Add User</span>
                </button>
              </div>

              <div className="bg-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {[
                      { id: 1, name: 'Admin User', email: 'admin@company.com', role: 'admin', lastLogin: '2024-01-15 14:30', status: 'active' },
                      { id: 2, name: 'Security Analyst', email: 'analyst@company.com', role: 'analyst', lastLogin: '2024-01-15 12:15', status: 'active' },
                      { id: 3, name: 'SOC Operator', email: 'soc@company.com', role: 'viewer', lastLogin: '2024-01-14 16:45', status: 'inactive' }
                    ].map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                            user.role === 'analyst' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.lastLogin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-400 hover:text-blue-300">
                              <Key className="h-4 w-4" />
                            </button>
                            <button className="text-red-400 hover:text-red-300">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}