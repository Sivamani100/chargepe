import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { useRealTimeStations } from "./useRealTimeStation";
import { useBookingSystem } from "./useBookingSystem";

export interface Notification {
  id: string;
  type: 'station_available' | 'booking_reminder' | 'price_drop' | 'queue_update' | 'session_complete' | 'station_nearby' | 'favorite_station_update';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  expires_at?: string;
  action_url?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface NotificationPreferences {
  station_available: boolean;
  booking_reminders: boolean;
  price_drops: boolean;
  queue_updates: boolean;
  session_complete: boolean;
  stations_nearby: boolean;
  favorite_station_updates: boolean;
  quiet_hours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { stations } = useRealTimeStations();
  const { bookings, activeSession } = useBookingSystem();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    station_available: true,
    booking_reminders: true,
    price_drops: true,
    queue_updates: true,
    session_complete: true,
    stations_nearby: true,
    favorite_station_updates: true,
    quiet_hours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
  });
  const [permission, setPermission] = useState<NotificationPermission>("default");

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  };

  // Check if we're in quiet hours
  const isInQuietHours = useCallback(() => {
    if (!preferences.quiet_hours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = preferences.quiet_hours.start.split(":").map(Number);
    const [endHour, endMin] = preferences.quiet_hours.end.split(":").map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }, [preferences]);

  // Show browser notification
  const showBrowserNotification = useCallback((notification: Notification) => {
    if (permission !== "granted" || isInQuietHours()) return;

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: notification.id,
      requireInteraction: notification.priority === "urgent",
    });

    browserNotification.onclick = () => {
      window.focus();
      if (notification.action_url) {
        window.location.href = notification.action_url;
      }
      browserNotification.close();
    };

    // Auto-close after 5 seconds for non-urgent notifications
    if (notification.priority !== "urgent") {
      setTimeout(() => browserNotification.close(), 5000);
    }
  }, [permission, isInQuietHours]);

  // Create notification (stored locally for now)
  const createNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    data?: any,
    priority: Notification['priority'] = "medium",
    actionUrl?: string
  ) => {
    if (!user) return;

    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      data,
      is_read: false,
      priority,
      action_url: actionUrl,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    // Add to local state
    setNotifications(prev => [notification, ...prev]);

    // Show browser notification if enabled
    showBrowserNotification(notification);
  }, [user, showBrowserNotification]);

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications([]);
  };

  // Update preferences
  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  // Smart notification triggers
  useEffect(() => {
    if (!user) return;

    // Booking reminders (15 minutes before)
    const upcomingBookings = bookings.filter(b => 
      b.status === 'confirmed' || b.status === 'pending'
    );

    upcomingBookings.forEach(booking => {
      const bookingTime = new Date(booking.start_time).getTime();
      const now = Date.now();
      const timeUntilBooking = bookingTime - now;

      // 15 minutes before
      if (timeUntilBooking > 0 && timeUntilBooking <= 15 * 60 * 1000) {
        if (preferences.booking_reminders) {
          // Check if we already have this notification
          const existingNotification = notifications.find(n => 
            n.type === 'booking_reminder' && 
            n.data?.bookingId === booking.id
          );

          if (!existingNotification) {
            createNotification(
              'booking_reminder',
              'Charging Session Starting Soon',
              `Your charging session starts in 15 minutes`,
              { bookingId: booking.id },
              'high',
              `/bookings/${booking.id}`
            );
          }
        }
      }
    });

    // Station availability alerts
    const favoriteStations = stations.slice(0, 5); // User's favorite stations
    favoriteStations.forEach(station => {
      if (station.live_available_slots > 0 && station.utilization_rate < 50) {
        if (preferences.station_available) {
          // Check if we already have this notification
          const existingNotification = notifications.find(n => 
            n.type === 'station_available' && 
            n.data?.stationId === station.id
          );

          if (!existingNotification) {
            createNotification(
              'station_available',
              'Station Available',
              `${station.name} now has ${station.live_available_slots} available slots`,
              { stationId: station.id },
              'medium',
              `/stations/${station.id}`
            );
          }
        }
      }
    });

    // Session complete notification
    if (activeSession && activeSession.charging_progress >= 95) {
      if (preferences.session_complete) {
        // Check if we already have this notification
        const existingNotification = notifications.find(n => 
          n.type === 'session_complete' && 
          n.data?.sessionId === activeSession.id
        );

        if (!existingNotification) {
          createNotification(
            'session_complete',
            'Charging Almost Complete',
            `Your charging session is ${Math.round(activeSession.charging_progress)}% complete`,
            { sessionId: activeSession.id },
            'high',
            `/bookings/${activeSession.id}`
          );
        }
      }
    }
  }, [user, bookings, stations, activeSession, preferences, notifications, createNotification]);

  // Initial permission check
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Cleanup expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => 
        prev.filter(n => !n.expires_at || new Date(n.expires_at) > new Date())
      );
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    preferences,
    permission,
    unreadCount: notifications.length,
    createNotification,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    requestPermission,
  };
};
