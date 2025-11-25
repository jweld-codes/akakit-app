// components/Settings/Settings.jsx
import { USER_METADATA } from "@/constants/metadata/user_data";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ClearCacheModal from '../../components/Settings/ClearCacheModal';
import colors from '../../constants/colors';
import TeacherSearchModal from '../../modals/TeacherSearchModal';
//import { deleteAllDocuments } from "../../services/DeleteCollections";
import TeacherDetailModal from "../../components/Docentes/Docente";

export default function Ajustes() {
  const router = useRouter();
  const user = USER_METADATA[0];
  const [copiedAccountNumberText, setCopiedAccountNumberText] = useState('');

  // Estados de configuración
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const [showClearCacheModal, setShowClearCacheModal] = useState(false);
  const [showTeacherSearch, setShowTeacherSearch] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar lógica de cierre de sesión
            console.log('Cerrando sesión...');
            // router.replace('/login');
          }
        }
      ]
    );
  };

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailModal(true);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      'Esta acción es irreversible. ¿Estás seguro de que deseas eliminar tu cuenta permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar eliminación de cuenta
            console.log('Eliminando cuenta...');
          }
        }
      ]
    );
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync('hello world');
  };

  const fetchCopiedText = async () => {
    const text = await Clipboard.getStringAsync();
    setCopiedAccountNumberText(text);
  };

  const sendEmailNotification = async () => {
   try {
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: "Acme <onboarding@resend.dev>",
        to: user.email,
        subject: "Notificación de Akakit",
        text: "Hola, esta es una notificación enviada desde la app."
      },
      {
        headers: {
          Authorization: `re_ep6iQ9qu_8ULX31hgUWP2YnanXSKa4rnf`, // tu API KEY de Resend
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Email enviado:", response.data);
    } catch (error) {
      console.log("Error enviando email:", error.response?.data || error);
    }
  };

  const openWhatsApp = () => {
    const phone = "+50494391050";
    const url = `https://wa.me/${phone}`;

    Linking.openURL(url);
  };

  const collections = [
  "idClaseCollection",
  "idCursoCollection",
  "idDocentesCollection",
  "idEventosCollection",
  "idFlujogramaClases",
  "idPeriodoCollection",
  "idRecursosCollection",
  "idTareasCollection",
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Perfil del Usuario */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image source={require("../../assets/images/avatars/1739031396143.png")} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#fff" />
                  
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.firstName} {user.lastName1}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <Text style={styles.profileCareer}>{user.career}</Text>
            </View>
          </View>
          
          {/* Perfil del Usuario 
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => }
          >
            <Ionicons name="create-outline" size={18} color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.editProfileText}>Editar Perfil</Text>
          </TouchableOpacity>*/}
        </View>

        {/* Cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          
          <SettingItem
            icon="card-outline"
            title="Número de Cuenta"
            subtitle={user.accountNumber}
            onPress={copyToClipboard}
            showArrow={false}
          />
          
          <SettingItem
            icon="school-outline"
            title="Carrera"
            subtitle={user.career}
            onPress={() => {}}
            showArrow={false}
          />
        </View>

        {/* Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          
          <SettingItem
            icon="notifications-outline"
            title="Configuración de Notificaciones"
            subtitle="Gestionar alertas y recordatorios"
            onPress={() => router.push("/(extras)/notificaciones")}
          />
          
          <SettingToggle
            icon="notifications-outline"
            title="Notificaciones Generales"
            subtitle="Habilitar todas las notificaciones"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          
          {notificationsEnabled && (
            <>
              <SettingToggle
                icon="mail-outline"
                title="Notificaciones por Email"
                subtitle="Recibir recordatorios por correo"
                value={emailNotifications}
                onValueChange={(value) => {
                  setEmailNotifications(value);
                  if (value) sendEmailNotification();
                }}
              />
              
              <SettingToggle
                icon="phone-portrait-outline"
                title="Notificaciones Push"
                subtitle="Alertas en tu dispositivo"
                value={pushNotifications}
                onValueChange={setPushNotifications}
              />
            </>
          )}
        </View>

        {/* Apariencia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apariencia</Text>
          
          <SettingToggle
            icon="moon-outline"
            title="Modo Oscuro"
            subtitle="Tema oscuro para la app"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          
          <SettingItem
            icon="color-palette-outline"
            title="Tema"
            subtitle="Personalizar colores"
            onPress={() => {/* TODO: Abrir selector de tema */}}
          />
        </View>

        {/* Seguridad 
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seguridad y Privacidad</Text>
          
          <SettingItem
            icon="key-outline"
            title="Cambiar Contraseña"
            subtitle="Actualizar tu contraseña"
          />
          
          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacidad"
            subtitle="Gestionar permisos"
          />
        </View>*/}

        {/* Componentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestiones Excluyentes</Text>
          
          <SettingItem
            icon="stats-chart-outline"
            title="Configuración de Estadisticás"
            subtitle="Gestionar las estadísticas"
            onPress={() => router.push("/QADir/Stats/StatisticsScreen")}
          />

          <SettingItem
            icon="person-outline"
            title="Configuración de Docentes"
            subtitle="Gestionar datos de los docentes"
            onPress={() => setShowTeacherSearch(true)}
          />

          <SettingItem
            icon="calendar-outline"
            title="Configuración de Periodos"
            subtitle="Gestionar periodos y años cursantes"
            onPress={() => router.push("/QADir/Curso/AddPeriodoScreen")}
          />

        </View>

        {/* Datos y Almacenamiento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos</Text>
          
          <SettingItem
            icon="cloud-download-outline"
            title="Sincronización"
            subtitle="Sincronizar con la nube"
            onPress={() => {/* TODO: Configurar sync */}}
          />

          <SettingToggle
            icon="finger-print-outline"
            title="Autenticación Biométrica"
            subtitle="Usar huella o Face ID"
            value={biometricEnabled}
            onValueChange={setBiometricEnabled}
          />
          
          <SettingItem
            icon="trash-outline"
            title="Limpiar Caché"
            subtitle="Liberar espacio eliminando colecciones"
            onPress={() => setShowClearCacheModal(true)}
          />
          
          <SettingItem
            icon="download-outline"
            title="Exportar Datos"
            subtitle="Descargar toda tu información"
            onPress={() => {/* TODO: Exportar datos */}}
          />
        </View>


        {/* Soporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          <SettingItem
            icon="chatbubble-outline"
            title="Consultas"
            subtitle="Hablar con Consultas USAP por WhatsApp"
            onPress={openWhatsApp}
          />
          
          <SettingItem
            icon="chatbubble-outline"
            title="Mildred"
            subtitle="Hablar con Mildred por WhatsApp"
            onPress={openWhatsApp}
          />

          <SettingItem
            icon="help-circle-outline"
            title="Lista de Contactos"
            subtitle="Todos los contactos necesarios."
          />
        </View>

        {/* Acerca de 
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca de</Text>
          
          <SettingItem
            icon="information-circle-outline"
            title="Versión"
            subtitle="1.0.0 (Build 100)"
            onPress={() => {}}
            showArrow={false}
          />
          
          <SettingItem
            icon="document-text-outline"
            title="Términos y Condiciones"
            subtitle="Leer políticas"
          />
          
          <SettingItem
            icon="shield-outline"
            title="Política de Privacidad"
            subtitle="Cómo protegemos tus datos"
          />
        </View> 

        {/* Acciones Peligrosas */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
            <Text style={styles.dangerButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dangerButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={[styles.dangerButtonText, { color: '#fff' }]}>
              Eliminar Cuenta
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Hecho con ❤️ por el equipo de Akakit
          </Text>
          <Text style={styles.footerText}>© 2025 Todos los derechos reservados</Text>
        </View>
      </ScrollView>

      <ClearCacheModal
        visible={showClearCacheModal}
        onClose={() => setShowClearCacheModal(false)}
      />

      <TeacherSearchModal
        visible={showTeacherSearch}
        onClose={() => setShowTeacherSearch(false)}
        mode="manage"
      />
      <TeacherDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        teacher={selectedTeacher}
      />
    </View>
  );
}

const SettingItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
  <TouchableOpacity 
    style={styles.settingItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
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
    {showArrow && (
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    )}
  </TouchableOpacity>
);

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'poppins-bold',
    color: '#fff',
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },

  // Perfil
  profileSection: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'poppins-bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginBottom: 2,
  },
  profileCareer: {
    fontSize: 13,
    fontFamily: 'poppins-medium',
    color: colors.color_palette_1.lineArt_Purple,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.color_palette_1.lineArt_Purple + '15',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  editProfileText: {
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: colors.color_palette_1.lineArt_Purple,
  },

  // Secciones
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

  // Setting Items
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

  // Botones de Peligro
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e74c3c',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  dangerButtonText: {
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: '#e74c3c',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 50,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});