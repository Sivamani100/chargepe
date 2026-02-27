import React, { useState } from 'react';
import { Bell, BellOff, Settings, X, Check, AlertTriangle, Info, Zap, DollarSign } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationsPanelProps {
  className?: string;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ className = "" }) => {
  const {
    notifications,
    unreadCount,
    preferences,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    sendNotification,
  } = useNotifications();

  const [showPreferences, setShowPreferences] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_reminder':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'station_available':
        return <Zap className="w-5 h-5 text-green-600" />;
      case 'price_drop':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'session_complete':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  return (
    <div className={`brutal-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      {showPreferences && (
        <div className="mb-6 p-4 bg-accent rounded-lg">
          <h4 className="font-medium mb-4">Notification Preferences</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm">Station Available</span>
              <input
                type="checkbox"
                checked={preferences.stationAvailable}
                onChange={(e) => handlePreferenceChange('stationAvailable', e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Booking Reminders</span>
              <input
                type="checkbox"
                checked={preferences.bookingReminders}
                onChange={(e) => handlePreferenceChange('bookingReminders', e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Price Drops</span>
              <input
                type="checkbox"
                checked={preferences.priceDrops}
                onChange={(e) => handlePreferenceChange('priceDrops', e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Session Complete</span>
              <input
                type="checkbox"
                checked={preferences.sessionComplete}
                onChange={(e) => handlePreferenceChange('sessionComplete', e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Quiet Hours</span>
              <input
                type="checkbox"
                checked={preferences.quietHoursEnabled}
                onChange={(e) => handlePreferenceChange('quietHoursEnabled', e.target.checked)}
                className="rounded"
              />
            </label>
            {preferences.quietHoursEnabled && (
              <div className="flex items-center gap-4 ml-4">
                <div>
                  <label className="text-xs text-muted-foreground">From</label>
                  <input
                    type="time"
                    value={preferences.quietHoursStart}
                    onChange={(e) => handlePreferenceChange('quietHoursStart', e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">To</label>
                  <input
                    type="time"
                    value={preferences.quietHoursEnd}
                    onChange={(e) => handlePreferenceChange('quietHoursEnd', e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                notification.isRead 
                  ? 'bg-background border-border' 
                  : 'bg-accent border-primary'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{notification.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </span>
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 hover:bg-accent rounded transition-colors"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  {notification.actionUrl && (
                    <button
                      className="text-sm text-primary hover:underline"
                      onClick={() => {
                        // Handle action URL navigation
                        console.log('Navigate to:', notification.actionUrl);
                      }}
                    >
                      View Details →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="font-medium mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => sendNotification({
              type: 'test',
              title: 'Test Notification',
              message: 'This is a test notification to verify the system is working.',
            })}
            className="p-3 bg-accent rounded-lg hover:bg-accent/80 transition-colors text-sm"
          >
            Send Test
          </button>
          <button
            onClick={markAllAsRead}
            className="p-3 bg-accent rounded-lg hover:bg-accent/80 transition-colors text-sm"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
