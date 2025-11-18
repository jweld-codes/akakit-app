// components/Clases/ClassModal.jsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import UpdateClass from '../components/Clases/CRUD/UpdateClass';

import TaskAccordion from '../components/Tasks/TaskAccordion';
import colors from '../constants/colors';

import global from '../constants/global';
import { useOverviewData } from '../context/OverviewDataContext';
import { getClassById } from '../services/GetClassById';
import { getDocenteById } from '../services/GetDocenteById';
import { getPeriodById } from '../services/GetPeriodById';
import { getTaskByClassId } from '../services/GetTareaByClassId';
import { updateClassGrade } from '../services/UpdateClassGrade';

const { width } = Dimensions.get("window");

const ClassModal = ({ visible, classIdModal, onClose, onAddTask  }) => {
  const router = useRouter();
  
  const [claseData, setClaseData] = useState(null);
  const [docenteData, setDocenteData] = useState(null);
  const [periodData, setPeriodData] = useState(null);
  const [taskData, setTaskData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState('informacion');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [classToEdit, setClassToEdit] = useState(null);
  const [docenteToEdit, setDocenteToEdit] = useState(null);
  const [periodToEdit, setPeriodToEdit] = useState(null);
  //const [showAddTask, setShowAddTask] = useState(false);

  const {tasksValueMetadata, refreshData: refreshOverviewData } = useOverviewData();
  const promedioClase = tasksValueMetadata.promedios_por_clase[classIdModal] ?? 0;
  //const sumaTareasParcial = tasksValueMetadata.suma_tarea_parcial ?? 0;
  
    
    
    const fetchClassData = useCallback(async (showLoadingIndicator = true) => {
    if (!visible || !classIdModal) return;

    if (showLoadingIndicator) {
      setLoading(true);
    }
    
    try {
      const classInfo = await getClassById(classIdModal);
      setClaseData(classInfo);

      // Obtener datos del docente
      if (classInfo?.class_id_docente) {
        const teacherInfo = await getDocenteById(classInfo.class_id_docente);
        setDocenteData(teacherInfo);
      }

      // Obtener datos del periodo
      if (classInfo?.class_period) {
        const periodInfo = await getPeriodById(classInfo.class_period);
        setPeriodData(periodInfo);
      }

      if (classInfo?.clase_id) {
        const taskInfo = await getTaskByClassId(classInfo?.clase_id);
        setTaskData(taskInfo || []);
      }

    } catch (error) {
      console.error('Error cargando datos del modal:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [visible, classIdModal]);


  useEffect(() => {
     //console.log('ClassModal recibió classIdModal:', classIdModal);
    //console.log('Tipo de classIdModal:', typeof classIdModal);
    fetchClassData();
  }, [visible, classIdModal]);
  
  useEffect(() => {
    if (visible) {
      setActiveTab('informacion');
    }
  }, [visible]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClassData(false);
    await refreshOverviewData();
  }, [fetchClassData, refreshOverviewData]);

  const handleTaskUpdate = useCallback(async () => {
    await fetchClassData(false);
    await refreshOverviewData();
  }, [fetchClassData, refreshOverviewData]);

   const handleTabChange = useCallback(async (tabId) => {
    setActiveTab(tabId);
    
    if (tabId === 'tareas') {
      await fetchClassData(false);
    }
  }, [fetchClassData]);

  const tabs = [
    { id: 'informacion', label: 'Información', icon: 'information-circle-outline' },
    { id: 'general', label: 'General', icon: 'grid-outline' },
    { id: 'tareas', label: 'Tareas', icon: 'checkbox-outline' },
    { id: 'recursos', label: 'Recursos', icon: 'folder-outline' },
  ];

  // Función para obtener colores según el tipo de clase
  const getColorsByClassType = (type) => {
    switch (type?.toLowerCase()) {
      case "general":
      case "general y complementaria":
        return {
          header: colors.color_palette_4.general_orange,
          background: "#f7ebdbff",
          textColor: colors.color_palette_1.yellow_darker
        };
      case "datos":
      case "ciencias de datos":
        return {
          header: colors.color_palette_4.datos_blue,
          background: "#e6f8ffff",
          textColor: colors.color_palette_2.lineArt_Blue
        };
      case "exactas":
      case "matemáticas":
        return {
          header: colors.color_palette_4.exactas_pink,
          background: "#fbeee7ff",
          textColor: colors.color_palette_2.lineArt_Blue
        };
      case "negocios":
        return {
          header: colors.color_palette_4.negocio_green,
          background: "#e6fadeff",
          textColor: colors.color_palette_1.orange_darker
        };
      case "programación":
        return {
          header: colors.color_palette_4.code_yellow,
          background: "#fffbe6ff",
          textColor: colors.color_palette_1.orange_darker
        };
      default:
        return {
          header: "#a95656ff",
          background: "#f5f5f5",
          textColor: "#000"
        };
    }
  };

  const getImageByClassType = (type) => {
  switch (type?.toLowerCase()) {
    case "general":
    case "general y complementaria":
      return require("../assets/images/classes_bg/card_background/Generales.png");
    case "datos":
    case "ciencias de datos":
      return require("../assets/images/classes_bg/card_background/Datos.png");
    case "exactas":
    case "ciencias exactas":
      return require("../assets/images/classes_bg/card_background/Exactas.png");
    case "negocios":
      return require("../assets/images/classes_bg/card_background/Negocios.png");
    case "programación":
      return require("../assets/images/classes_bg/card_background/Programacion.png");
    default:
      return require("../assets/images/classes_bg/card_background/Default.png");
  }
  };

  const changeColorByEnrollments = (type) => {
    switch (type?.toLowerCase()) {
      case "en curso":
      case "en curso":
        return {
          color: '#0c8406ff'
        };
      case "cursada":
      case "cursada":
        return {
          color: '#cb0b0bff'
        };
      default:
        return {
          color: '#rgba(20, 10, 160, 1)'
        };
    }

  };

  const handleEdit = () => {
    setDocenteToEdit(docenteData);
    setClassToEdit(claseData);
    setShowUpdateModal(true);
  };

  const { header, background, textColor } = claseData 
    ? getColorsByClassType(claseData.class_type)
    : { header: '#666', background: '#f5f5f5',textColor: '#000' };

    const { color } = claseData 
    ? changeColorByEnrollments(claseData.class_enrollment)
    : { color: '#rgba(4, 90, 8, 1)' };

    const backgroundImage = claseData 
  ? getImageByClassType(claseData.class_type)
  : require("../assets/images/classes_bg/card_background/Default.png");

   const renderTabContent = () => {
    if (!claseData) return null;

    switch (activeTab) {
      case 'informacion':
        return <InformacionTab claseData={claseData} color={color} docenteData={docenteData} promedioClase={promedioClase} />;
      
      case 'general':
        return <GeneralTab claseData={claseData} periodData={periodData} taskData={taskData}  promedioClase={promedioClase} />;
      
      case 'tareas':
      return (
        <View style={{ flex: 1 }}>
      <TareasTab 
        claseData={claseData} 
        color={color} 
        taskData={taskData} 
        onTaskUpdate={handleTaskUpdate} 
      />

      <TouchableOpacity
        onPress={() => {
          onClose(); // cierra el modal
          router.push("/QADir/Tareas/AddTaskScreen"); // navega a AddTask
        }}  
        style={{
          backgroundColor: header,
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 10,
          alignSelf: 'center',
          marginVertical: 20,
        }}
      >
        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 16 }}>
          Agregar nueva tarea
        </Text>
      </TouchableOpacity>
    </View>
      );
      
      case 'recursos':
        return <RecursosTab claseData={claseData} />;
      
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      
      <View style={styles.modalOverlay}>
        {showUpdateModal && (
          <UpdateClass
            visible={showUpdateModal}
            classData={claseData}
            docenteData={docenteData}
            onClose={() => setShowUpdateModal(false)}
            onUpdated={() => {
              setShowUpdateModal(false);
              fetchClassData();
            }}
          />
        )}

        <View style={[styles.modalContent, { backgroundColor: '#fff' }]}>
          {/* Header del Modal */}
          <View style={[styles.modalHeader, { backgroundColor: header}]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color= {textColor} />
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { top: 70, fontSize: 30, color:textColor }]}>
              {loading ? 'Cargando...' : claseData?.class_name || 'Sin Valor'}
            </Text>
            <Image 
              source={backgroundImage} 
              style={styles.headerBackgroundImage}
              resizeMode="cover"
            />
          </View>

          {/* Tabs Menu */}
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScrollView}
            >
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tabButton,
                    activeTab === tab.id && styles.tabButtonActive,
                    activeTab === tab.id && { backgroundColor: header}
                  ]}
                  onPress={() => handleTabChange(tab.id)}
                >
                  <Ionicons 
                    name={tab.icon} 
                    size={18} 
                    color={activeTab === tab.id ? textColor : '#626262ff'} 
                  />
                  <Text 
                    style={[
                      styles.tabLabel,
                      activeTab === tab.id && styles.tabLabelActive && {color: textColor},
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Contenido del Tab Activo */}
          <ScrollView 
            style={styles.modalBody}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={header}
                colors={[header]}
              />
            }
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={header} />
                <Text style={styles.loadingText}>Cargando información...</Text>
              </View>
            ) : claseData ? (
              renderTabContent()
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  No se pudo cargar la información de la clase
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer con botones de acción */}
          {!loading && claseData && (
           <View style={styles.modalFooter}>
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: header}]}
                onPress={handleEdit}
              >
              <Text style={[styles.actionButtonText, {color: textColor}]}>Editar</Text>
              </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#800606ff' }]}
                  onPress={onClose}
                >
                <Text style={styles.actionButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ==================================================
//          COMPONENTES DE CADA TAB
// ==================================================

// Tab: Información
const InformacionTab = ({ claseData, color, docenteData, promedioClase  }) => (
  <View>
    <Text style={styles.sectionTitle}>Información General</Text>
    <View style={styles.gridContainer}>
      
      <View style={styles.gridItem}>
        <View style={[global.centerObjects, { paddingTop: 20 }]}>
          <Text style={styles.value}>{claseData.class_codigo}</Text>
          <View style={global.notSpaceBetweenObjects}>
            <Ionicons name="barcode-outline" size={18} color="#626262ff" />
            <Text style={styles.label}> Código</Text>
          </View>
        </View>
      </View>

      <View style={styles.gridItem}>
        <View style={[global.centerObjects, { paddingTop: 20 }]}>
          <Text style={styles.value}>{claseData.class_section}</Text>
          <View style={global.notSpaceBetweenObjects}>
            <Ionicons name="planet-outline" size={18} color="#626262ff" />
            <Text style={styles.label}> Sección</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.gridItem}>
        <View style={[global.centerObjects, { paddingTop: 20 }]}>
          <Text style={[styles.value, { color: color }]}>{claseData.class_enrollment}</Text>
          <View style={global.notSpaceBetweenObjects}>
            <Ionicons name="cafe-outline" size={18} color="#626262ff" />
            <Text style={styles.label}> Matrícula</Text>
          </View>
        </View>
      </View>

      <View style={styles.gridItem}>
        <View style={[global.centerObjects, { paddingTop: 20 }]}>
          <Text style={styles.value}>{claseData.class_credit} U.V</Text>
          <View style={global.notSpaceBetweenObjects}>
            <Ionicons name="git-commit-outline" size={18} color="#626262ff" />
            <Text style={styles.label}> Créditos</Text>
          </View>
        </View>
      </View>

      <View style={styles.gridItem}>
        <View style={[global.centerObjects, { paddingTop: 20 }]}>
          <Text style={styles.value}>{claseData.class_modality}</Text>
          <View style={global.notSpaceBetweenObjects}>
            <Ionicons name="git-branch-outline" size={18} color="#626262ff" />
            <Text style={styles.label}> Modalidad</Text>
          </View>
        </View>
      </View>

      <View style={styles.gridItem}>
        <View style={[global.centerObjects, { paddingTop: 20 }]}>
          <Text style={styles.value} numberOfLines={3}>{claseData.class_type}</Text>
          <View style={global.notSpaceBetweenObjects}>
            <Ionicons name="library-outline" size={18} color="#626262ff" />
            <Text style={styles.label}> Categoría</Text>
          </View>
        </View>
      </View>

    </View>
    
    <View style={{marginTop: 20}}>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Horario</Text>
        <InfoRow label="Días" value={claseData.class_days} />
        <InfoRow label="Hora" value={claseData.class_hours} />
        <InfoRow label="Modalidad" value={claseData.class_modality} />
      </View>

      {docenteData && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Docente</Text>
          <InfoRow 
            label="Nombre" 
            value={docenteData.docente_fullName || 'No asignado'} 
          />
        </View>
      )}

      {claseData.class_url_access && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Acceso</Text>
          <TouchableOpacity onPress={() => Linking.openURL(claseData.class_url_access)}>
            <Text style={styles.linkText}>
              {claseData.class_url_access}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {claseData.class_notas_personales && 
      claseData.class_notas_personales !== 'N/A' && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Notas Personales</Text>
          <Text style={styles.notesText}>
            {claseData.class_notas_personales}
          </Text>
        </View>
      )}
    </View>
  </View>
);

