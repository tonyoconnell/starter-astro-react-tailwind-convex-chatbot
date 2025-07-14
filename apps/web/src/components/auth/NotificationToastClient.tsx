import React from 'react';
import { createRoot } from 'react-dom/client';
import { NotificationToast } from './NotificationToast';

// Client-side initialization
if (typeof window !== 'undefined') {
  const container = document.getElementById('notification-container');
  if (container) {
    const root = createRoot(container);
    root.render(<NotificationToast />);
  }
}

export default NotificationToast;