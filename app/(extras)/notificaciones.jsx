// components/Settings/NotificationSettings.jsx
import colors from '@/constants/colors';
import NotificationService from '@/services/NotificationService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  
  // Estados de configuración
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [classReminders, setClassReminders] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  // Tiempos de recordatorio
  const [classReminderTime, setClassReminderTime] = useState(60); 
  const [taskReminderTime, setTaskReminderTime] = useState(24); 
  
  // Estadísticas
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    loadSettings();
    checkPermissions();
    loadScheduledNotifications();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('notification_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotificationsEnabled(parsed.notificationsEnabled ?? true);
        setClassReminders(parsed.classReminders ?? true);
        setTaskReminders(parsed.taskReminders ?? true);
        setDailySummary(parsed.dailySummary ?? false);
        setEmailNotifications(parsed.emailNotifications ?? false);
        setPushNotifications(parsed.pushNotifications ?? true);
        setClassReminderTime(parsed.classReminderTime ?? 60);
        setTaskReminderTime(parsed.taskReminderTime ?? 24);
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      const currentSettings = {
        notificationsEnabled,
        classReminders,
        taskReminders,
        dailySummary,
        emailNotifications,
        pushNotifications,
        classReminderTime,
        taskReminderTime,
        ...newSettings,
      };
      await AsyncStorage.setItem('notification_settings', JSON.stringify(currentSettings));
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    }
  };

  const checkPermissions = async () => {
    const granted = await NotificationService.requestPermissions();
    setPermissionsGranted(granted);
    if (!granted) {
      Alert.alert(
        'Permisos necesarios',
        'Para recibir notificaciones, debes habilitar los permisos en la configuración de tu dispositivo.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Configuración', onPress: () => router.push("/(tabs)/ajustes") }
        ]
      );
    }
  };

  const loadScheduledNotifications = async () => {
    const notifications = await NotificationService.getAllScheduledNotifications();
    setScheduledCount(notifications.length);
  };

  const handleToggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    await saveSettings({ notificationsEnabled: value });
    
    if (!value) {
      await NotificationService.cancelAllNotifications();
      setScheduledCount(0);
      Alert.alert(
        'Notificaciones desactivadas',
        'Todas las notificaciones programadas han sido canceladas.'
      );
    }
  };

  const handleToggleClassReminders = async (value) => {
    setClassReminders(value);
    await saveSettings({ classReminders: value });
  };

  const handleToggleTaskReminders = async (value) => {
    setTaskReminders(value);
    await saveSettings({ taskReminders: value });
  };

  const handleToggleDailySummary = async (value) => {
    setDailySummary(value);
    await saveSettings({ dailySummary: value });
    
    if (value) {
      await NotificationService.scheduleDailySummary(7, 0); 
      Alert.alert('Resumen diario activado', 'Recibirás un resumen todos los días a las 7:00 AM');
    }
  };

  const handleTestNotification = async () => {
    if (!permissionsGranted) {
      Alert.alert('Permisos necesarios', 'Primero debes habilitar los permisos de notificaciones');
      return;
    }
    
    await NotificationService.sendTestNotification();
    Alert.alert(
      'Notificación enviada',
      'Si no la ves, verifica los permisos de notificaciones en tu dispositivo'
    );
  };

  const handleClearAllNotifications = () => {
    Alert.alert(
      'Cancelar notificaciones',
      '¿Deseas cancelar todas las notificaciones programadas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            await NotificationService.cancelAllNotifications();
            setScheduledCount(0);
            Alert.alert('Completado', 'Todas las notificaciones han sido canceladas');
          }
        }
      ]
    );
  };

  const handleViewScheduled = async () => {
    const notifications = await NotificationService.getAllScheduledNotifications();
    
    if (notifications.length === 0) {
      Alert.alert('Sin notificaciones', 'No hay notificaciones programadas');
      return;
    }

    const message = notifications.map((n, i) => {
      const trigger = n.trigger;
      const time = trigger.type === 'date' 
        ? new Date(trigger.value * 1000).toLocaleString() 
        : 'Recurrente';
      return `${i + 1}. ${n.content.title} - ${time}`;
    }).join('\n\n');

    Alert.alert('Notificaciones Programadas', message, [{ text: 'OK' }]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.color_palette_1.lineArt_Purple} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
      </View>

      {/* Estado de permisos */}
      {!permissionsGranted && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={24} color="#f59e0b" />
          <View style={styles.warningText}>
            <Text style={styles.warningTitle}>Permisos requeridos</Text>
            <Text style={styles.warningSubtitle}>
              Habilita los permisos para recibir notificaciones
            </Text>
          </View>
          <TouchableOpacity onPress={checkPermissions}>
            <Ionicons name="settings-outline" size={24} color="#f59e0b" />
          </TouchableOpacity>
        </View>
      )}

      {/* Estadísticas */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Ionicons name="notifications" size={32} color={colors.color_palette_1.lineArt_Purple} />
          <Text style={styles.statNumber}>{scheduledCount}</Text>
          <Text style={styles.statLabel}>Notificaciones programadas</Text>
        </View>
      </View>

      {/* Configuración general */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        
        <SettingToggle
          icon="notifications"
          title="Notificaciones"
          subtitle="Habilitar todas las notificaciones"
          value={notificationsEnabled}
          onValueChange={handleToggleNotifications}
        />
      </View>

      {/* Tipos de notificaciones */}
      {notificationsEnabled && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipos de Notificaciones</Text>
            
            <SettingToggle
              icon="school"
              title="Recordatorios de Clases"
              subtitle="1 hora antes de cada clase"
              value={classReminders}
              onValueChange={handleToggleClassReminders}
            />
            
            <SettingToggle
              icon="checkbox"
              title="Recordatorios de Tareas"
              subtitle="1 día antes del vencimiento"
              value={taskReminders}
              onValueChange={handleToggleTaskReminders}
            />
            
            <SettingToggle
              icon="sunny"
              title="Resumen Diario"
              subtitle="Agenda del día cada mañana (7:00 AM)"
              value={dailySummary}
              onValueChange={handleToggleDailySummary}
            />
          </View>

          {/* Canales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Canales</Text>
            
            <SettingToggle
              icon="phone-portrait"
              title="Notificaciones Push"
              subtitle="Alertas en tu dispositivo"
              value={pushNotifications}
              onValueChange={async (value) => {
                setPushNotifications(value);
                await saveSettings({ pushNotifications: value });
              }}
            />
            
            <SettingToggle
              icon="mail"
              title="Notificaciones por Email"
              subtitle="Recibir recordatorios por correo"
              value={emailNotifications}
              onValueChange={async (value) => {
                setEmailNotifications(value);
                await saveSettings({ emailNotifications: value });
              }}
            />
          </View>

          {/* Tiempos de recordatorio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiempo de Anticipación</Text>
            
            <SettingItem
              icon="time"
              title="Clases"
              subtitle={`${classReminderTime} minutos antes`}
              onPress={() => {
                // TODO: Abrir selector de tiempo
              }}
            />
            
            <SettingItem
              icon="calendar"
              title="Tareas"
              subtitle={`${taskReminderTime} horas antes`}
              onPress={() => {
                // TODO: Abrir selector de tiempo
              }}
            />
          </View>
        </>
      )}

      {/* Acciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones</Text>
        
        <ActionButton
          icon="flash"
          title="Enviar Notificación de Prueba"
          subtitle="Verificar que todo funciona"
          onPress={handleTestNotification}
          color={colors.color_palette_1.lineArt_Purple}
        />
        
        <ActionButton
          icon="list"
          title="Ver Notificaciones Programadas"
          subtitle={`${scheduledCount} notificaciones activas`}
          onPress={handleViewScheduled}
          color="#3b82f6"
        />
        
        <ActionButton
          icon="trash"
          title="Cancelar Todas"
          subtitle="Eliminar notificaciones programadas"
          onPress={handleClearAllNotifications}
          color="#ef4444"
        />
      </View>

      {/* Información */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color={colors.color_palette_1.lineArt_Purple} />
        <Text style={styles.infoText}>
          Las notificaciones de clases se programan automáticamente 1 hora antes del inicio. 
          Las notificaciones de tareas se envían 24 horas antes del vencimiento.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const SettingToggle = ({ icon, title, subtitle, value, onValueChange }) => (
  <View style={styles.settingItem}>
    <View style={styles.settingItemLeft}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={colors.color_palette_1.lineArt_Purple} />
      </View>
      <View style={styles.settingItemText}>
        <Text style={styles.settingItemTitle}>{title}</Text>
        {subtitle && (
          <Text style={styles.settingItemSubtitle}>{subtitle}</Text>
        )}
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#d1d1d1', true: colors.color_palette_1.lineArt_Purple + '80' }}
      thumbColor={value ? colors.color_palette_1.lineArt_Purple : '#f4f3f4'}
      ios_backgroundColor="#d1d1d1"
    />
  </View>
);

const SettingItem = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingItemLeft}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={colors.color_palette_1.lineArt_Purple} />
      </View>
      <View style={styles.settingItemText}>
        <Text style={styles.settingItemTitle}>{title}</Text>
        {subtitle && (
          <Text style={styles.settingItemSubtitle}>{subtitle}</Text>
        )}
      </View>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#ccc" />
  </TouchableOpacity>
);

const ActionButton = ({ icon, title, subtitle, onPress, color }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <View style={[styles.actionIconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.actionContent}>
      <Text style={styles.actionTitle}>{title}</Text>
      {subtitle && <Text style={styles.actionSubtitle}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={20} color="#ccc" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },

  // Header
    header: {
      backgroundColor: colors.color_palette_1.lineArt_Purple,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 20,
      paddingHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      bottom: 20,
      elevation: 4,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: 'poppins-bold',
      color: '#fff',
    },

  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  warningText: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: '#92400e',
    marginBottom: 2,
  },
  warningSubtitle: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#92400e',
  },

  // Stats
  statsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontFamily: 'poppins-bold',
    color: colors.color_palette_1.lineArt_Purple,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: '#666',
    marginTop: 4,
  },

  // Section
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'poppins-bold',
    color: '#333',
    marginBottom: 10,
    paddingHorizontal: 5,
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.color_palette_1.lineArt_Purple + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingItemText: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
  },

  // Action Button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.color_palette_1.lineArt_Purple + '10',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#333',
    lineHeight: 20,
  },
});