// Tab: General
const GeneralTab = ({ claseData, periodData, taskData, promedioClase }) => {

  const fechaInicio = periodData?.periodo_fecha_inicio
    ? new Date(periodData.periodo_fecha_inicio.seconds * 1000).toLocaleDateString()
    : "No disponible";

  const fechaFin = periodData?.periodo_fecha_final
    ? new Date(periodData.periodo_fecha_final.seconds * 1000).toLocaleDateString()
    : "No disponible";

    const idPeridodoCurso = periodData?.periodo_curso_anio;
    const periodosCursoMap = {
      "1": "Primer Año",
      "2": "Segundo Año",
      "3": "Tercer Año",
      "4": "Cuarto Año",
    };
    const periodo_anio = periodosCursoMap[idPeridodoCurso] ?? "No disponible";

    const periodoClass = periodData?.periodo_id;
    const periodoClassMap = {
      "1": "Primer Periodo",
      "2": "Segundo Periodo",
      "3": "Tercer Periodo",
      "4": "Cuarto Periodo",
      "5": "Quinto Periodo",
      "6": "Sexto Periodo",
      "7": "Séptimo Periodo",
      "8": "Octavo Periodo",
      "9": "Noveno Periodo",
      "10": "Décimo Periodo",
      "11": "Undécimo Periodo",
      "12": "Duodécimo Periodo",
    };
    const periodo_clase = periodoClassMap[periodoClass] ?? "No disponible";
    
    const idClase = claseData?.clase_id ?? "0";

  const calcularNotasPorParcial = async () => {
    if (!taskData || taskData.length === 0) {
      return {
        bloque_1: '0.00',
        bloque_2: '0.00',
        nota_final: '0.00',
        parcial_1: '0.00',
        parcial_2: '0.00',
        parcial_3: '0.00',
        parcial_4: '0.00'
      };
    }

    const notasPorParcial = {
      1: 0,
      2: 0,
      3: 0,
      4: 0
    };

    taskData.forEach(task => {
      const parcial = parseInt(task.tarea_parcial);
      const valorFinal = parseFloat(task.tarea_valor_final);

      if (parcial >= 1 && parcial <= 4 && !isNaN(valorFinal)) {
        notasPorParcial[parcial] += valorFinal;
      }
    });

    

    const bloque_1 = (notasPorParcial[1] + notasPorParcial[2]).toFixed(2);
    const bloque_2 = (notasPorParcial[3] + notasPorParcial[4]).toFixed(2);
    const nota_final = (parseFloat(bloque_1) + parseFloat(bloque_2)).toFixed(2);

    if (idClase) {
      //console.log('Intentando guardar promedio:', nota_final, 'para documento:', claseData.clase_id);
      const resultado = await updateClassGrade(idClase, nota_final);
      if (!resultado) {
        console.warn('No se pudo guardar el promedio en Firebase');
      }
    } else {
      console.warn('No hay document ID disponible para guardar el promedio');
    }
    return {
      bloque_1,
      bloque_2,
      nota_final,
      parcial_1: notasPorParcial[1].toFixed(2),
      parcial_2: notasPorParcial[2].toFixed(2),
      parcial_3: notasPorParcial[3].toFixed(2),
      parcial_4: notasPorParcial[4].toFixed(2)
    };
  };

  const [notas, setNotas] =useState({
    bloque_1: '0.00',
    bloque_2: '0.00',
    nota_final: '0.00',
    parcial_1: '0.00',
    parcial_2: '0.00',
    parcial_3: '0.00',
    parcial_4: '0.00'
  });

  useEffect(() => {
    const calcularYGuardar = async () => {
      const notasCalculadas = await calcularNotasPorParcial();
      setNotas(notasCalculadas);
    };
    
    calcularYGuardar();
  }, [taskData, claseData]);

  return(
    <View>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Curso</Text>
        <InfoRow label="Año" value={periodo_anio || 'N/A'} />
        <InfoRow label="Periodo" value={periodo_clase} />
        <InfoRow label="Fecha de Inicio" value={fechaInicio} />
        <InfoRow label="Fecha Final" value={fechaFin} />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Notas por Parcial</Text>
        <InfoRow 
          label="Parcial I (Acumulativo) " 
          value={`${notas.parcial_1}/20`} 
        />
        <InfoRow 
          label="Parcial II (Examen)" 
          value={`${notas.parcial_2}/30`} 
        />
        <InfoRow 
          label="Parcial III (Acumulativo)" 
          value={`${notas.parcial_3}/20`} 
        />
        <InfoRow 
          label="Parcial IV (Examen)" 
          value={`${notas.parcial_4}/30`} 
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Resumen de Notas</Text>
        <InfoRow 
          label="Bloque 1 (Parcial I + II)" 
          value={`${notas.bloque_1}/50`} 
        />
        <InfoRow 
          label="Bloque 2 (Parcial III + IV)" 
          value={`${notas.bloque_2}/50`} 
        />
        <View style={[styles.infoRow, { borderBottomWidth: 0, paddingTop: 15, borderTopWidth: 2, borderTopColor: '#e0e0e0' }]}>
          <Text style={[styles.infoLabel, { fontFamily: 'poppins-semibold', fontSize: 16 }]}>
            Nota Final:
          </Text>
          <Text style={[styles.infoValue, { fontFamily: 'poppins-bold', fontSize: 18, color: '#470427ff' }]}>
            {notas.nota_final}/100
          </Text>
        </View>
      </View>
    </View>
  );
};

