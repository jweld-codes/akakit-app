// components/Shared/TeacherSearchModal.jsx
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import colors from '../constants/colors';
import global from '../constants/global';

const TeacherSearchModal = ({ visible, onClose, teachers, onSelectTeacher }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState([]);

  useEffect(() => {
    if (visible) {
      setFilteredTeachers(teachers);
    }
  }, [visible, teachers]);

  const handleSearch = (query) => {a
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredTeachers(teachers);
      return;
    }

    const filtered = teachers.filter(teacher => 
      teacher.docente_fullName
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    
    setFilteredTeachers(filtered);
  };

  const handleSelectTeacher = (teacher) => {
    onSelectTeacher(teacher);
    setSearchQuery('');
    setFilteredTeachers(teachers);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setFilteredTeachers(teachers);
    onClose();
  };

  const renderTeacherItem = ({ item }) => (
    <TouchableOpacity
      style={styles.teacherItem}
      onPress={() => handleSelectTeacher(item)}
      activeOpacity={0.7}
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
            <>
            <View style={[global.notSpaceBetweenObjects]}>
                <Ionicons name="star" size={15} color={colors.color_palette_1.lineArt_Purple} />
                <Text style={styles.teacherSpecialty}>{item.rating}</Text>
            </View>
            </>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
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
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buscar Docente</Text>
          <View style={{ width: 40 }} />
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
        />
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
    fontSize: 20,
    fontFamily: 'poppins-semibold',
    color: '#fff',
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
  resultsCount: {
    marginTop: 12,
  },
  resultsCountText: {
    fontSize: 13,
    fontFamily: 'poppins-medium',
    color: '#666',
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
    left:5,
    fontFamily: 'poppins-regular',
    color: '#999',
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
