import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import colors from '../../constants/colors';
import { useOverviewData } from '../../context/OverviewDataContext';
import ClassModal from '../../modals/ClassModal';
import { getClassDocumentCollection } from '../../services/GetClassDocumentCollection';
import { getDocenteById } from "../../services/GetDocenteById";
import { getPeriodById } from "../../services/GetPeriodById";
import SearchBar from "../SearchBar";

export default function HistorialClass({ onClose }) {
  const router = useRouter();
  
  const [docentes, setDocentes] = useState({});
  const [periodo, setPeriodo] = useState({});
  const [classe, setClase] = useState([]);
  const [filteredClass, setFilteredClass] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  
  const [selectedClass, setselectedClass] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [modalInfoVisible, setModalInfoVisible] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todas');

  const {
    promedioPeriodoActual,
    promedioGrado,
    sumCreditos,
    loading,
    refreshData,
    lastUpdate
  } = useOverviewData();

  useEffect(() => {
    fetchClases();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterStatus, classe]);

  const fetchClases = async () => {
    setLoadingClasses(true);
    try {
      const claseList = await getClassDocumentCollection("idClaseCollection");
      
      const docentesTemp = {};
      const periodoTemp = {};

      // Obtener información de docentes
      for (const clase of claseList) {
        const docenteId = clase.class_id_docente?.trim?.();
        if (docenteId && !docentesTemp[docenteId]) {
          const docenteData = await getDocenteById(docenteId);
          if (docenteData) {
            docentesTemp[docenteId] = docenteData.docente_fullName;
          }
        }
      }

      // Obtener información de períodos
      for (const clase of claseList) {
        const periodoId = clase.class_period;
        if (periodoId && !periodoTemp[periodoId]) {
          const periodoData = await getPeriodById(periodoId);
          if (periodoData) {
            periodoTemp[periodoId] = periodoData.periodo_id;
          }
        }
      }

      setClase(claseList);
      setDocentes(docentesTemp);
      setPeriodo(periodoTemp);
      setLoadingClasses(false);
    } catch (error) {
      console.error('Error al cargar clases:', error);
      setLoadingClasses(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...classe];

    // Filtrar por estado
    if (filterStatus !== 'Todas') {
      filtered = filtered.filter(cls => cls.class_enrollment === filterStatus);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(cls => 
        cls.class_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.class_codigo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        docentes[cls.class_id_docente]?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredClass(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const handleSelectedClassModal = (claseId) => {
    setselectedClass(claseId);
    setShowClassModal(true);
  };

  const renderClassItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.classItem}
      onPress={() => handleSelectedClassModal(item.clase_id)}
      activeOpacity={0.7}
    >
      <View style={styles.classIconContainer}>
        <View style={[
          styles.classIconCircle,
          { backgroundColor: item.class_enrollment === 'En Curso' ? '#e3f2fd' : '#f3e5f5' }
        ]}>
          <Ionicons 
            name={item.class_enrollment === 'En Curso' ? "book" : "checkmark-done"} 
            size={24} 
            color={item.class_enrollment === 'En Curso' ? colors.color_palette_1.lineArt_Purple : '#9c27b0'} 
          />
        </View>
      </View>
      
      <View style={styles.classInfo}>
        <Text style={styles.className}>{item.class_name}</Text>
        
        <View style={styles.classDetails}>
          {docentes[item.class_id_docente] && (
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={14} color="#666" />
              <Text style={styles.classDetailText}>{docentes[item.class_id_docente]}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Ionicons name="school-outline" size={14} color="#666" />
            <Text style={styles.classDetailText}>{item.class_credit} U.V</Text>
          </View>
          
          {periodo[item.class_period] && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.classDetailText}>Periodo {periodo[item.class_period]}</Text>
            </View>
          )}
        </View>

        {item.class_promedio && parseFloat(item.class_promedio) > 0 && (
          <View style={styles.gradeContainer}>
            <Ionicons name="star" size={16} color="#ffa726" />
            <Text style={styles.gradeText}>{item.class_promedio}%</Text>
          </View>
        )}

        <View style={[
          styles.statusBadge,
          { backgroundColor: item.class_enrollment === 'En Curso' ? '#e3f2fd' : '#f3e5f5' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.class_enrollment === 'En Curso' ? '#1976d2' : '#9c27b0' }
          ]}>
            {item.class_enrollment}
          </Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (loading && !lastUpdate) {
    return (
      <View style={styles.mainLoadingContainer}>
        <ActivityIndicator size="large" color={colors.color_palette_1.lineArt_Purple} />
        <Text style={styles.mainLoadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => {
                if (onClose) {
                  onClose();
                } else {
                  router.back(); 
                }
              }} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Historial de Clases</Text>
            
            <TouchableOpacity 
              onPress={() => setModalInfoVisible(true)}
              style={styles.infoButton}
            >
              <Ionicons name="information-circle-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="trophy-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.statValue}>{promedioGrado}%</Text>
              <Text style={styles.statLabel}>Graduación</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="trending-up-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.statValue}>{promedioPeriodoActual}%</Text>
              <Text style={styles.statLabel}>Último Periodo</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="school-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.statValue}>{sumCreditos}</Text>
              <Text style={styles.statLabel}>U.V Totales</Text>
            </View>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchFilterContainer}>
          <SearchBar 
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Buscar clases, docentes..."
            style={styles.searchBarStyle}
          />

          {/* Filter Buttons */}
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterStatus === 'Todas' && styles.filterButtonActive
              ]}
              onPress={() => handleFilterChange('Todas')}
            >
              <Ionicons 
                name="apps" 
                size={16} 
                color={filterStatus === 'Todas' ? '#fff' : colors.color_palette_1.lineArt_Purple} 
              />
              <Text style={[
                styles.filterButtonText,
                filterStatus === 'Todas' && styles.filterButtonTextActive
              ]}>
                Todas ({classe.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filterStatus === 'En Curso' && styles.filterButtonActive
              ]}
              onPress={() => handleFilterChange('En Curso')}
            >
              <Ionicons 
                name="play-circle" 
                size={16} 
                color={filterStatus === 'En Curso' ? '#fff' : colors.color_palette_1.lineArt_Purple} 
              />
              <Text style={[
                styles.filterButtonText,
                filterStatus === 'En Curso' && styles.filterButtonTextActive
              ]}>
                En Curso ({classe.filter(c => c.class_enrollment === 'En Curso').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filterStatus === 'Cursada' && styles.filterButtonActive
              ]}
              onPress={() => handleFilterChange('Cursada')}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={16} 
                color={filterStatus === 'Cursada' ? '#fff' : colors.color_palette_1.lineArt_Purple} 
              />
              <Text style={[
                styles.filterButtonText,
                filterStatus === 'Cursada' && styles.filterButtonTextActive
              ]}>
                Cursada ({classe.filter(c => c.class_enrollment === 'Cursada').length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Class List */}
        {loadingClasses ? (
          <View style={styles.loadingClassesContainer}>
            <ActivityIndicator size="large" color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.loadingClassesText}>Cargando Clases...</Text>
          </View>
        ) : filteredClass.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="school-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>
              {searchQuery || filterStatus !== 'Todas' 
                ? 'No se encontraron clases' 
                : 'No hay clases registradas'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery 
                ? `No hay resultados para "${searchQuery}"` 
                : filterStatus !== 'Todas'
                ? `No hay clases con estado "${filterStatus}"`
                : 'Aún no tienes clases registradas'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredClass}
            renderItem={renderClassItem}
            keyExtractor={(item, index) => item.clase_id?.toString() || index.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Modals */}
        <ClassModal
          visible={showClassModal}
          classIdModal={selectedClass}
          onClose={() => {
            setShowClassModal(false);
            setselectedClass(null);
            fetchClases(); // Refrescar después de cerrar
          }}
        />

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalInfoVisible}
          onRequestClose={() => setModalInfoVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Ionicons name="analytics" size={32} color={colors.color_palette_1.lineArt_Purple} />
                <Text style={styles.modalTitle}>Resumen Académico</Text>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.modalStatRow}>
                  <Ionicons name="trophy" size={24} color="#ffa726" />
                  <View style={styles.modalStatInfo}>
                    <Text style={styles.modalStatLabel}>Promedio de Graduación</Text>
                    <Text style={styles.modalStatValue}>{promedioGrado}%</Text>
                  </View>
                </View>

                <View style={styles.modalStatRow}>
                  <Ionicons name="trending-up" size={24} color="#66bb6a" />
                  <View style={styles.modalStatInfo}>
                    <Text style={styles.modalStatLabel}>Promedio Último Periodo</Text>
                    <Text style={styles.modalStatValue}>{promedioPeriodoActual}%</Text>
                  </View>
                </View>

                <View style={styles.modalStatRow}>
                  <Ionicons name="school" size={24} color="#42a5f5" />
                  <View style={styles.modalStatInfo}>
                    <Text style={styles.modalStatLabel}>Créditos Totales</Text>
                    <Text style={styles.modalStatValue}>{sumCreditos} U.V</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setModalInfoVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  mainLoadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'poppins-medium',
    color: '#666',
  },

  // Header
  header: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    fontSize: 20,
    fontFamily: 'poppins-bold',
    color: '#fff',
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'poppins-bold',
    color: '#fff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'poppins-regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 2,
  },

  // Search and Filters
  searchFilterContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBarStyle: {
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.color_palette_1.lineArt_Purple,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    borderColor: colors.color_palette_1.lineArt_Purple,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'poppins-medium',
    color: colors.color_palette_1.lineArt_Purple,
  },
  filterButtonTextActive: {
    color: '#fff',
  },

  // Loading States
  loadingClassesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingClassesText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'poppins-medium',
    color: '#666',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  // List
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  classIconContainer: {
    marginRight: 15,
  },
  classIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 6,
  },
  classDetails: {
    gap: 4,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  classDetailText: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  gradeText: {
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    color: '#ffa726',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'poppins-semibold',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'poppins-bold',
    color: '#333',
    marginTop: 10,
  },
  modalBody: {
    gap: 15,
    marginBottom: 20,
  },
  modalStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    gap: 15,
  },
  modalStatInfo: {
    flex: 1,
  },
  modalStatLabel: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginBottom: 2,
  },
  modalStatValue: {
    fontSize: 20,
    fontFamily: 'poppins-bold',
    color: '#333',
  },
  modalButton: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
});