// Tab: Tareas
const TareasTab = ({ claseData, color, taskData, onTaskUpdate }) => {
  if (!taskData || taskData.length === 0) {
    return (
      <View>
        <Text style={styles.sectionTitle}>Tareas de la Clase</Text>
        <View style={styles.emptyState}>
          <Ionicons name="checkbox-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No hay tareas asignadas</Text>
          <Text style={styles.emptySubtext}>Las tareas de esta clase aparecerán aquí</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.tareasHeader}>
        <Text style={styles.sectionTitle}>Tareas de la Clase</Text>
        <View style={styles.tareasSummary}>
          <Text style={styles.tareasSummaryText}>
            {taskData.length} {taskData.length === 1 ? 'tarea' : 'tareas'}
          </Text>
        </View>
      </View>
      
      
      <TaskAccordion 
        tasks={taskData} 
        classColor={color}
        onTaskUpdate={onTaskUpdate}
      />
    </View>
  );
};

// Tab: Recursos
const RecursosTab = ({ claseData }) => (
  <View>
    <Text style={styles.sectionTitle}>Recursos de la Clase</Text>
    <View style={styles.emptyState}>
      <Ionicons name="folder-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No hay recursos disponibles</Text>
      <Text style={styles.emptySubtext}>Los recursos de esta clase aparecerán aquí</Text>
    </View>
  </View>
);

