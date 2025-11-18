// services/NotificationService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  async requestPermissions() {
    if (!Device.isDevice) {
      console.log('Las notificaciones push solo funcionan en dispositivos físicos');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('No se obtuvieron permisos para notificaciones');
      return false;
    }

    return true;
  }

  async getExpoPushToken() {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      //console.log('Expo Push Token:', token);
      return token.data;
    } catch (error) {
      console.error('Error al obtener push token:', error);
      return null;
    }
  }

  /**
   * Programar notificación 1 hora antes de una clase
   */
  async scheduleClassReminder(classData) {
    try {
      const { id, title, startTime, days } = classData;
      
      // Calcular el tiempo de la notificación (1 hora antes)
      const classDate = new Date(startTime);
      const notificationDate = new Date(classDate.getTime() - 60 * 60 * 1000); // 1 hora antes
      
      // No programar si la fecha ya pasó
      if (notificationDate < new Date()) {
        //console.log('La clase ya pasó o es muy pronto');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Clase próxima',
          body: `${title} comienza en 1 hora${days ? ` en ${days}` : ''}`,
          data: {
            type: 'class_reminder',
            classId: id,
            classTitle: title,
            startTime: startTime,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'class_reminder',
        },
        trigger: {
          date: notificationDate,
        },
      });

      // Guardar el ID de la notificación para poder cancelarla después
      await this.saveNotificationId(id, notificationId);
      
      //console.log(`Notificación programada para clase: ${title}`, notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error al programar notificación de clase:', error);
      return null;
    }
  }

  /**
   * Programar notificación para una tarea
   */
  async scheduleTaskReminder(taskData) {
  try {
    const { id, title, dueDate, priority } = taskData;
    const dueDateTime = new Date(dueDate);

    // Diferentes recordatorios según prioridad
    const reminderOffsets = {
      high:  [24, 12, 6, 2, 1],   // horas antes
      medium:[24, 6, 1],
      low:   [24]
    };

    const offsets = reminderOffsets[priority] || [24];

    let scheduledIds = [];

    for (let hoursBefore of offsets) {
      const notificationDate = new Date(
        dueDateTime.getTime() - hoursBefore * 60 * 60 * 1000
      );

      if (notificationDate < new Date()) continue; // no se programa si ya pasó

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Recordatorio de Tarea",
          body: `"${title}" vence en ${hoursBefore}h`,
          data: {
            type: "task_reminder",
            taskId: id,
            priority,
            dueDate,
            hoursBefore,
          },
          sound: "default",
          categoryIdentifier: "task_reminder",
        },
        trigger: { date: notificationDate },
      });

      scheduledIds.push(notificationId);
    }

    await this.saveNotificationId(`task_${id}`, scheduledIds);
    //console.log(`Notificaciones de tarea programadas:`, scheduledIds);

    return scheduledIds;

  } catch (error) {
    console.error("Error al programar notificaciones de tarea:", error);
    return null;
  }
}

  /**
   * Programar múltiples recordatorios para un evento
   */
  async scheduleMultipleReminders(eventData, type = "event", minutesBeforeArray = []) {
    try {
      const { id, evento_titulo, evento_fecha_date } = eventData;

      // Convertir fecha del evento
      const eventDate = new Date(evento_fecha_date);
      const now = new Date();

      let scheduledIds = [];

      for (let minutesBefore of minutesBeforeArray) {
        const reminderDate = new Date(eventDate.getTime() - minutesBefore * 60 * 1000);

        if (reminderDate <= now) continue; // ignorar fechas pasadas

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Recordatorio de Evento",
            body: `“${evento_titulo}” comienza en ${minutesBefore} minutos.`,
            data: {
              type: type,
              eventId: id,
              minutesBefore,
            },
            sound: "default",
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: { date: reminderDate },
        });

        scheduledIds.push(notificationId);
      }

      // Guardar IDs en AsyncStorage
      await this.saveNotificationId(`event_${id}`, scheduledIds);

      return scheduledIds;
    } catch (error) {
      console.error("Error al programar múltiples recordatorios:", error);
      return null;
    }
  }



  /**
   * Programar notificaciones diarias (resumen del día)
   */
  async scheduleDailySummary(hour = 7, minute = 0) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Buenos días',
          body: 'Revisa tus clases y tareas de hoy',
          data: { type: 'daily_summary' },
        },
        trigger: {
          hour: hour,
          minute: minute,
          repeats: true,
        },
      });

      //console.log('Resumen diario programado');
      return notificationId;
    } catch (error) {
      console.error('Error al programar resumen diario:', error);
      return null;
    }
  }

  /**
   * Cancelar una notificación específica
   */
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      //console.log('Notificación cancelada:', notificationId);
    } catch (error) {
      console.error('Error al cancelar notificación:', error);
    }
  }

  /**
   * Cancelar notificaciones de una clase
   */
  async cancelClassNotifications(classId) {
    try {
      const notificationId = await this.getNotificationId(classId);
      if (notificationId) {
        await this.cancelNotification(notificationId);
        await this.removeNotificationId(classId);
      }
    } catch (error) {
      console.error('Error al cancelar notificaciones de clase:', error);
    }
  }

  /**
   * Cancelar todas las notificaciones programadas
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem('scheduled_notifications');
      //console.log('Todas las notificaciones canceladas');
    } catch (error) {
      console.error('Error al cancelar todas las notificaciones:', error);
    }
  }

  /**
   * Obtener todas las notificaciones programadas
   */
  async getAllScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      //console.log('Notificaciones programadas:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      return [];
    }
  }

  /**
   * Enviar notificación inmediata (para pruebas)
   */
  async sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Notificación de Prueba',
          body: 'Las notificaciones están funcionando correctamente',
          data: { type: 'test' },
        },
        trigger: null, // Enviar inmediatamente
      });
      //console.log('Notificación de prueba enviada');
    } catch (error) {
      console.error('Error al enviar notificación de prueba:', error);
    }
  }

  /**
   * Guardar ID de notificación
   */
  async saveNotificationId(itemId, notificationId) {
    try {
      const data = await AsyncStorage.getItem('scheduled_notifications');
      const notifications = data ? JSON.parse(data) : {};
      notifications[itemId] = notificationId;
      await AsyncStorage.setItem('scheduled_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error al guardar ID de notificación:', error);
    }
  }

  /**
   * Obtener ID de notificación
   */
  async getNotificationId(itemId) {
    try {
      const data = await AsyncStorage.getItem('scheduled_notifications');
      const notifications = data ? JSON.parse(data) : {};
      return notifications[itemId] || null;
    } catch (error) {
      console.error('Error al obtener ID de notificación:', error);
      return null;
    }
  }

  /**
   * Eliminar ID de notificación
   */
  async removeNotificationId(itemId) {
    try {
      const data = await AsyncStorage.getItem('scheduled_notifications');
      const notifications = data ? JSON.parse(data) : {};
      delete notifications[itemId];
      await AsyncStorage.setItem('scheduled_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error al eliminar ID de notificación:', error);
    }
  }

  /**
   * Configurar listeners para notificaciones
   */
  setupNotificationListeners(onNotificationReceived, onNotificationResponse) {
    // Listener para cuando se recibe una notificación
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      //console.log('Notificación recibida:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listener para cuando el usuario interactúa con la notificación
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      //console.log('Usuario interactuó con notificación:', response);
      if (onNotificationResponse) {
        onNotificationResponse(response);
      }
    });
  }

  /**
   * Limpiar listeners
   */
  removeNotificationListeners() {
    try {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    } catch (e) {
      console.warn("Error removiendo listeners:", e);
    }
  }

  /**
   * Re-programar todas las notificaciones de clases
   */
  async reprogramClassNotifications(classes) {
    try {
      // Cancelar todas las notificaciones de clases existentes
      const scheduledNotifications = await this.getAllScheduledNotifications();
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.type === 'class_reminder') {
          await this.cancelNotification(notification.identifier);
        }
      }

      // Programar nuevas notificaciones
      let count = 0;
      for (const classItem of classes) {
        const result = await this.scheduleClassReminder(classItem);
        if (result) count++;
      }

      //console.log(`${count} notificaciones de clases programadas`);
      return count;
    } catch (error) {
      console.error('Error al re-programar notificaciones:', error);
      return 0;
    }
  }
}

// Exportar instancia única (Singleton)
export default new NotificationService();