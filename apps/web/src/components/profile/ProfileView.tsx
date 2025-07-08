import { useStore } from "@nanostores/react";
import { $user, $isLoading } from "@starter/lib/auth";
import { AuthLoadingSpinner } from "../auth/AuthLoadingSpinner";

interface ProfileViewProps {
  showEditButton?: boolean;
  onEditClick?: () => void;
  className?: string;
}

export function ProfileView({ 
  showEditButton = true, 
  onEditClick, 
  className = "" 
}: ProfileViewProps) {
  const user = useStore($user);
  const isLoading = useStore($isLoading);

  if (isLoading) {
    return (
      <div className={className}>
        <AuthLoadingSpinner message="Loading profile..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Found</h3>
        <p className="text-gray-600">Unable to load profile information.</p>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", 
      day: "numeric",
    });
  };

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Profile Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-medium">
              {userInitials}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-2 border-white rounded-full"></div>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          {user.email && (
            <p className="text-gray-600 mb-2">{user.email}</p>
          )}
          {user._creationTime && (
            <p className="text-sm text-gray-500">
              Member since {formatDate(user._creationTime)}
            </p>
          )}
        </div>

        {showEditButton && (
          <button
            onClick={onEditClick}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="text-sm text-gray-900">{user.name || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email Address</dt>
              <dd className="text-sm text-gray-900">{user.email || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Account ID</dt>
              <dd className="text-sm text-gray-900 font-mono break-all">{user._id}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="text-sm">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Account Type</dt>
              <dd className="text-sm text-gray-900">Standard User</dd>
            </div>
            {user._creationTime && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Joined</dt>
                <dd className="text-sm text-gray-900">{formatDate(user._creationTime)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No recent activity to display</p>
        </div>
      </div>
    </div>
  );
}