import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './Notifications.css';

const Notifications = () => {
  const { theme, notifications, addNotification } = useApp();

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  const sendPushNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  // Example of how to trigger a notification
  const triggerTestNotification = () => {
    const notification = {
      id: Date.now(),
      title: 'Special Offer!',
      message: 'Get 20% off on your next order',
      timestamp: new Date(),
      read: false
    };
    
    addNotification(notification);
    sendPushNotification(notification.title, notification.message);
  };

  return (
    <div 
      className="notifications-container"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <div className="notifications-header">
        <h2>Notifications</h2>
        <button 
          onClick={triggerTestNotification}
          style={{ backgroundColor: theme.primary }}
        >
          Test Notification
        </button>
      </div>
      <div className="notifications-list">
        {notifications.map(notification => (
          <div 
            key={notification.id}
            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            style={{ backgroundColor: theme.secondary }}
          >
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
            <span className="notification-time">
              {new Date(notification.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