// Componente auxiliar para las filas de información
const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 5,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    height: 250,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 50,
    marginLeft: 20,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    flex: 1,
    zIndex: 5,
  },

  tareasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  tareasSummary: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },

  tareasSummaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },

  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
  },
  headerBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '140%',
    height: '120%',
    opacity: 0.2,
    zIndex: 0,
  },

  // Estilos de los Tabs
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  tabsScrollView: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  tabButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: '#626262ff',
    marginLeft: 6,
  },
  tabLabelActive: {
    color: '#fff',
  },

  // Estilos del Body
  modalBody: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontFamily: 'poppins-regular',
  },
  
  // Estilos de las secciones
  infoSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 15,
  },
  
  // Grid de información
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridItem: {
    width: '48%',
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
    paddingTop:12
  },
  label: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginBottom: 2,
    textAlign: 'center',
  },
  value: {
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    color: '#470427ff',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  // Info rows
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: '#666',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#333',
    flex: 1,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#333',
    lineHeight: 20,
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#666',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#999',
    marginTop: 5,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'poppins-regular',
  },
  
  // Footer
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },

  actionButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',

  },
  actionButton: {
    width:160,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'poppins-semibold',
  },

  emptyState: {
  alignItems: 'center',
  marginTop: 40,
},
emptyText: {
  fontSize: 18,
  fontFamily: 'poppins-semibold',
  color: '#777',
  marginTop: 10,
},
emptySubtext: {
  fontSize: 14,
  fontFamily: 'poppins-regular',
  color: '#aaa',
  textAlign: 'center',
},
tareaRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},
tareaTitulo: {
  fontSize: 16,
  fontFamily: 'poppins-medium',
  color: '#333',
},
swipeButton: {
  justifyContent: 'center',
  alignItems: 'center',
  width: 60,
  height: '100%',
},

fab: {
  position: 'absolute',
  bottom: 30, 
  right: 25,
  borderRadius: 50,
  width: 60,
  height: 60,
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
},

});

export default ClassModal;