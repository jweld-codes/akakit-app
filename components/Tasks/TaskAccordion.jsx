// components/Tasks/TaskAccordion.jsx
import { Ionicons } from '@expo/vector-icons';
import { deleteDoc, doc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { db } from '../../config/firebaseConfig';
import TaskDetailModal from '../../modals/TaskDetailModal';
import { organizeTasksByStructure } from '../../services/GetTareaByClassId';
import TaskRowItem from '../Tasks/TaskRowItem';
import UpdateTask from './CRUD/UpdateTask';

export default function TaskAccordion({ tasks, classColor , onRemove, onTaskUpdate }) {

  const [expandedParcial, setExpandedParcial] = useState(null);
  const [expandedSemana, setExpandedSemana] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Organizar tareas por parcial y semana
  const organizedTasks = organizeTasksByStructure(tasks);
  
  // Ordenar parciales numéricamente
  const sortedParciales = Object.keys(organizedTasks).sort((a, b) => {
    const numA = parseInt(a) || 0;
    const numB = parseInt(b) || 0;
    return numA - numB;
  });

  // Toggle parcial
  const toggleParcial = (parcial) => {
    if (expandedParcial === parcial) {
      setExpandedParcial(null);
    } else {
      setExpandedParcial(parcial);
      const semanas = Object.keys(organizedTasks[parcial]);
      if (semanas.length > 0) {
        setExpandedSemana({ [parcial]: semanas[0] });
      }
    }
  };

  // Toggle semana
  const toggleSemana = (parcial, semana) => {
    setExpandedSemana(prev => {
      const key = `${parcial}-${semana}`;
      return {
        ...prev,
        [parcial]: prev[parcial] === semana ? null : semana
      };
    });
  };

  // Abrir modal de tarea
  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Editar tarea
  const handleEdit = (task) => {
    setTaskToEdit(task);        
    setShowUpdateModal(true);   
    setShowTaskModal(false); 
};


  // Eliminar tarea
  const handleDelete = async (task) => {
    
    Alert.alert(
      'Eliminar Tarea',
      `¿Estás seguro de eliminar "${task.tarea_titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const taskDocId = task.docId || task.id;
              
              if (!taskDocId) {
                console.error('No se encontró ID del documento');
                Alert.alert('Error', 'No se pudo identificar la tarea');
                return;
              }

              //console.log('Eliminando tarea:', taskDocId);

              // Eliminar de Firebase
              const taskRef = doc(db, 'idTareasCollection', taskDocId);
              await deleteDoc(taskRef);

              //console.log('Tarea eliminada de Firebase');

              if (onRemove) {
                onRemove(taskDocId);
              }

              if (showTaskModal && selectedTask?.id === taskDocId) {
                setShowTaskModal(true);
                setSelectedTask(null);
              }

              if (onTaskUpdate) {
                await onTaskUpdate();
              }

              Alert.alert('✅ Tarea eliminada correctamente');
            } catch (error) {
              console.error('❌ Error al eliminar:', error);
              Alert.alert('Error', `No se pudo eliminar la tarea: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  // Calcular estadísticas por parcial
  const getParcialStats = (parcial) => {
    const semanas = organizedTasks[parcial];
    let totalTasks = 0;
    let completedTasks = 0;
    let totalValorObtenido = 0;
    let totalValorPosible = 0;

    Object.values(semanas).forEach(tareas => {
      totalTasks += tareas.length;
      completedTasks += tareas.filter(t => 
        t.tarea_estado?.toLowerCase() === 'completado'
      ).length;
      tareas.forEach(tarea => {
      const valorFinal = parseFloat(tarea.tarea_valor_final);
      const valorTotal = parseFloat(tarea.tarea_valor);
      
      if (!isNaN(valorFinal) && valorFinal > 0) {
        totalValorObtenido += valorFinal;
      }
      
      if (!isNaN(valorTotal) && valorTotal > 0) {
        totalValorPosible += valorTotal;
      }
      });
    });

    const porcentaje = totalValorPosible > 0 
    ? ((totalValorObtenido / totalValorPosible) * 100).toFixed(2)
    : '0.00';

    return { total: totalTasks, completed: completedTasks, totalObtenido: totalValorObtenido.toFixed(2),
    totalPosible: totalValorPosible.toFixed(2),porcentaje: porcentaje };
  };

  return (
    <View style={styles.container}>
      {sortedParciales.map((parcial) => {

        const isParcialExpanded = expandedParcial === parcial;
        const stats = getParcialStats(parcial);
        const semanas = organizedTasks[parcial];
        const sortedSemanas = Object.keys(semanas).sort((a, b) => {
          const numA = parseInt(a) || 0;
          const numB = parseInt(b) || 0;
          return numA - numB;
        });

        return (
          <View key={parcial} style={styles.parcialContainer}>
            {/* Header del Parcial */}
            <TouchableOpacity
              style={[
                styles.parcialHeader,
                isParcialExpanded && { backgroundColor: classColor || '#3498db' }
              ]}
              onPress={() => toggleParcial(parcial)}
              activeOpacity={0.8}
            >
              <View style={styles.parcialHeaderContent}>
                <View style={styles.parcialTitleRow}>
                  <Ionicons 
                    name="layers-outline" 
                    size={22} 
                    color={isParcialExpanded ? '#fff' : '#2c3e50'} 
                  />
                  <Text style={[
                    styles.parcialTitle,
                    isParcialExpanded && styles.parcialTitleActive
                  ]}>
                    Parcial {parcial}
                  </Text>
                </View>
                
                <View style={styles.parcialStats}>
                  
                  
                </View>

                {/* Separador */}
            <View style={[
              styles.statSeparator,
              isParcialExpanded && { backgroundColor: 'rgba(255,255,255,0.3)' }
            ]} />

            {/* Puntuación obtenida */}
            <View style={styles.statItem}>
              <Text style={[
                styles.statsText,
                isParcialExpanded && { color: '#fff' }
              ]}>
                {stats.totalObtenido}/{stats.totalPosible}
              </Text>
            </View>

            {/* Separador */}
            <View style={[
              styles.statSeparator,
              isParcialExpanded && { backgroundColor: 'rgba(255,255,255,0.3)' }
            ]} />

            {/* Porcentaje */}
            <Text style={[
              styles.statsText,
              isParcialExpanded && { color: '#fff' }
            ]}>
              {stats.completed}/{stats.total}
            </Text>
            <Ionicons 
              name={isParcialExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={isParcialExpanded ? '#fff' : '#999'} 
            />

            </View>
          </TouchableOpacity>

            {/* Contenido del Parcial (Semanas) */}
            <Collapsible collapsed={!isParcialExpanded}>
              <View style={styles.semanasContainer}>
                {sortedSemanas.map((semana) => {
                  const isSemanaExpanded = expandedSemana[parcial] === semana;
                  const tareasEnSemana = semanas[semana];

                  return (
                    <View key={semana} style={styles.semanaContainer}>
                      {/* Header de Semana */}
                      <TouchableOpacity
                        style={styles.semanaHeader}
                        onPress={() => toggleSemana(parcial, semana)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.semanaHeaderContent}>
                          <Ionicons 
                            name="calendar-number-outline" 
                            size={18} 
                            color="#666" 
                          />
                          <Text style={styles.semanaTitle}>
                            Semana {semana}
                          </Text>
                          <View style={styles.semanaBadge}>
                            <Text style={styles.semanaBadgeText}>
                              {tareasEnSemana.length}
                            </Text>
                          </View>
                        </View>
                        <Ionicons 
                          name={isSemanaExpanded ? 'chevron-up' : 'chevron-down'} 
                          size={18} 
                          color="#999" 
                        />
                      </TouchableOpacity>

                      {/* Lista de Tareas */}
                      <Collapsible collapsed={!isSemanaExpanded}>
                        <View style={styles.tareasContainer}>
                          {tareasEnSemana.map((tarea) => (
                            <TaskRowItem
                              key={tarea.id}
                              task={tarea}
                              onPress={handleTaskPress}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                            />
                          ))}
                        </View>
                      </Collapsible>
                    </View>
                  );
                })}
              </View>
            </Collapsible>
          </View>
        );
      })}

      {/* Modal de Detalle de Tarea */}
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

      {/* Modal de actualización de tarea */}
        <UpdateTask
        visible={showUpdateModal}
        task={taskToEdit}
        onClose={() => {
            setShowUpdateModal(false);
            setTaskToEdit(null);
        }}
        onUpdated={async () => {
            setShowUpdateModal(true);
            setTaskToEdit(null);
            if (onTaskUpdate) await onTaskUpdate();
        }}
        />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  parcialContainer: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parcialHeader: {
    backgroundColor: '#f8f8f8',
    padding: 15,
  },
  parcialHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parcialTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parcialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  parcialTitleActive: {
    color: '#fff',
  },
  parcialStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  semanasContainer: {
    backgroundColor: '#fafafa',
    padding: 10,
  },
  semanaContainer: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  semanaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
  },
  semanaHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  semanaTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
    flex: 1,
  },
  semanaBadge: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  semanaBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tareasContainer: {
    padding: 8,
  },
});