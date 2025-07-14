import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $user, $isLoading } from "@starter/lib/auth";

interface AccountSettingsProps {
  className?: string;
}

interface SettingsData {
  emailNotifications: boolean;
  marketingEmails: boolean;
  dataSharing: boolean;
  twoFactorAuth: boolean;
}

export function AccountSettings({ className = "" }: AccountSettingsProps) {
  const user = useStore($user);
  const isLoading = useStore($isLoading);

  const [settings, setSettings] = useState<SettingsData>({
    emailNotifications: true,
    marketingEmails: false,
    dataSharing: false,
    twoFactorAuth: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (key: keyof SettingsData) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    // TODO: Implement settings save to backend
    console.log("Saving settings:", settings);
    setHasChanges(false);
  };

  const handleExportData = async () => {
    try {
      // TODO: Implement data export functionality
      const userData = {
        profile: user,
        settings: settings,
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `account-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };

  if (!user) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-600">Unable to load account settings.</p>
      </div>
    );
  }

  const settingsOptions = [
    {
      key: "emailNotifications" as const,
      title: "Email Notifications",
      description: "Receive email notifications about your account activity",
      icon: "📧",
    },
    {
      key: "marketingEmails" as const,
      title: "Marketing Communications",
      description: "Receive updates about new features and promotions",
      icon: "📢",
    },
    {
      key: "dataSharing" as const,
      title: "Analytics & Usage Data",
      description: "Help improve our service by sharing anonymous usage data",
      icon: "📊",
    },
    {
      key: "twoFactorAuth" as const,
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
      icon: "🔐",
    },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
        <p className="text-gray-600">Manage your account preferences and security settings.</p>
      </div>

      {/* Privacy & Communication Settings */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy & Communications</h3>
        <div className="space-y-4">
          {settingsOptions.map((option) => (
            <div key={option.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{option.icon}</span>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{option.title}</h4>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(option.key)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings[option.key] ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                    settings[option.key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {hasChanges && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleExportData}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="text-2xl mr-3">📥</span>
            <div className="text-left">
              <h4 className="text-sm font-medium text-gray-900">Export Your Data</h4>
              <p className="text-sm text-gray-500">Download a copy of your account data</p>
            </div>
          </button>

          <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
            <span className="text-2xl mr-3">🗑️</span>
            <div className="text-left">
              <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
              <p className="text-sm text-gray-500">Permanently delete your account and data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Account ID</dt>
            <dd className="mt-1 text-gray-900 font-mono break-all">{user._id}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Account Created</dt>
            <dd className="mt-1 text-gray-900">
              {user._creationTime 
                ? new Date(user._creationTime).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Unknown"
              }
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-gray-900">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long", 
                day: "numeric",
              })}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Account Status</dt>
            <dd className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}