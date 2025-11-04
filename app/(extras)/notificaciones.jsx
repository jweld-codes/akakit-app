// app/QADir/Settings/NotificationsSettingsScreen.jsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import colors from '../../constants/colors';
import {
    cancelAllNotifications,
    getAllScheduledNotifications,
    scheduleDailySummary,
    sendImmediateNotification,
} from '../../services/NotificationService';

const SETTINGS_KEY = '@notification_settings';

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    tasksEnabled: true,
    eventsEnabled: true,
    dailySummaryEnabled: false,
    taskReminders: {
      oneDayBefore: true,
      oneHourBefore: true,
      thirtyMinBefore: false,
    },
    eventReminders: {
      oneDayBefore: true,
      oneHourBefore: true,
      thirtyMinBefore: true,
    },
  });
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadScheduledNotifications();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const loadScheduledNotifications = async () => {
    setLoading(true);
    const notifications = await getAllScheduledNotifications();
    setScheduledNotifications(notifications);
    setLoading(false);
  };

  const handleToggle = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);

    if (key === 'dailySummaryEnabled' && value) {
      scheduleDailySummary(8, 0);
      Alert.alert('✅', 'Resumen diario activado para las 8:00 AM');
    }
  };

  const handleReminderToggle = (type, key, value) => {
    const newSettings = {
      ...settings,
      [type]: {
        ...settings[type],
        [key]: value,
      },
    };
    saveSettings(newSettings);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Cancelar todas las notificaciones',
      '¿Estás seguro? Esto cancelará todos los recordatorios programados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, cancelar todas',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await cancelAllNotifications();
            await loadScheduledNotifications();
            setLoading(false);
            Alert.alert('✅', 'Todas las notificaciones fueron canceladas');
          },
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    await sendImmediateNotification(
      '🔔 Notificación de Prueba',
      'Si ves esto, las notificaciones están funcionando correctamente',
      { type: 'test' }
    );
    Alert.alert('✅', 'Notificación de prueba enviada');
  };

  const formatTrigger = (trigger) => {
    if (!trigger) return 'Inmediata';
    if (trigger.type === 'date' && trigger.value) {
      return new Date(trigger.value * 1000).toLocaleString('es-HN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (trigger.type === 'timeInterval' && trigger.seconds) {
      const hours = Math.floor(trigger.seconds / 3600);
      const minutes = Math.floor((trigger.seconds % 3600) / 60);
      if (hours > 0) return `En ${hours}h ${minutes}m`;
      return `En ${minutes} min`;
    }
    return 'Programada';
  };

  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationIcon}>
        <Ionicons 
          name={item.content.data?.type === 'task' ? 'checkbox-outline' : 'calendar-outline'} 
          size={20} 
          color={colors.color_palette_1.lineArt_Purple} 
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle} numberOfLines={1}>
          {item.content.title}
        </Text>
        <Text style={styles.notificationBody} numberOfLines={1}>
          {item.content.body}
        </Text>
        <Text style={styles.notificationTime}>
          {formatTrigger(item.trigger)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración de Notificaciones</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Sección: Habilitar/Deshabilitar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipos de Notificaciones</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="checkbox-outline" size={24} color={colors.color_palette_1.lineArt_Purple} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Tareas</Text>
                <Text style={styles.settingDescription}>Recordatorios de entregas</Text>
              </View>
            </View>
            <Switch
              value={settings.tasksEnabled}
              onValueChange={(value) => handleToggle('tasksEnabled', value)}
              trackColor={{ false: '#ccc', true: colors.color_palette_1.lineArt_Purple }}
              ios_backgroundColor="#ccc"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="calendar-outline" size={24} color={colors.color_palette_1.lineArt_Purple} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Eventos</Text>
                <Text style={styles.settingDescription}>Recordatorios de eventos</Text>
              </View>
            </View>
            <Switch
              value={settings.eventsEnabled}
              onValueChange={(value) => handleToggle('eventsEnabled', value)}
              trackColor={{ false: '#ccc', true: colors.color_palette_1.lineArt_Purple }}
              ios_backgroundColor="#ccc"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="sunny-outline" size={24} color={colors.color_palette_1.lineArt_Purple} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Resumen Diario</Text>
                <Text style={styles.settingDescription}>Notificación a las 8:00 AM</Text>
              </View>
            </View>
            <Switch
              value={settings.dailySummaryEnabled}
              onValueChange={(value) => handleToggle('dailySummaryEnabled', value)}
              trackColor={{ false: '#ccc', true: colors.color_palette_1.lineArt_Purple }}
              ios_backgroundColor="#ccc"
            />
          </View>
        </View>

        {/* Sección: Recordatorios de Tareas */}
        {settings.tasksEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recordatorios de Tareas</Text>

            <View style={styles.reminderRow}>
              <Text style={styles.reminderLabel}>1 día antes</Text>
              <Switch
                value={settings.taskReminders.oneDayBefore}
                onValueChange={(value) => handleReminderToggle('taskReminders', 'oneDayBefore', value)}
                trackColor={{ false: '#ccc', true: colors.color_palette_1.lineArt_Purple }}
                ios_backgroundColor="#ccc"
              />
            </View>

            <View style={styles.reminderRow}>
              <Text style={styles.reminderLabel}>1 hora antes</Text>
              <Switch
                value={settings.taskReminders.oneHourBefore}
                onValueChange={(value) => handleReminderToggle('taskReminders', 'oneHourBefore', value)}
                trackColor={{ false: '#ccc', true: colors.color_palette_1.lineArt_Purple }}
                ios_backgroundColor="#ccc"
              />
            </View>

            <View style={styles.reminderRow}>
              <Text style={styles.reminderLabel}>30 minutos antes</Text>
              <Switch
                value={settings.taskReminders.thirtyMinBefore}
                onValueChange={(value) => handleReminderToggle('taskReminders', 'thirtyMinBefore', value)}
                trackColor={{ false: '#ccc', true: colors.color_palette_1.lineArt_Purple }}
                ios_backgroundColor="#ccc"
              />
            </View>
          </View>
        )}

        {/* Sección: Recordatorios de Eventos */}
        {settings.eventsEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recordatorios de Eventos</Text>

            <View style={styles.reminderRow}>
              <Text style={styles.reminderLabel}>1 día antes</Text>
              <Switch
                value={settings.eventReminders.oneDayBefore}
                onValueChange={(value) => handleReminderToggle('eventReminders', 'oneDayBefore', value)}
                trackColor={{ false: '#ccc', true: colors.color_palette_1.lineArt_Purple }}
                ios_backgroundColor="#ccc"
              />
            </View>

            <View style={styles.reminderRow}>
              <Text style={styles.reminderLabel}>1 hora antes</Text>
              <Switch
                value={settings.eventReminders.oneHourBefore}
                onValueChange={(value) => handleReminderToggle('eventReminders', 'oneHourBefore', value)}
                trackColor={{ false: '#ccc', true: colors.color_palette_1.lineArt_Purple }}
                ios_backgroundColor="#ccc"
              />
            </View>

            <View style={styles.reminderRow}>
              <Text style={styles.reminderLabel}>30 minutos antes</Text>
              <Switch
                value={settings.eventReminders.thirtyMinBefore}
                onValueChange={(value) => handleReminderToggle('eventReminders', 'thirtyMinBefore', value)}
                trackColor={{ false: '#ccc', true: colors.color_palette_1.lineArt_Purple }}
                ios_backgroundColor="#ccc"
              />
            </View>
          </View>
        )}

        {/* Sección: Notificaciones Programadas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notificaciones Programadas</Text>
            <TouchableOpacity onPress={loadScheduledNotifications}>
              <Ionicons name="refresh" size={20} color={colors.color_palette_1.lineArt_Purple} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={colors.color_palette_1.lineArt_Purple} style={{ marginVertical: 20 }} />
          ) : scheduledNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No hay notificaciones programadas</Text>
            </View>
          ) : (
            <FlatList
              data={scheduledNotifications}
              renderItem={renderNotificationItem}
              keyExtractor={(item) => item.identifier}
              scrollEnabled={false}
            />
          )}

          <Text style={styles.notificationCount}>
            {scheduledNotifications.length} {scheduledNotifications.length === 1 ? 'notificación' : 'notificaciones'}
          </Text>
        </View>

        {/* Sección: Acciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleTestNotification}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.actionButtonText}>Enviar notificación de prueba</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearAll}
            disabled={scheduledNotifications.length === 0}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
            <Text style={[styles.actionButtonText, styles.dangerText]}>
              Cancelar todas las notificaciones
            </Text>
          </TouchableOpacity>
        </View>

        {/* Espacio final */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  settingDescription: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reminderLabel: {
    fontSize: 15,
    color: '#666',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  notificationBody: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationCount: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 15,
    color: colors.color_palette_1.lineArt_Purple,
    marginLeft: 10,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#fee',
  },
  dangerText: {
    color: '#e74c3c',
  },
});