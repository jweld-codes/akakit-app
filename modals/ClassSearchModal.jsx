// modals/ClassSearchModal.jsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    FlatList,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import colors from "../constants/colors";

export default function ClassSearchModal({ 
  visible, 
  onClose, 
  classes, 
  onSelectClass,
  title = "Buscar Clase",
  subtitle = "Selecciona una clase del flujograma"
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClasses, setFilteredClasses] = useState([]);

  useEffect(() => {
    if (visible) {
      setSearchQuery("");
      setFilteredClasses(classes);
    }
  }, [visible, classes]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredClasses(classes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = classes.filter(
        (cls) =>
          cls.fc_name?.toLowerCase().includes(query) ||
          cls.fc_codigo?.toLowerCase().includes(query) ||
          cls.fc_type?.toLowerCase().includes(query)
      );
      setFilteredClasses(filtered);
    }
  }, [searchQuery, classes]);

  const getClassColor = (classType) => {
    switch (classType?.toLowerCase()) {
      case "general":
      case "general y complementaria":
        return '#ff9800';
      case "datos":
      case "ciencias de datos":
        return '#2196F3';
      case "exactas":
      case "ciencias exactas":
        return '#e91e63';
      case "negocios":
        return '#4caf50';
      case "programación":
        return '#ffc107';
      default:
        return '#9e9e9e';
    }
  };

  const renderClassItem = ({ item }) => {
    const color = getClassColor(item.fc_type);
    const isCompleted = item.fc_enrollment === 'Cursada';

    return (
      <TouchableOpacity
        style={styles.classCard}
        onPress={() => {
          onSelectClass(item);
          onClose();
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.colorStrip, { backgroundColor: color }]} />
        
        <View style={styles.classContent}>
          <View style={styles.classHeader}>
            <View style={styles.classHeaderLeft}>
              <Text style={styles.classCode}>{item.fc_codigo}</Text>
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                </View>
              )}
            </View>
            <Text style={styles.classCredits}>{item.fc_creditos} UV</Text>
          </View>

          <Text style={styles.className} numberOfLines={2}>
            {item.fc_name}
          </Text>

          <View style={styles.classFooter}>
            <View style={[styles.classTypeBadge, { backgroundColor: color + '20' }]}>
              <Text style={[styles.classTypeText, { color: color }]}>
                {item.fc_type || 'General'}
              </Text>
            </View>

            <View style={styles.classStatus}>
              <View style={[
                styles.statusDot,
                { backgroundColor: isCompleted ? '#4caf50' : '#ff9800' }
              ]} />
              <Text style={styles.statusText}>
                {item.fc_enrollment || 'Sin cursar'}
              </Text>
            </View>
          </View>

          {/* Info adicional */}
          {(item.fc_periodo || item.fc_anio) && (
            <View style={styles.additionalInfo}>
              <Ionicons name="calendar-outline" size={12} color="#999" />
              <Text style={styles.additionalInfoText}>
                {item.fc_periodo && `Período ${item.fc_periodo}`}
                {item.fc_periodo && item.fc_anio && ' • '}
                {item.fc_anio && `Año ${item.fc_anio}`}
              </Text>
            </View>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, código o tipo..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Results count */}
          <View style={styles.resultsCount}>
            <Ionicons name="list" size={16} color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.resultsCountText}>
              {filteredClasses.length} {filteredClasses.length === 1 ? 'clase encontrada' : 'clases encontradas'}
            </Text>
          </View>
        </View>

        {/* Class List */}
        {filteredClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No se encontraron clases</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? "Intenta con otros términos de búsqueda" 
                : "No hay clases registradas en el flujograma"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredClasses}
            renderItem={renderClassItem}
            keyExtractor={(item, index) => item.fc_id?.toString() || index.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
}

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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'poppins-bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'poppins-regular',
    color: '#333',
  },

  // Results count
  resultsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultsCountText: {
    fontSize: 13,
    fontFamily: 'poppins-medium',
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // List
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Class Card
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  colorStrip: {
    width: 5,
    alignSelf: 'stretch',
  },
  classContent: {
    flex: 1,
    padding: 15,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  classHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  classCode: {
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    color: '#666',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classCredits: {
    fontSize: 13,
    fontFamily: 'poppins-medium',
    color: '#999',
  },
  className: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 10,
    lineHeight: 22,
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  classTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  classTypeText: {
    fontSize: 11,
    fontFamily: 'poppins-semibold',
  },
  classStatus: {
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
  additionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  additionalInfoText: {
    fontSize: 11,
    fontFamily: 'poppins-regular',
    color: '#999',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});