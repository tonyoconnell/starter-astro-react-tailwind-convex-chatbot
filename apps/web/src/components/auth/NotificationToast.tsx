import { useStore } from "@nanostores/react";
import { $notifications, notificationActions, type Notification } from "@starter/lib/auth";

interface ToastItemProps {
  notification: Notification;
}

function ToastItem({ notification }: ToastItemProps) {
  const { type, title, message, actions } = notification;

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  const getStyles = () => {
    const base = "border-l-4 p-4 rounded-md shadow-lg max-w-md w-full";
    switch (type) {
      case "success":
        return `${base} bg-green-50 border-green-400 text-green-800`;
      case "error":
        return `${base} bg-red-50 border-red-400 text-red-800`;
      case "warning":
        return `${base} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case "info":
        return `${base} bg-blue-50 border-blue-400 text-blue-800`;
      default:
        return `${base} bg-gray-50 border-gray-400 text-gray-800`;
    }
  };

  return (
    <div className={getStyles()}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-xl">{getIcon()}</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-sm mt-1 opacity-90">{message}</p>
          {actions && actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {actions.map((action: { label: string; onClick: () => void }, index: number) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="text-xs font-medium underline hover:no-underline"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => notificationActions.remove(notification.id)}
            className="text-sm opacity-50 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationToast() {
  const notifications = useStore($notifications);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification: Notification) => (
        <ToastItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}