// components/Tasks/Task.jsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import colors from '../../constants/colors';
import SearchBar from '../SearchBar';
// CORRECCIÓN: Importar desde el archivo correcto
import TaskDetailModal from '../../modals/TaskDetailModal';
import { getClassDocumentCollection } from '../../services/GetClassDocumentCollection';
import { getDocumentCollection } from '../../services/GetDocumentCollection';
import UpdateTask from '../Tasks/CRUD/UpdateTask';

export default function Task() {
  const router = useRouter();

  // Estados principales
  const [tasks, setTasks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('En Proceso');
  const [selectedPriority, setSelectedPriority] = useState('Todas');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    fetchData();
  }, []);

  const handleTaskPress = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setShowTaskModal(true);
    }
  };

  const handleEdit = (task) => {
    setTaskToEdit(task);
    setShowUpdateModal(true);
  };

  const handleDelete = (task) => {
    Alert.alert(
      'Eliminar Tarea',
      '¿Estás seguro de que deseas eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implementar eliminación
            console.log('Eliminar tarea:', task.id);
          }
        }
      ]
    );
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedClass, selectedStatus, selectedPriority, tasks]);

  const calculateProgress = (task) => {
    if (task.tarea_estado === 'Completado') {
      return 100;
    }
    
    if (task.tarea_valor_final && task.tarea_valor) {
      const percentage = (parseFloat(task.tarea_valor_final) / parseFloat(task.tarea_valor)) * 100;
      return Math.min(Math.round(percentage), 100);
    }
    
    const now = new Date();
    const start = task.tarea_fecha_apertura?.toDate?.() || now;
    const end = task.tarea_fecha_entrega?.toDate?.() || now;
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.round((elapsed / total) * 100), 100);
  };

  const calculatePriority = (task) => {
    const dueDate = task.tarea_fecha_entrega?.toDate?.() || new Date();
    const now = new Date();
    const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    const valor = parseFloat(task.tarea_valor || 0);
    
    if (daysLeft <= 3 || valor > 25) {
      return 'Alta';
    }
    
    if (daysLeft > 7 && valor < 15) {
      return 'Baja';
    }
    
    return 'Media';
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const tasksList = await getDocumentCollection("idTareasCollection");
      const classesList = await getClassDocumentCollection("idClaseCollection");
      
      const classesMap = {};
      classesList.forEach(cls => {
        classesMap[cls.clase_id] = {
          id: cls.clase_id,
          name: cls.class_name,
          type: cls.class_type
        };
      });
      
      const enrichedTasks = tasksList.map(task => {
      const classInfo = classesMap[task.tarea_id_clase] || {};
        
        return {
          id: task.id || task.tarea_id?.toString(),
          tarea_id: task.tarea_id, 
          title: task.tarea_titulo || 'Sin título',
          tarea_titulo: task.tarea_titulo, 
          description: task.tarea_descripcion || '',
          tarea_descripcion: task.tarea_descripcion, 
          tarea_estado: task.tarea_estado || 'Pendiente', 

          class_id: task.tarea_id_clase?.toString(),
          class_name: classInfo.name || 'Sin clase',
          class_type: classInfo.type || 'General',
          due_date: task.tarea_fecha_entrega?.toDate?.() || new Date(),
          tarea_fecha_entrega_date: task.tarea_fecha_entrega?.toDate?.() || new Date(), // AGREGAR
          open_date: task.tarea_fecha_apertura?.toDate?.() || new Date(),
          tarea_fecha_apertura_date: task.tarea_fecha_apertura?.toDate?.() || new Date(), // AGREGAR
          status: task.tarea_estado || 'Pendiente',
          parcial: task.tarea_parcial || '',
          tarea_parcial: task.tarea_parcial, 
          periodo: task.tarea_periodo || '',
          tarea_periodo: task.tarea_periodo, 
          semana: task.tarea_semana || '',
          tarea_semana: task.tarea_semana, 
          valor: parseFloat(task.tarea_valor || 0),
          tarea_valor: task.tarea_valor, 
          valor_final: parseFloat(task.tarea_valor_final || 0),
          tarea_valor_final: task.tarea_valor_final, // AGREGAR
          tarea_doc_titulo: task.tarea_doc_titulo || '', // AGREGAR
          tarea_doc_url: task.tarea_doc_url || '', // AGREGAR
          tarea_comentario: task.tarea_comentario || '', // AGREGAR
          progress: calculateProgress(task),
          priority: calculatePriority(task),
          createdAt: task.createdAt?.toDate?.() || new Date(),
        };
      });
      
      setTasks(enrichedTasks);
      setClasses(Object.values(classesMap));
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(query) ||
        task.class_name?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.parcial?.toLowerCase().includes(query)
      );
    }

    if (selectedClass !== 'Todas') {
      filtered = filtered.filter(task => task.class_id?.toString() === selectedClass?.toString());
    }

    if (selectedStatus !== 'Todas') {
      const statusMap = {
        'Completada': 'Completado',
        'En Proceso': 'En Proceso',
        'Pendiente': 'Pendiente'
      };
      const firebaseStatus = statusMap[selectedStatus] || selectedStatus;
      filtered = filtered.filter(task => task.status === firebaseStatus);
    }

    if (selectedPriority !== 'Todas') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    filtered.sort((a, b) => a.due_date - b.due_date);

    setFilteredTasks(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getClassColor = (classType) => {
    switch (classType?.toLowerCase()) {
      case 'programación': return '#ffc107';
      case 'datos':
      case 'ciencias de datos': return '#2196F3';
      case 'exactas':
      case 'ciencias exactas': return '#e91e63';
      case 'negocios': return '#4caf50';
      case 'general':
      case 'general y complementaria': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baja': return '#4caf50';
      default: return '#999';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completado': return '#4caf50';
      case 'en proceso': return '#2196F3';
      case 'pendiente': return '#ff9800';
      default: return '#999';
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderTaskCard = ({ item }) => {
  const classColor = getClassColor(item.class_type);
  const priorityColor = getPriorityColor(item.priority);
  const statusColor = getStatusColor(item.status);
  const daysLeft = getDaysUntilDue(item.due_date);
  const isOverdue = daysLeft < 0;
  const isDueSoon = daysLeft >= 0 && daysLeft <= 3;

  return (
    <TouchableOpacity
      style={styles.taskCard}
      activeOpacity={0.7}
      onPress={() => handleTaskPress(item.id)}
    >
      <View style={[styles.taskHeader, { backgroundColor: classColor + '20' }]}>
        <View style={styles.taskHeaderLeft}>
          <View style={[styles.classIndicator, { backgroundColor: classColor }]} />
          <Text style={[styles.taskClassName, { color: classColor }]} numberOfLines={1}>
            {item.class_name}
          </Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
          <Ionicons 
            name={item.priority === 'Alta' ? 'alert-circle' : item.priority === 'Media' ? 'alert' : 'information-circle'} 
            size={14} 
            color={priorityColor} 
          />
          <Text style={[styles.priorityText, { color: priorityColor }]}>
            {item.priority}
          </Text>
        </View>
      </View>

      <View style={styles.taskContent}>
        <Text style={styles.taskTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        {item.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {item.status !== 'Completado' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progreso</Text>
              <Text style={styles.progressValue}>{item.progress}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${item.progress}%`,
                    backgroundColor: classColor 
                  }
                ]} 
              />
            </View>
          </View>
        )}

        <View style={styles.taskFooter}>
          <View style={styles.taskFooterLeft}>
            <Ionicons 
              name={isOverdue ? 'alert-circle' : 'calendar-outline'} 
              size={16} 
              color={isOverdue ? '#f44336' : isDueSoon ? '#ff9800' : '#666'} 
            />
            <Text 
              style={[
                styles.dueDate,
                isOverdue && styles.overdue,
                isDueSoon && styles.dueSoon
              ]}
            >
              {isOverdue 
                ? `Vencida hace ${Math.abs(daysLeft)} días`
                : daysLeft === 0
                ? 'Vence hoy'
                : daysLeft === 1
                ? 'Vence mañana'
                : `Faltan ${daysLeft} días`}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.taskMetadata}>
          {item.parcial && (
            <View style={styles.metadataItem}>
              <Ionicons name="analytics-outline" size={14} color="#666" />
              <Text style={styles.metadataText}>Parcial {item.parcial}</Text>
            </View>
          )}
          {item.valor > 0 && (
            <View style={styles.metadataItem}>
              <Ionicons name="trophy-outline" size={14} color="#666" />
              <Text style={styles.metadataText}>
                {item.valor_final > 0 
                  ? `${item.valor_final.toFixed(1)}/${item.valor.toFixed(1)} pts`
                  : `${item.valor.toFixed(1)} pts`}
              </Text>
            </View>
          )}
          {item.semana && (
            <View style={styles.metadataItem}>
              <Ionicons name="calendar-number-outline" size={14} color="#666" />
              <Text style={styles.metadataText}>Semana {item.semana}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

  // Agregar esta función antes de renderTaskCard
const renderTaskCardGrid = ({ item }) => {
  const classColor = getClassColor(item.class_type);
  const priorityColor = getPriorityColor(item.priority);
  const statusColor = getStatusColor(item.status);
  const daysLeft = getDaysUntilDue(item.due_date);
  const isOverdue = daysLeft < 0;
  const isDueSoon = daysLeft >= 0 && daysLeft <= 3;

  return (
    <TouchableOpacity
      style={styles.taskCardGrid}
      activeOpacity={0.7}
      onPress={() => handleTaskPress(item.id)} 
    >
      {/* Header compacto */}
      <View style={[styles.taskHeaderGrid, { backgroundColor: classColor }]}>
        <View style={styles.priorityBadgeGrid}>
          <Ionicons 
            name={item.priority === 'Alta' ? 'alert-circle' : item.priority === 'Media' ? 'alert' : 'information-circle'} 
            size={12} 
            color="#fff" 
          />
        </View>
      </View>

      {/* Contenido */}
      <View style={styles.taskContentGrid}>
        <Text style={styles.taskTitleGrid} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.taskClassNameGrid} numberOfLines={1}>
          {item.class_name}
        </Text>

        {/* Progreso compacto */}
        {item.status !== 'Completado' && (
          <View style={styles.progressContainerGrid}>
            <View style={styles.progressBarContainerGrid}>
              <View 
                style={[
                  styles.progressBarGrid, 
                  { 
                    width: `${item.progress}%`,
                    backgroundColor: classColor 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressValueGrid}>{item.progress}%</Text>
          </View>
        )}

        {/* Footer compacto */}
        <View style={styles.taskFooterGrid}>
          <Ionicons 
            name={isOverdue ? 'alert-circle' : 'calendar-outline'} 
            size={14} 
            color={isOverdue ? '#f44336' : isDueSoon ? '#ff9800' : '#666'} 
          />
          <Text 
            style={[
              styles.dueDateGrid,
              isOverdue && styles.overdue,
              isDueSoon && styles.dueSoon
            ]}
            numberOfLines={1}
          >
            {isOverdue 
              ? `${Math.abs(daysLeft)}d atrás`
              : daysLeft === 0
              ? 'Hoy'
              : daysLeft === 1
              ? 'Mañana'
              : `${daysLeft}d`}
          </Text>
        </View>

        {/* Status badge */}
        <View style={[styles.statusBadgeGrid, { backgroundColor: statusColor + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusTextGrid, { color: statusColor }]} numberOfLines={1}>
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.color_palette_1.lineArt_Purple} />
        <Text style={styles.loadingText}>Cargando tareas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Mis Tareas</Text>
          
          <TouchableOpacity
            onPress={() => setShowFiltersModal(true)}
            style={styles.filterButton}
          >
            <Ionicons name="filter" size={24} color="#fff" />
            {(selectedClass !== 'Todas' || selectedStatus !== 'Todas' || selectedPriority !== 'Todas') && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar tareas..."
          style={styles.searchBarContainer}
        />

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="list-outline" size={20} color="#fff" />
            <Text style={styles.statValue}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={20} color="#fff" />
            <Text style={styles.statValue}>
              {tasks.filter(t => t.status === 'En Proceso').length}
            </Text>
            <Text style={styles.statLabel}>En Proceso</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
            <Text style={styles.statValue}>
              {tasks.filter(t => t.status === 'Completado').length}
            </Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
        </View>

        {(searchQuery || selectedClass !== 'Todas' || selectedStatus !== 'Todas' || selectedPriority !== 'Todas') && (
          <View style={styles.activeFilters}>
            <Text style={styles.activeFiltersLabel}>Filtros:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.activeFiltersList}>
                {searchQuery && (
                  <View style={styles.activeFilterChip}>
                    <Ionicons name="search" size={12} color="#fff" />
                    <Text style={styles.activeFilterText}>"{searchQuery}"</Text>
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedClass !== 'Todas' && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterText}>
                      {classes.find(c => c.id?.toString() === selectedClass?.toString())?.name}
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedClass('Todas')}>
                      <Ionicons name="close-circle" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedStatus !== 'Todas' && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterText}>{selectedStatus}</Text>
                    <TouchableOpacity onPress={() => setSelectedStatus('Todas')}>
                      <Ionicons name="close-circle" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedPriority !== 'Todas' && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterText}>Prioridad: {selectedPriority}</Text>
                    <TouchableOpacity onPress={() => setSelectedPriority('Todas')}>
                      <Ionicons name="close-circle" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push("/QADir/Tareas/AddTaskScreen")}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Nueva Tarea</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.viewToggleButton}
          onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
        >
          <Ionicons 
            name={viewMode === 'list' ? 'grid-outline' : 'list-outline'} 
            size={20} 
            color={colors.color_palette_1.lineArt_Purple} 
          />
        </TouchableOpacity>
      </View>

      {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No hay tareas</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || selectedClass !== 'Todas' || selectedStatus !== 'Todas'
                ? 'No se encontraron tareas con esos filtros'
                : 'Agrega tu primera tarea para comenzar'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            renderItem={viewMode === 'list' ? renderTaskCard : renderTaskCardGrid}
            keyExtractor={item => item.id}
            key={viewMode} // Fuerza re-render al cambiar vista
            numColumns={viewMode === 'grid' ? 2 : 1}
            columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : null}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.color_palette_1.lineArt_Purple}
              />
            }
          />
        )}

      <Modal
        visible={showFiltersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Por Clase</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      selectedClass === 'Todas' && styles.filterOptionActive
                    ]}
                    onPress={() => setSelectedClass('Todas')}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedClass === 'Todas' && styles.filterOptionTextActive
                    ]}>
                      Todas
                    </Text>
                  </TouchableOpacity>
                  {classes.map(cls => (
                    <TouchableOpacity
                      key={cls.id}
                      style={[
                        styles.filterOption,
                        selectedClass?.toString() === cls.id?.toString() && styles.filterOptionActive
                      ]}
                      onPress={() => setSelectedClass(cls.id?.toString())}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        selectedClass?.toString() === cls.id?.toString() && styles.filterOptionTextActive
                      ]}>
                        {cls.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Por Estado</Text>
                <View style={styles.filterOptions}>
                  {['Todas', 'Pendiente', 'En Proceso', 'Completado'].map(status => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterOption,
                        selectedStatus === status && styles.filterOptionActive
                      ]}
                      onPress={() => setSelectedStatus(status)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        selectedStatus === status && styles.filterOptionTextActive
                      ]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Por Prioridad</Text>
                <View style={styles.filterOptions}>
                  {['Todas', 'Alta', 'Media', 'Baja'].map(priority => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.filterOption,
                        selectedPriority === priority && styles.filterOptionActive
                      ]}
                      onPress={() => setSelectedPriority(priority)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        selectedPriority === priority && styles.filterOptionTextActive
                      ]}>
                        {priority}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSelectedClass('Todas');
                  setSelectedStatus('Todas');
                  setSelectedPriority('Todas');
                  setSearchQuery('');
                }}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <TaskDetailModal
      visible={showTaskModal}
      task={selectedTask}
      onClose={() => {
        setShowTaskModal(false);
        setSelectedTask(null);
      }}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />

    <UpdateTask
      visible={showUpdateModal}
      task={taskToEdit}
      onClose={() => {
        setShowUpdateModal(false);
        setTaskToEdit(null);
      }}
      onUpdated={async () => {
        setShowUpdateModal(false);
        setTaskToEdit(null);
        await fetchData();
      }}
    />
    </View>
  );
}

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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'poppins-medium',
    color: '#666',
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
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'poppins-bold',
    color: '#fff',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff9800',
  },
  searchBarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
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

  // Active Filters
  activeFilters: {
    marginTop: 10,
  },
  activeFiltersLabel: {
    fontSize: 12,
    fontFamily: 'poppins-medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  activeFiltersList: {
    flexDirection: 'row',
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeFilterText: {
    fontSize: 12,
    fontFamily: 'poppins-medium',
    color: '#fff',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: colors.color_palette_1.lineArt_Purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
  viewToggleButton: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Task Card
  listContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  taskHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  classIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  taskClassName: {
    fontSize: 13,
    fontFamily: 'poppins-semibold',
    flex: 1,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontFamily: 'poppins-semibold',
  },
  taskContent: {
    padding: 16,
  },
  taskTitle: {
    fontSize: 17,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontFamily: 'poppins-medium',
    color: '#666',
  },
  progressValue: {
    fontSize: 14,
    fontFamily: 'poppins-bold',
    color: '#333',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  taskFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dueDate: {
    fontSize: 13,
    fontFamily: 'poppins-medium',
    color: '#666',
  },
  overdue: {
    color: '#f44336',
  },
  dueSoon: {
    color: '#ff9800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'poppins-semibold',
  },
  taskMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#666',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'poppins-bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 25,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  filterOptionActive: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    borderColor: colors.color_palette_1.lineArt_Purple,
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: '#666',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  clearFiltersText: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
  // Agregar estos estilos al StyleSheet
gridRow: {
  justifyContent: 'space-between',
  paddingHorizontal: 20,
},
taskCardGrid: {
  backgroundColor: '#fff',
  borderRadius: 16,
  marginBottom: 16,
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
  width: '48%',
},
taskHeaderGrid: {
  height: 60,
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
  padding: 8,
},
priorityBadgeGrid: {
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  justifyContent: 'center',
  alignItems: 'center',
},
taskContentGrid: {
  padding: 12,
},
taskTitleGrid: {
  fontSize: 15,
  fontFamily: 'poppins-semibold',
  color: '#333',
  marginBottom: 6,
  lineHeight: 20,
  minHeight: 40,
},
taskClassNameGrid: {
  fontSize: 11,
  fontFamily: 'poppins-medium',
  color: '#999',
  marginBottom: 10,
},
progressContainerGrid: {
  marginBottom: 10,
},
progressBarContainerGrid: {
  height: 6,
  backgroundColor: '#f0f0f0',
  borderRadius: 3,
  overflow: 'hidden',
  marginBottom: 4,
},
progressBarGrid: {
  height: '100%',
  borderRadius: 3,
},
progressValueGrid: {
  fontSize: 10,
  fontFamily: 'poppins-bold',
  color: '#666',
  textAlign: 'right',
},
taskFooterGrid: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  marginBottom: 8,
},
dueDateGrid: {
  fontSize: 11,
  fontFamily: 'poppins-medium',
  color: '#666',
  flex: 1,
},
statusBadgeGrid: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 10,
  alignSelf: 'flex-start',
},
statusTextGrid: {
  fontSize: 10,
  fontFamily: 'poppins-semibold',
},
});