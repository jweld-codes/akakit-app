import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from '../config/firebaseConfig';
import colors from '../constants/colors';

const FlowchartClassModal = ({ visible, onClose, classId, onRefresh }) => {
  const [classData, setClassData] = useState(null);
  const [prerequisiteClass, setPrerequisiteClass] = useState(null);
  const [openedClasses, setOpenedClasses] = useState([]);
  const [periodData, setPeriodData] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (visible && classId) {
      fetchClassData();
    }
  }, [visible, classId]);

  const fetchClassData = async () => {
    if (!classId) return;
    
    setLoading(true);
    try {
      // Obtener todas las clases del flujograma
      const q = query(collection(db, "idFlujogramaClases"));
      const snapshot = await getDocs(q);
      
      let currentClass = null;
      const allClasses = [];
      
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        allClasses.push(data);
        
        if (data.fc_id === classId || data.clase_id === classId) {
          currentClass = data;
        }
      });

      if (!currentClass) {
        Alert.alert("Error", "No se encontró la clase");
        onClose();
        return;
      }

      setClassData(currentClass);

      // Obtener prerequisito si existe
      if (currentClass.fc_open_class_id) {
        const prereq = allClasses.find(
          cls => cls.fc_id === currentClass.fc_open_class_id
        );
        setPrerequisiteClass(prereq || null);
      } else {
        setPrerequisiteClass(null);
      }

      // Obtener clases que abre esta clase
      const opened = allClasses.filter(
        cls => cls.fc_open_class_id === currentClass.fc_id
      );
      setOpenedClasses(opened);

      // Obtener datos del periodo
      if (currentClass.fc_periodo) {
        await fetchPeriodData(currentClass.fc_periodo);
      }

    } catch (error) {
      console.error('Error al cargar datos de la clase:', error);
      Alert.alert("Error", "No se pudieron cargar los datos de la clase");
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriodData = async (periodId) => {
    try {
      const q = query(collection(db, "idPeriodoCollection"));
      const snapshot = await getDocs(q);
      
      const period = snapshot.docs.find(
        doc => doc.data().periodo_id === periodId
      );

      if (period) {
        const data = period.data();
        setPeriodData({
          id: data.periodo_id,
          year: data.periodo_curso_anio,
          inicio: data.periodo_fecha_inicio,
          final: data.periodo_fecha_final
        });
      }
    } catch (error) {
      console.error('Error al cargar periodo:', error);
    }
  };

  const handleEditClass = () => {
    onClose();
    router.push({
      pathname: "/QADir/Curso/EditClassCursoScreen",
      params: { classId: classData.fc_id }
    });
  };

  const handleDeleteClass = () => {
    Alert.alert(
      "⚠️ Eliminar Clase",
      `¿Estás seguro que deseas eliminar "${classData.fc_name}" del flujograma?\n\nEsta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "idFlujogramaClases", classData.id));
      
      Alert.alert(
        "✅ Eliminada",
        "La clase fue eliminada del flujograma correctamente",
        [
          {
            text: "OK",
            onPress: () => {
              onClose();
              if (onRefresh) onRefresh();
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error al eliminar clase:", error);
      Alert.alert("Error", "No se pudo eliminar la clase");
    }
  };

  const getClassColor = (classType) => {
    switch (classType?.toLowerCase()) {
      case "general":
      case "general y complementaria":
        return '#ff9800';
      case "datos":
      case "ciencias de datos":
      case "ciencia de datos":
        return '#2196F3';
      case "exactas":
      case "ciencias exactas":
        return '#e91e63';
      case "negocios":
        return '#4caf50';
      case "programación":
        return '#ffc107';
      case "ingles":
        return '#9c27b0';
      default:
        return '#9e9e9e';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || typeof timestamp.seconds !== 'number') {
      return 'No disponible';
    }
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderPrerequisiteCard = () => {
    if (!prerequisiteClass) {
      return (
        <View style={styles.emptyCard}>
          <Ionicons name="checkmark-circle-outline" size={32} color="#4caf50" />
          <Text style={styles.emptyCardText}>
            No requiere prerequisitos
          </Text>
        </View>
      );
    }

    const color = getClassColor(prerequisiteClass.fc_type);
    const isCompleted = prerequisiteClass.fc_enrollment === 'Cursada';

    return (
      <TouchableOpacity
        style={[styles.relatedClassCard, { borderLeftColor: color }]}
        activeOpacity={0.7}
      >
        <View style={styles.relatedClassHeader}>
          <View style={[styles.classTypeBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.classTypeBadgeText, { color }]}>
              {prerequisiteClass.fc_type || 'General'}
            </Text>
          </View>
          {isCompleted && (
            <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
          )}
        </View>

        <Text style={styles.relatedClassCode}>{prerequisiteClass.fc_codigo}</Text>
        <Text style={styles.relatedClassName}>{prerequisiteClass.fc_name}</Text>

        <View style={styles.relatedClassFooter}>
          <Text style={styles.relatedClassCredits}>
            {prerequisiteClass.fc_creditos} UV
          </Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isCompleted ? '#4caf50' : '#ff9800' }
            ]} />
            <Text style={styles.statusText}>
              {prerequisiteClass.fc_enrollment || 'Sin cursar'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOpenedClass = (cls) => {
    const color = getClassColor(cls.fc_type);
    const isCompleted = cls.fc_enrollment === 'Cursada';

    return (
      <TouchableOpacity
        key={cls.fc_id}
        style={[styles.relatedClassCard, { borderLeftColor: color }]}
        activeOpacity={0.7}
      >
        <View style={styles.relatedClassHeader}>
          <View style={[styles.classTypeBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.classTypeBadgeText, { color }]}>
              {cls.fc_type || 'General'}
            </Text>
          </View>
          {isCompleted && (
            <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
          )}
        </View>

        <Text style={styles.relatedClassCode}>{cls.fc_codigo}</Text>
        <Text style={styles.relatedClassName}>{cls.fc_name}</Text>

        <View style={styles.relatedClassFooter}>
          <Text style={styles.relatedClassCredits}>
            {cls.fc_creditos} UV
          </Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isCompleted ? '#4caf50' : '#ff9800' }
            ]} />
            <Text style={styles.statusText}>
              {cls.fc_enrollment || 'Sin cursar'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!classData) return null;

  const classColor = getClassColor(classData.fc_type);
  const isCompleted = classData.fc_enrollment === 'Cursada';
  const grade = parseFloat(classData.fc_promedio || 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: classColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Detalles de Clase</Text>

          <TouchableOpacity onPress={handleEditClass} style={styles.editButton}>
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Main Info Card */}
            <View style={styles.mainCard}>
              <View style={styles.mainCardHeader}>
                <View style={[styles.classTypeBadge, { backgroundColor: classColor + '20' }]}>
                  <Text style={[styles.classTypeBadgeText, { color: classColor }]}>
                    {classData.fc_type || 'General'}
                  </Text>
                </View>
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
                    <Text style={styles.completedText}>Cursada</Text>
                  </View>
                )}
              </View>

              <Text style={styles.classCode}>{classData.fc_codigo}</Text>
              <Text style={styles.className}>{classData.fc_name}</Text>

              {grade > 0 && (
                <View style={styles.gradeCard}>
                  <Ionicons name="star" size={24} color="#ffa726" />
                  <Text style={styles.gradeText}>{grade}%</Text>
                </View>
              )}

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Ionicons name="book-outline" size={20} color={classColor} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Créditos</Text>
                    <Text style={styles.infoValue}>{classData.fc_creditos} UV</Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="flag-outline" size={20} color={classColor} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Estado</Text>
                    <Text style={styles.infoValue}>
                      {classData.fc_enrollment || 'Sin cursar'}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={20} color={classColor} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Periodo</Text>
                    <Text style={styles.infoValue}>
                      {periodData ? `Periodo ${periodData.id}` : 'No especificado'}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="school-outline" size={20} color={classColor} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Año</Text>
                    <Text style={styles.infoValue}>
                      {classData.fc_anio ? `${classData.fc_anio}° Año` : 'No especificado'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Period Info Card */}
            {periodData && (
              <View style={styles.periodCard}>
                <View style={styles.periodCardHeader}>
                  <Ionicons name="time-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
                  <Text style={styles.sectionTitle}>Información del Periodo</Text>
                </View>
                <View style={styles.periodInfo}>
                  <Text style={styles.periodLabel}>Año académico: {periodData.year}</Text>
                  <Text style={styles.periodDate}>
                    📅 {formatDate(periodData.inicio)} - {formatDate(periodData.final)}
                  </Text>
                </View>
              </View>
            )}

            {/* Prerequisite Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="lock-closed" size={20} color="#e91e63" />
                <Text style={styles.sectionTitle}>Prerequisito</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Clase que debes aprobar antes de cursar esta
              </Text>
              {renderPrerequisiteCard()}
            </View>

            {/* Opened Classes Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="key" size={20} color="#4caf50" />
                <Text style={styles.sectionTitle}>Clases que abre</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Clases que podrás cursar al aprobar esta ({openedClasses.length})
              </Text>
              {openedClasses.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="information-circle-outline" size={32} color="#999" />
                  <Text style={styles.emptyCardText}>
                    No abre ninguna clase
                  </Text>
                </View>
              ) : (
                openedClasses.map(renderOpenedClass)
              )}
            </View>

            {/* Danger Zone */}
            <View style={styles.dangerZone}>
              <Text style={styles.dangerZoneTitle}>Zona Peligrosa</Text>
              <Text style={styles.dangerZoneDescription}>
                Eliminar esta clase del flujograma es permanente y no se puede deshacer.
              </Text>
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleDeleteClass}
              >
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={styles.dangerButtonText}>Eliminar del Flujograma</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#666',
  },

  // Scroll Content
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Main Card
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  classTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  classTypeBadgeText: {
    fontSize: 12,
    fontFamily: 'poppins-semibold',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedText: {
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    color: '#4caf50',
  },
  classCode: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#666',
    marginBottom: 8,
  },
  className: {
    fontSize: 24,
    fontFamily: 'poppins-bold',
    color: '#333',
    marginBottom: 15,
    lineHeight: 32,
  },
  gradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff8e1',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  gradeText: {
    fontSize: 20,
    fontFamily: 'poppins-bold',
    color: '#ffa726',
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '47%',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: 'poppins-regular',
    color: '#999',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    color: '#333',
  },

  // Period Card
  periodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.color_palette_1.lineArt_Purple,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  periodCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  periodInfo: {
    gap: 5,
  },
  periodLabel: {
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    color: '#333',
  },
  periodDate: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
  },

  // Section
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'poppins-bold',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginBottom: 15,
    lineHeight: 18,
  },

  // Related Class Card
  relatedClassCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  relatedClassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  relatedClassCode: {
    fontSize: 13,
    fontFamily: 'poppins-semibold',
    color: '#666',
    marginBottom: 4,
  },
  relatedClassName: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 10,
  },
  relatedClassFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  relatedClassCredits: {
    fontSize: 13,
    fontFamily: 'poppins-medium',
    color: '#999',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#666',
  },

  // Empty Card
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  emptyCardText: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },

  // Danger Zone
  dangerZone: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#ff444420',
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontFamily: 'poppins-bold',
    color: '#ff4444',
    marginBottom: 8,
  },
  dangerZoneDescription: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  dangerButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
});

export default FlowchartClassModal;