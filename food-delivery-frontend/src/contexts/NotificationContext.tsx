import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface NotificationType {
  _id: string;
  recipient: string;
  type: "email" | "sms";
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: NotificationType[];
  unreadCount: number;
  sendNotification: (
    type: string,
    recipient: string,
    data: any
  ) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const NOTIFICATION_SERVICE_URL =
    process.env.REACT_APP_NOTIFICATION_SERVICE_URL || "http://localhost:3005";

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const sendNotification = async (
    type: string,
    recipient: string,
    data: any
  ) => {
    try {
      await axios.post(
        `${NOTIFICATION_SERVICE_URL}/notify/${type}`,
        {
          recipient,
          ...data,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification._id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Mock function to simulate receiving notifications
  // In production, this would be replaced with WebSocket or Server-Sent Events
  useEffect(() => {
    if (user) {
      const mockNotification = {
        _id: Date.now().toString(),
        recipient: user.email,
        type: "email" as const,
        subject: "New Order Update",
        message: "Your order status has been updated",
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => [mockNotification, ...prev]);
    }
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        sendNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
