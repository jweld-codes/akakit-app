import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from '../../config/firebaseConfig';
import colors from '../../constants/colors';

const TeacherDetailModal = ({ visible, onClose, teacher }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (visible && teacher) {
      fetchTeacherClasses();
    }
  }, [visible, teacher]);

  const fetchTeacherClasses = async () => {
    if (!teacher) return;
    
    setLoading(true);
    try {
      const q = query(collection(db, "idClaseCollection"));
      const snapshot = await getDocs(q);
      
      const teacherClasses = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.class_id_docente === teacher.docente_id) {
          teacherClasses.push({
            id: doc.id,
            ...data
          });
        }
      });

      setClasses(teacherClasses);
    } catch (error) {
      console.error('Error al cargar clases del docente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCallPhone = () => {
    if (teacher?.phone_number) {
      Linking.openURL(`tel:${teacher.phone_number}`);
    }
  };

  const handleSendEmail = () => {
    if (teacher?.email) {
      Linking.openURL(`mailto:${teacher.email}@usap.edu`);
    }
  };

  const handleEditTeacher = () => {
    onClose();
    router.push({
      pathname: "/QADir/Professors/EditProfessorScreen",
      params: { teacherId: teacher.docente_id }
    });
  };

  const handleModalIdValue = (claseData) => {
    const classId = claseData.clase_id;
  };

  const renderClassItem = ({ item }) => (
    <TouchableOpacity
      style={styles.classCard}
      activeOpacity={0.7}
      onPress={() => handleModalIdValue(item.clase_id)}
    >
      <View style={styles.classIconContainer}>
        <Ionicons 
          name="book" 
          size={24} 
          color={colors.color_palette_1.lineArt_Purple} 
        />
      </View>
      
      <View style={styles.classInfo}>
        <Text style={styles.className}>{item.class_name || 'Sin nombre'}</Text>
       
        <View style={styles.classDetails}>
          {item.class_codigo && (
            <View style={styles.classDetailItem}>
              <Ionicons name="code-outline" size={14} color="#666" />
              <Text style={styles.classDetailText}>{item.class_codigo}</Text>
            </View>
          )}

          {item.class_seccion && (
            <View style={styles.classDetailItem}>
              <Ionicons name="people-outline" size={14} color="#666" />
              <Text style={styles.classDetailText}>Sección {item.class_seccion}</Text>
            </View>
          )}
        </View>

        {item.class_days && (
          <View style={styles.scheduleTag}>
            <Ionicons name="time-outline" size={12} color="#666" />
            <Text style={styles.scheduleText}>{item.class_days}</Text>
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderEmptyClasses = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={60} color="#ccc" />
      <Text style={styles.emptyTitle}>Sin clases asignadas</Text>
      <Text style={styles.emptySubtitle}>
        Este docente no tiene clases vinculadas actualmente
      </Text>
    </View>
  );

  if (!teacher) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Información del Docente</Text>

          <TouchableOpacity 
            onPress={handleEditTeacher}
            style={styles.editButton}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Teacher Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Ionicons 
                name="person-circle" 
                size={80} 
                color={colors.color_palette_1.lineArt_Purple} 
              />
            </View>

            <Text style={styles.teacherName}>{teacher.docente_fullName}</Text>
            <Text style={styles.teacherId}>ID: {teacher.docente_id}</Text>

            {teacher.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={20} color="#FFD700" />
                <Text style={styles.ratingText}>{teacher.rating}</Text>
                <Text style={styles.ratingMax}> / 5.0</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleCallPhone}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: '#4CAF50' }]}>
                  <Ionicons name="call" size={20} color="#fff" />
                </View>
                <Text style={styles.actionButtonText}>Llamar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleSendEmail}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: '#2196F3' }]}>
                  <Ionicons name="mail" size={20} color="#fff" />
                </View>
                <Text style={styles.actionButtonText}>Correo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleEditTeacher}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: colors.color_palette_1.lineArt_Purple }]}>
                  <Ionicons name="pencil" size={20} color="#fff" />
                </View>
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Información de Contacto</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="mail-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Correo Institucional</Text>
                  <Text style={styles.infoValue}>{teacher.email}@usap.edu</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="call-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>{teacher.phone_number || 'No disponible'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Classes Section */}
          <View style={styles.classesSection}>
            <View style={styles.classesSectionHeader}>
              <Text style={styles.sectionTitle}>Clases Asignadas</Text>
              <View style={styles.classCountBadge}>
                <Text style={styles.classCountText}>{classes.length}</Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator 
                  size="large" 
                  color={colors.color_palette_1.lineArt_Purple} 
                />
                <Text style={styles.loadingText}>Cargando clases...</Text>
              </View>
            ) : (
              <FlatList
                data={classes}
                renderItem={renderClassItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={renderEmptyClasses}
                scrollEnabled={false}
              />
            )}
          </View>

          {/* Notes Section */}
          {teacher.docente_nota_personal && teacher.docente_nota_personal !== 'N/A' && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Notas Personales</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{teacher.docente_nota_personal}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll Content
  scrollContent: {
    paddingBottom: 40,
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  teacherName: {
    fontSize: 24,
    fontFamily: 'poppins-bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  teacherId: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#999',
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 20,
    fontFamily: 'poppins-bold',
    color: '#333',
    marginLeft: 8,
  },
  ratingMax: {
    fontSize: 16,
    fontFamily: 'poppins-regular',
    color: '#999',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
    justifyContent: 'center',
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'poppins-medium',
    color: '#666',
  },

  // Info Section
  infoSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'poppins-bold',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },

  // Classes Section
  classesSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  classesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  classCountBadge: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  classCountText: {
    fontSize: 14,
    fontFamily: 'poppins-bold',
    color: '#fff',
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  classIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 4,
  },
  classDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  classDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  classDetailText: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#666',
  },
  scheduleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
    marginTop: 4,
  },
  scheduleText: {
    fontSize: 11,
    fontFamily: 'poppins-regular',
    color: '#666',
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#666',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Notes Section
  notesSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: colors.color_palette_1.lineArt_Purple,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#666',
    lineHeight: 20,
  },
});

export default TeacherDetailModal;