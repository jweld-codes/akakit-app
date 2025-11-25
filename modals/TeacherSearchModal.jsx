// components/Shared/TeacherSearchModal.jsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import TeacherDetailModal from '../components/Docentes/Docente';
import colors from '../constants/colors';
import global from '../constants/global';
import { getDocumentCollection } from '../services/GetDocumentCollection';
const TeacherSearchModal = ({ 
  visible, 
  onClose, 
  teachers, 
  onSelectTeacher,
  mode = 'select'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [docente, setDocente] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible]);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      const docentesList = await getDocumentCollection("idDocentesCollection");
      setDocente(docentesList);
      setFilteredTeachers(docentesList);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoading(false);
    }
  };

  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailModal(true);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredTeachers(docente);
      return;
    }

    const filtered = docente.filter(teacher => 
      teacher.docente_fullName
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    
    setFilteredTeachers(filtered);
  };

  const handleSelectTeacher = (teacher) => {
    if (mode === 'select' && onSelectTeacher) {
      onSelectTeacher(teacher);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setFilteredTeachers(docente);
    onClose();
  };

  const handleEditTeacher = (teacher) => {
  router.push({
    pathname: "/QADir/Professors/EditProfessorScreen",
    params: { teacherId: teacher.docente_id }
  });
};

  const handleDeleteTeacher = (teacher) => {
    Alert.alert(
      "Eliminar Docente",
      `¿Estás seguro que deseas eliminar a ${teacher.docente_fullName}?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Aquí va tu lógica para eliminar el docente
              // await deleteDocument("idDocentesCollection", teacher.docente_id);
              
              // Recargar la lista después de eliminar
              await fetchData();
              
              Alert.alert("Éxito", "Docente eliminado correctamente");
            } catch (error) {
              console.error('Error al eliminar docente:', error);
              Alert.alert("Error", "No se pudo eliminar el docente");
            }
          }
        }
      ]
    );
  };

  const handleAddTeacher = () => {
    if (mode === 'manage') {
      handleClose();
      router.push("/QADir/Professors/AddProfessorScreen");
    }
  };

  const renderTeacherItem = ({ item }) => (
    <TouchableOpacity
      style={styles.teacherItem}
      onPress={() => handleSelectTeacher(item)}
      activeOpacity={mode === 'select' ? 0.7 : 1}
      disabled={mode === 'manage'}
    >
      
      <View style={styles.teacherIconContainer}>
        <Ionicons name="person-circle" size={40} color={colors.color_palette_1.lineArt_Purple} />
      </View>
      
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{item.docente_fullName}</Text>
        {item.email && (
          <Text style={styles.teacherEmail}>{item.email}@usap.edu</Text>
        )}
        {item.rating && (
          <View style={[global.notSpaceBetweenObjects]}>
            <Ionicons name="star" size={15} color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.teacherSpecialty}>{item.rating}</Text>
          </View>
        )}
      </View>

      {mode === 'select' ? (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      ) : (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditTeacher(item)}
          >
            <Ionicons name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleViewTeacher(item)}
          >
            <Ionicons name="information-circle" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No se encontraron docentes</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? `No hay resultados para "${searchQuery}"`
          : 'No hay docentes registrados'
        }
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {mode === 'select' ? 'Seleccionar Docente' : 'Gestionar Docentes'}
          </Text>

          {mode === 'manage' && (
            <TouchableOpacity 
              onPress={handleAddTeacher}
              style={styles.filterButton}
            >
              <Ionicons name="add-outline" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          
          {mode === 'select' && <View style={{ width: 40 }} />}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Busca por nombre del docente..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus={false}
              autoCapitalize="words"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => handleSearch('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Teachers List */}
        <FlatList
          data={filteredTeachers}
          renderItem={renderTeacherItem}
          keyExtractor={(item, index) => item.docente_id?.toString() || index.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchData}
        />
      </View>

      <TeacherDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        teacher={selectedTeacher}
      />
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
    fontSize: 20,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'poppins-regular',
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },

  // List
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  teacherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  teacherIconContainer: {
    marginRight: 15,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 2,
  },
  teacherEmail: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginBottom: 2,
  },
  teacherSpecialty: {
    fontSize: 12,
    left: 5,
    fontFamily: 'poppins-regular',
    color: '#999',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  editButton: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
  },
  deleteButton: {
    backgroundColor:  colors.color_palette_1.lineArt_Purple,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    color: '#666',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TeacherSearchModal;