// services/NotificationService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, 
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Solicitar permisos para notificaciones
 */
export async function registerForPushNotifications() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#667eea',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Para recibir recordatorios, necesitamos que habilites las notificaciones.',
        [{ text: 'OK' }]
      );
      return null;
    }
    
    // Obtener token de push
    token = (await Notifications.getExpoPushTokenAsync()).data;
    //console.log('Push token:', token);
    
    return token;
  } else {
    console.log('Debe usar un dispositivo físico para notificaciones push');
  }

  return token;
}

/**
 * Programar notificación para una tarea
 * @param {Object} tarea - Objeto de tarea
 * @param {number} minutesBefore - Minutos antes de la fecha de entrega
 */
export async function scheduleTaskNotification(tarea, minutesBefore = 60) {
  try {
    const fechaEntrega = tarea.tarea_fecha_entrega_date || tarea.tarea_fecha_entrega?.toDate();
    
    if (!fechaEntrega) {
      console.log('Tarea sin fecha de entrega');
      return null;
    }

    // Calcular fecha de notificación
    const notificationDate = new Date(fechaEntrega.getTime() - (minutesBefore * 60 * 1000));
    
    // No programar si ya pasó
    if (notificationDate < new Date()) {
      console.log('Fecha de notificación ya pasó');
      return null;
    }
    console.log('🕓 Fecha actual:', new Date());
    console.log('📅 Fecha evento:', fechaEvento);
    console.log('🔔 Fecha notificación:', notificationDate);
    console.log('⏱️ Diferencia en minutos:', (notificationDate - new Date()) / 60000);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 Recordatorio de Tarea',
        body: `${tarea.tarea_titulo} - Entrega en ${minutesBefore} minutos`,
        data: { 
          type: 'task',
          taskId: tarea.id,
          screen: 'tareas'
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: notificationDate,
      },
    });
    


    // Guardar ID de notificación para poder cancelarla después
    await saveNotificationId(tarea.id, notificationId, 'task');
    
    console.log('Notificación de tarea programada:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error programando notificación de tarea:', error);
    return null;
  }
}

/**
 * Programar notificación para un evento
 * @param {Object} evento - Objeto de evento
 * @param {number} minutesBefore - Minutos antes del evento
 */
export async function scheduleEventNotification(evento, minutesBefore = 30) {
  try {
    const fechaEvento =
      evento.evento_fecha_date || evento.evento_fecha?.toDate?.();

    if (!fechaEvento) {
      console.log('⚠️ Evento sin fecha válida:', evento);
      return null;
    }

    // Convertimos a UTC
    const fechaEventoUTC = new Date(fechaEvento.getTime() + fechaEvento.getTimezoneOffset() * 60000);

    const notificationDate = new Date(fechaEventoUTC.getTime() - minutesBefore * 60 * 1000);

    if (notificationDate.getTime() - Date.now() < 60 * 1000) {
      notificationDate.setTime(Date.now() + 60 * 1000);
    }

    // 📋 Mostramos datos útiles en consola
    console.log('🕓 Fecha actual:', new Date());
    console.log('📅 Fecha del evento:', fechaEvento);
    console.log('🔔 Fecha de notificación:', notificationDate);
    console.log(
      '⏱️ Diferencia en minutos:',
      (notificationDate.getTime() - Date.now()) / 60000
    );

    // ⛔ Evitar programar si ya pasó o está muy cerca
    if (notificationDate.getTime() - Date.now() < 60 * 1000) {
      console.log('⚠️ Fecha de notificación ya pasó o muy próxima. Ajustando a +1 minuto.');
      notificationDate.setTime(Date.now() + 60 * 1000);
    }

    // 🔔 Programar la notificación
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Recordatorio de Evento',
        body: `${evento.evento_titulo} comienza en ${minutesBefore} minutos`,
        data: {
          type: 'event',
          eventId: evento.id,
          screen: 'calendar',
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: notificationDate.getTime(), // ✅ usar timestamp UTC
      },
    });

    // 💾 Guardamos ID para control futuro
    await saveNotificationId(evento.id, notificationId, 'event');

    console.log('✅ Notificación de evento programada:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('❌ Error programando notificación de evento:', error);
    return null;
  }
}

/**
 * Programar múltiples recordatorios para un evento/tarea
 */
export async function scheduleMultipleReminders(item, type = 'event', reminders = [24 * 60, 60, 30]) {
  const notificationIds = [];
  
  for (const minutes of reminders) {
    const id = type === 'event' 
      ? await scheduleEventNotification(item, minutes)
      : await scheduleTaskNotification(item, minutes);
    
    if (id) notificationIds.push(id);
  }
  
  return notificationIds;
}

/**
 * Cancelar notificación específica
 */
export async function cancelNotification(notificationId) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notificación cancelada:', notificationId);
    return true;
  } catch (error) {
    console.error('Error cancelando notificación:', error);
    return false;
  }
}

/**
 * Cancelar todas las notificaciones de un item
 */
export async function cancelAllNotificationsForItem(itemId, type) {
  try {
    const notifications = await getNotificationIdsForItem(itemId, type);
    
    for (const notifId of notifications) {
      await cancelNotification(notifId);
    }
    
    // Limpiar del storage
    await removeNotificationIds(itemId, type);
    
    console.log(`${notifications.length} notificaciones canceladas para ${type} ${itemId}`);
    return true;
  } catch (error) {
    console.error('Error cancelando notificaciones:', error);
    return false;
  }
}

/**
 * Cancelar todas las notificaciones programadas
 */
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem('@scheduled_notifications');
    console.log('Todas las notificaciones canceladas');
    return true;
  } catch (error) {
    console.error('Error cancelando todas las notificaciones:', error);
    return false;
  }
}


/**
 * Obtener todas las notificaciones programadas
 */
export async function getAllScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Notificaciones programadas:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    return [];
  }
}

// ==========================================
// HELPERS PARA GUARDAR IDs DE NOTIFICACIONES
// ==========================================

/**
 * Guardar ID de notificación en AsyncStorage
 */
async function saveNotificationId(itemId, notificationId, type) {
  try {
    const key = `@notifications_${type}_${itemId}`;
    const existing = await AsyncStorage.getItem(key);
    const ids = existing ? JSON.parse(existing) : [];
    ids.push(notificationId);
    await AsyncStorage.setItem(key, JSON.stringify(ids));
  } catch (error) {
    console.error('Error guardando notification ID:', error);
  }
}

/**
 * Obtener IDs de notificaciones de un item
 */
async function getNotificationIdsForItem(itemId, type) {
  try {
    const key = `@notifications_${type}_${itemId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error obteniendo notification IDs:', error);
    return [];
  }
}

/**
 * Remover IDs de notificaciones de un item
 */
async function removeNotificationIds(itemId, type) {
  try {
    const key = `@notifications_${type}_${itemId}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removiendo notification IDs:', error);
  }
}

/**
 * Programar notificación diaria de resumen
 */
export async function scheduleDailySummary(hour = 8, minute = 0) {
  try {
    const trigger = {
      hour,
      minute,
      repeats: true,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Resumen del Día',
        body: 'Revisa tus tareas y eventos de hoy',
        data: { type: 'daily_summary' },
        sound: true,
      },
      trigger,
    });

    console.log('Notificación diaria programada:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error programando notificación diaria:', error);
    return null;
  }
}