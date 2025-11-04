// hooks/useNotifications.js
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { registerForPushNotifications } from '../services/NotificationService';

export default function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const router = useRouter();

  useEffect(() => {
    // Registrar para notificaciones
    registerForPushNotifications().then(token => {
      if (token) setExpoPushToken(token);
    });

    // Listener cuando llega una notificación (app en foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
      setNotification(notification);
    });

    // Listener cuando el usuario toca la notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificación tocada:', response);
      
      const data = response.notification.request.content.data;
      
      // Navegar según el tipo de notificación
      if (data.screen) {
        router.push(`/(tabs)/${data.screen}`);
      }
      
      if (data.type === 'task' && data.taskId) {
        router.push(`/(tabs)/tareas`);
      }
      
      if (data.type === 'event' && data.eventId) {
        router.push(`/(tabs)/calendar`);
      }
    });

    // Cleanup
    return () => {
      if (notificationListener.current) {
        Notifications.addNotificationReceivedListener(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.addNotificationReceivedListener(responseListener.current);
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
}