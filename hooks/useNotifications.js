// hooks/useNotifications.js
import NotificationService from '@/services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export default function useNotifications() {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    classReminders: true,
    taskReminders: true,
    dailySummary: false,
    emailNotifications: false,
    pushNotifications: true,
    classReminderTime: 60,
    taskReminderTime: 24,
  });

  useEffect(() => {
    initialize();
    
    // Configurar listeners
    NotificationService.setupNotificationListeners(
      handleNotificationReceived,
      handleNotificationResponse
    );

    return () => {
      NotificationService.removeNotificationListeners();
    };
  }, []);

  const initialize = async () => {
    await checkPermissions();
    await loadSettings();
  };

  const checkPermissions = async () => {
    const granted = await NotificationService.requestPermissions();
    setPermissionsGranted(granted);
    return granted;
  };

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('notification_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await AsyncStorage.setItem('notification_settings', JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const handleNotificationReceived = (notification) => {
    //console.log('Notificación recibida:', notification.request.content.title);
    // Aquí puedes actualizar el estado de la app, mostrar un badge, etc.
  };

  const handleNotificationResponse = (response) => {
    const data = response.notification.request.content.data;
    //console.log('Usuario tocó notificación:', data);
    
    // Navegar según el tipo de notificación
    switch (data.type) {
      case 'class_reminder':
        // router.push(`/class/${data.classId}`);
        console.log('Navegar a clase:', data.classId);
        break;
      case 'task_reminder':
        // router.push(`/task/${data.taskId}`);
        console.log('Navegar a tarea:', data.taskId);
        break;
      case 'daily_summary':
        // router.push('/schedule');
        console.log('Navegar a horario');
        break;
    }
  };

  /**
   * Programar notificaciones para una clase
   */
  const scheduleClassNotification = useCallback(async (classData) => {
    if (!settings.notificationsEnabled || !settings.classReminders) {
      return null;
    }

    return await NotificationService.scheduleClassReminder(classData);
  }, [settings]);

  /**
   * Programar notificaciones para una tarea
   */
  const scheduleTaskNotification = useCallback(async (taskData) => {
    if (!settings.notificationsEnabled || !settings.taskReminders) {
      return null;
    }

    return await NotificationService.scheduleTaskReminder(taskData);
  }, [settings]);

  /**
   * Programar notificaciones para todas las clases del horario
   */
  const scheduleAllClassNotifications = useCallback(async (classes) => {
    if (!settings.notificationsEnabled || !settings.classReminders) {
      return 0;
    }

    let count = 0;
    for (const classItem of classes) {
      const result = await NotificationService.scheduleClassReminder(classItem);
      if (result) count++;
    }
    
    return count;
  }, [settings]);

  /**
   * Programar notificaciones para todas las tareas
   */
  const scheduleAllTaskNotifications = useCallback(async (tasks) => {
    if (!settings.notificationsEnabled || !settings.taskReminders) {
      return 0;
    }

    let count = 0;
    for (const task of tasks) {
      if (!task.completed) {
        const result = await NotificationService.scheduleTaskReminder(task);
        if (result) count++;
      }
    }
    
    return count;
  }, [settings]);

  /**
   * Cancelar notificación de una clase
   */
  const cancelClassNotification = useCallback(async (classId) => {
    await NotificationService.cancelClassNotifications(classId);
  }, []);

  /**
   * Cancelar todas las notificaciones
   */
  const cancelAllNotifications = useCallback(async () => {
    await NotificationService.cancelAllNotifications();
  }, []);

  /**
   * Enviar notificación de prueba
   */
  const sendTestNotification = useCallback(async () => {
    await NotificationService.sendTestNotification();
  }, []);

  /**
   * Obtener todas las notificaciones programadas
   */
  const getScheduledNotifications = useCallback(async () => {
    return await NotificationService.getAllScheduledNotifications();
  }, []);

  return {
    // Estados
    permissionsGranted,
    settings,
    
    // Funciones
    checkPermissions,
    updateSettings,
    scheduleClassNotification,
    scheduleTaskNotification,
    scheduleAllClassNotifications,
    scheduleAllTaskNotifications,
    cancelClassNotification,
    cancelAllNotifications,
    sendTestNotification,
    getScheduledNotifications,
  };
}