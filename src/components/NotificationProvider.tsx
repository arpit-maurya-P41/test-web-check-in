'use client';
import { createContext, useContext } from 'react';
import { notification } from 'antd';
import { NotificationType } from '@/type/types';

interface NotificationContextType {
  notify: (type: NotificationType, message: string) => void;
}
const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [api, contextHolder] = notification.useNotification();

  const notify = (type: NotificationType, message: string) => {
    api[type]({
      message
    });
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within NotificationProvider");
  return context.notify;
};
