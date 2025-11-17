import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SearchBar from '../../components/SearchBar';
import colors from '../../constants/colors';
import global from '../../constants/global';
import ClassModal from '../../modals/ClassModal';
import { getClassByName } from "../../services/GetClassByName";
import { getClassDocumentCollection } from '../../services/GetClassDocumentCollection';
import { getPeriodById } from "../../services/GetPeriodById";
import { getRequiredClass } from "../../services/GetRequiredClass";

export default function CourseFlowchart({ onClose }) {
  const router = useRouter();
  
  const [classes, setClasses] = useState([]);
  const [classDataId, setClassDataId] = useState(null);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [periods, setPeriods] = useState({});
  const [requiredClass, setRequiredClass] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [selectedPeriod, setSelectedPeriod] = useState('Todos');
  const [selectedRequiredClass, setSelectedRequiredClass] = useState('');
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedEnroll, setSelectedEnroll] = useState('Todos');
  const [selectedClassType, setSelectedClassType] = useState('Todos');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showRequiredModal, setShowRequiredModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedClassFind, setSelectedClassFind] = useState(null);
  
  // Modal de clase
  const [selectedClass, setSelectedClass] = useState(null);
  const [openChain, setOpenChain] = useState([]);
  const [loadingChain, setLoadingChain] = useState(false);

//logica de clases conectadas
const loadOpeningChain = async (classId) => {
  if (!classId) return;
  setLoadingChain(true);

  try {
    const currentClass = classes.find(cls => cls.fc_id === classId);
    if (!currentClass) {
      setOpenChain([]);
      setLoadingChain(false);
      return;
    }

    const chain = [];

    const classesOpenedByThis = classes.filter(
      cls => cls.fc_opened_id_by === currentClass.fc_id
    );

    for (const openedClass of classesOpenedByThis) {
      chain.push({
        fc_id: openedClass.fc_id,
        fc_name: openedClass.fc_name,
        fc_codigo: openedClass.fc_codigo,
        fc_type: openedClass.fc_type,
        fc_creditos: openedClass.fc_creditos,
        fc_enrollment: openedClass.fc_enrollment
      });

      const recursiveChain = await findClassesOpenedBy(openedClass.fc_id);
      chain.push(...recursiveChain);
    }

    setOpenChain(chain);
  } catch (error) {
    console.error('Error cargando cadena:', error);
    setOpenChain([]);
  } finally {
    setLoadingChain(false);
  }
};

const findClassesOpenedBy = async (classId) => {
  const result = [];
  const openedClasses = classes.filter(
    cls => cls.fc_opened_id_by === classId
  );

  for (const cls of openedClasses) {
    result.push({
      fc_id: cls.fc_id,
      fc_name: cls.fc_name,
      fc_codigo: cls.fc_codigo,
      fc_type: cls.fc_type,
      fc_creditos: cls.fc_creditos,
      fc_enrollment: cls.fc_enrollment
    });

    const nested = await findClassesOpenedBy(cls.fc_id);
    result.push(...nested);
  }

  return result;
};


useEffect(() => {
  if (selectedClass) {
    loadOpeningChain(selectedClass); 
  } else {
    setOpenChain([]);
  }
}, [selectedClass, classes]); 


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const classList = await getClassDocumentCollection("idFlujogramaClases");
      const classFetchId = await getClassDocumentCollection("idClaseCollection");
      //console.log("classFecthId: ", classFetchId);
      
      const periodsTemp = {};
      const requiredClassTemp = {};
      const nombreClassTemp = {};

      const classesMap = {};
      classFetchId.forEach(cls => {
        classesMap[cls.clase_id] = {
          id: cls.clase_id,
          name: cls.class_name,
          type: cls.class_type
        };
      });

      const enrichedFlujo = classList.map(fgc => {
        const matchingClass = classFetchId.find(
          cls => cls.class_name === fgc.fc_name || cls.clase_id === fgc.fc_id
        );

        // console.log("matchingClass: ", matchingClass)

        return {
          ...fgc, 
          id: fgc.id,
          fc_id: fgc.fc_id,
          clase_id: matchingClass?.clase_id || fgc.fc_id, 
        }
      });

      // Guardar el enrichedFlujo en lugar de classList
      setSelectedClassFind(enrichedFlujo);

      // Obtener clases requerida y períodos
      for (const clase of classList) {

        const requiredClassId = clase.fc_open_class_id?.trim?.();
        //console.log('requiredIDClass: ', requiredClassId);
        if (requiredClassId && !requiredClassTemp[requiredClassId]) {
          const classData = await getRequiredClass(requiredClassId);
          //console.log('classData:: ', classData);
          if (classData){
            requiredClassTemp[requiredClassId] = {
              id: classData.fc_open_class_id,
              name: classData.fc_open_class_name
            };
          }
        }

        const periodoId = clase.fc_periodo;
        if (periodoId && !periodsTemp[periodoId]) {
          const periodoData = await getPeriodById(periodoId);
          if (periodoData) {
            periodsTemp[periodoId] = {
              id: periodoData.periodo_id,
              inicio: periodoData.periodo_fecha_inicio,
              final: periodoData.periodo_fecha_final,
              year: periodoData.periodo_curso_anio
            };
          }
        }

        const claseNombre = clase.fc_name;
        if (claseNombre && !nombreClassTemp[claseNombre]) {
          const classNombreData = await getClassByName(claseNombre);
          //console.log('classNombreData:: ', classNombreData);
          if (classNombreData) {
            nombreClassTemp[claseNombre] = {
              id: classNombreData.clase_id,
              name: classNombreData.class_name,
            };
          }
        }
      }

      setClasses(classList);
      setClassDataId(nombreClassTemp);
      setPeriods(periodsTemp);
      setRequiredClass(requiredClassTemp)
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoading(false);
    }
  };


  //Logica de Filtros
  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedPeriod, selectedYear, selectedEnroll,selectedClassType, selectedStatus, classes]);

  const applyFilters = () => {
    let filtered = [...classes];

    if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(cls => 
      cls.fc_name?.toLowerCase().includes(query) ||
      cls.fc_codigo?.toLowerCase().includes(query) ||
      cls.fc_type?.toLowerCase().includes(query)
    );
  }

    if (selectedPeriod !== 'Todos') {
      filtered = filtered.filter(cls => 
        cls.fc_periodo === selectedPeriod);
    }

     if (selectedYear !== 'Todos') {
      filtered = filtered.filter(cls => 
        cls.fc_anio === selectedYear);
    }

    if (selectedStatus !== 'Todos') {
      filtered = filtered.filter(cls => 
        cls.fc_status === selectedStatus);
    }

     if (selectedEnroll !== 'Todos') {
      filtered = filtered.filter(cls => 
        cls.fc_enrollment === selectedEnroll);
    }
     if (selectedClassType !== 'Todos') {
      filtered = filtered.filter(cls => 
        cls.fc_type === selectedClassType);
    }

    setFilteredClasses(filtered);
  };

  const getUniqueYears = () => {
    const years = new Set();
    Object.values(periods).forEach(period => {
      if (period.year) years.add(period.year.toString());
    });
    return ['Todos', ...Array.from(years).sort()];
  };

  const getUniquePeriods = () => {
    return ['Todos', ...Object.keys(periods)];
  };


  const organizeByPeriod = () => {
    const organized = {};
    
    filteredClasses.forEach(cls => {
      const periodKey = cls.fc_periodo || 'Sin período';
      if (!organized[periodKey]) {
        organized[periodKey] = [];
      }
      organized[periodKey].push(cls);
    });

    return organized;
  };

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

  const handleClassPress = (classId) => {
  const classFetchFind = selectedClassFind.find(cls => cls.clase_id === classId);
  const flujoFetchFind = classes.find(cls => cls.fc_id === classId);
  if (classFetchFind || flujoFetchFind ) {
    // Usar clase_id si existe, si no fc_id
    const idToPass = classFetchFind.clase_id || flujoFetchFind.fc_id;
    console.log('handleClassPress - ID a pasar:', idToPass);
    setSelectedClassFind(idToPass);
    setShowClassModal(true);
  }
};

  //rendiraciones

  const renderClassNode = (item) => {
    const color = getClassColor(item.fc_type);
    const isCompleted = item.fc_enrollment === 'Cursada';
    const grade = parseFloat(item.fc_promedio || 0);

    return (
      <TouchableOpacity
      key={item.fc_id}
      style={[
        styles.classNode,
        {borderLeftColor: color, borderLeftWidth: 4 }
      ]}
      onPress={() => {
        // Usar clase_id si existe, si no fc_id
        const idToPass = item.clase_id || item.fc_id;
        console.log('Abriendo modal con ID:', idToPass);
        setSelectedClassFind(idToPass);
        setShowClassModal(true);
      }} 
      activeOpacity={0.7}
    >
        <View style={styles.classNodeHeader}>
          <View style={styles.classNodeTitle}>
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

          {grade > 0 && (
            <View style={styles.gradeContainer}>
              <Ionicons name="star" size={14} color="#ffa726" />
              <Text style={styles.gradeText}>{grade}%</Text>
            </View>
          )}
        </View>

        {/* Prerequisite indicator */}
        {item.fc_open_class_id && (
          <TouchableOpacity 
            onPress={() => {
              setSelectedClass(item.fc_id); 
              setShowRequiredModal(true);
            }}
          >
            <View style={styles.prerequisiteIndicator}>
              <Ionicons name="git-branch-outline" size={12} color="#666" />
              <Text style={styles.prerequisiteText}>Tiene requisitos</Text>
            </View>
          </TouchableOpacity>
        )}

      </TouchableOpacity>
    );
  };

  const renderPeriodSection = (periodKey, classList) => {
    const period = periods[periodKey];
    //console.log("renderPeriod: ", period);

    const periodoCursoYear = period?.year;
    const periodosCursoMap = {
      "1": "Primer Año",
      "2": "Segundo Año",
      "3": "Tercer Año",
      "4": "Cuarto Año",
    };
    const periodoCursoAnio = periodosCursoMap[periodoCursoYear] ?? "No disponible";

    const periodoClass = period?.id;
    const periodoClassMap = {
      "1": "Periodo I",
      "2": "Segundo Periodo",
      "3": "Tercer Periodo",
      "4": "Cuarto Periodo",
    };
    const periodo_clase = periodoClassMap[periodoClass] ?? "No disponible";
    
    const periodName = period ? `${periodo_clase}` : periodKey;

    const periodInicioTimestamp = period?.inicio;
    const periodFinalTimestamp = period?.final;
    
    let fechaInicio;
    let fechaFinal;
    if (periodInicioTimestamp && typeof periodInicioTimestamp.seconds === 'number'
      && periodFinalTimestamp && typeof periodFinalTimestamp.seconds === 'number'
    ) {
    const initialDateObject = new Date(periodInicioTimestamp.seconds * 1000);
    const finalDateObject = new Date(periodFinalTimestamp.seconds * 1000);

    fechaInicio = initialDateObject.toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    fechaFinal = finalDateObject.toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  } else {
    fechaInicio = "Sin fecha de Inicio";
    fechaFinal = "Sin fecha Final";
  }

    

   
    return (
      <View key={periodKey} style={styles.periodSection}>
        <View style={styles.periodHeader}>
          <View style={styles.periodTitleContainer}>
            <Ionicons name="calendar" size={24} color={colors.color_palette_1.lineArt_Purple} />
            <View style={styles.periodInfo}>
              <Text style={styles.periodTitle}>{periodName}</Text>
              <Text style={styles.periodSubtitle}>{periodoCursoAnio}</Text>
              <Text style={styles.periodSubtitle}>{fechaInicio}</Text>
              <Text style={styles.periodSubtitle}>{fechaFinal}</Text>
            </View>
          </View>
          
          <View style={styles.periodStats}>
            <View style={styles.periodStatBadge}>
              <Text style={styles.periodStatValue}>
                {classList.filter(c => c.fc_enrollment === 'Cursada').length}
              </Text>
              <Text style={[styles.periodStatLabel, {textAlign: 'center'}]}>Cursadas En Este Periodo</Text>
            </View>
            <View style={styles.periodStatBadge}>
              <Text style={styles.periodStatValue}>
                {classList.length}
              </Text>
              <Text style={[styles.periodStatLabel, {textAlign: 'center'}]}>Total de Clases En Este Periodo</Text>
            </View>
          </View>

        </View>

        <View style={styles.flowchartContainer}>
          {classList.map((item, index) => (
            <View key={item.fc_id} style={styles.nodeWrapper}>
              {renderClassNode(item)}
              {index < classList.length - 1 && (
                <View style={styles.connector}>
                  <Ionicons name="arrow-down" size={20} color="#ccc" />
                </View>
              )}
            </View>
          ))}
        </View>

      </View>
    );
  };



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.color_palette_1.lineArt_Purple} />
        <Text style={styles.loadingText}>Cargando cursos...</Text>
      </View>
    );
  }

  const organizedClasses = organizeByPeriod();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Flujograma de Cursos</Text>

            <TouchableOpacity 
              onPress={() => setShowFiltersModal(true)}
              style={styles.filterButton}
            >
              <Ionicons name="filter" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* SearchBar */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por nombre, código o tipo..."
            style={styles.searchBarContainer}
            inputStyle={styles.searchBarInput}
          />

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="school-outline" size={20} color="#fff" />
              <Text style={styles.statValue}>{classes.length}</Text>
              <Text style={styles.statLabel}>Clases Totales</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
              <Text style={styles.statValue}>
                {classes.filter(c => c.fc_enrollment === 'Cursada').length}
              </Text>
              <Text style={styles.statLabel}>Cursadas</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={20} color="#fff" />
              <Text style={styles.statValue}>
                {classes.filter(c => c.fc_enrollment === 'En Curso').length}
              </Text>
              <Text style={styles.statLabel}>En Curso</Text>
            </View>
          </View>

          {/* Active Filters */}
          {(searchQuery || selectedPeriod !== 'Todos' || selectedYear !== 'Todos' || selectedClassType !== 'Todos' || selectedEnroll !== 'Todos' || selectedStatus !== 'Todos') && (
            <View style={styles.activeFilters}>
              <Text style={styles.activeFiltersLabel}>Filtros activos:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.activeFiltersList}>
                  {searchQuery && (
                    <View style={styles.activeFilterChip}>
                      <Ionicons name="search" size={12} color="#fff" />
                      <Text style={styles.activeFilterText}>
                        "{searchQuery}"
                      </Text>
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                  {selectedPeriod !== 'Todos' && (
                    <View style={styles.activeFilterChip}>
                      <Text style={styles.activeFilterText}>
                        Periodo {periods[selectedPeriod]?.id || selectedPeriod}
                      </Text>
                      <TouchableOpacity onPress={() => setSelectedPeriod('Todos')}>
                        <Ionicons name="close-circle" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                  {selectedYear !== 'Todos' && (
                    <View style={styles.activeFilterChip}>
                      <Text style={styles.activeFilterText}>Año {selectedYear}</Text>
                      <TouchableOpacity onPress={() => setSelectedYear('Todos')}>
                        <Ionicons name="close-circle" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                  {selectedEnroll !== 'Todos' && (
                    <View style={styles.activeFilterChip}>
                      <Text style={styles.activeFilterText}>{selectedEnroll}</Text>
                      <TouchableOpacity onPress={() => setSelectedEnroll('Todos')}>
                        <Ionicons name="close-circle" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                  {selectedStatus !== 'Todos' && (
                    <View style={styles.activeFilterChip}>
                      <Text style={styles.activeFilterText}>{selectedStatus}</Text>
                      <TouchableOpacity onPress={() => setSelectedStatus('Todos')}>
                        <Ionicons name="close-circle" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                  {selectedClassType !== 'Todos' && (
                    <View style={styles.activeFilterChip}>
                      <Text style={styles.activeFilterText}>{selectedClassType}</Text>
                      <TouchableOpacity onPress={() => setSelectedClassType('Todos')}>
                        <Ionicons name="close-circle" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Content */}
        {filteredClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="git-network-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No hay clases para mostrar</Text>
            <Text style={styles.emptySubtitle}>
              Ajusta los filtros o agrega nuevas clases
            </Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {Object.entries(organizedClasses).map(([periodKey, classList]) =>
              renderPeriodSection(periodKey, classList)
            )}
          </ScrollView>
        )}


        <Modal
          visible={showRequiredModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowRequiredModal(false)}
        >
          <View style={styles.currentmodalOverlay}>
            <View style={styles.currentmodalContent}>
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Dependencias de Clase</Text>
                <TouchableOpacity onPress={() => setShowRequiredModal(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Mostrar nombre de la clase actual */}
                {selectedClass && (
                  <View style={styles.currentClassSection}>
                    <Text style={styles.currentClassLabel}>Clase seleccionada:</Text>
                    <Text style={styles.currentClassName}>
                      {classes.find(c => c.fc_id === selectedClass)?.fc_name || 'Desconocida'}
                    </Text>
                    <Text style={styles.currentClassCode}>
                      {classes.find(c => c.fc_id === selectedClass)?.fc_codigo}
                    </Text>
                  </View>
                )}

                {loadingChain ? (
                  <View style={styles.loadingChainContainer}>
                    <ActivityIndicator size="large" color={colors.color_palette_1.lineArt_Purple} />
                    <Text style={styles.loadingChainText}>Buscando clases...</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.dependencySection}>
                      <View style={styles.sectionHeaderContainer}>
                        <Ionicons name="lock-closed" size={20} color="#e91e63" />
                        <Text style={styles.sectionTitle}>Prerequisitos</Text>
                      </View>
                      <Text style={styles.sectionSubtitle}>
                        Clases que debes aprobar antes de cursar esta
                      </Text>

                      {(() => {
                        const currentClass = classes.find(c => c.fc_id === selectedClass);
                        if (!currentClass?.fc_open_class_id) {
                          return (
                            <View style={styles.emptyDependency}>
                              <Ionicons name="checkmark-circle-outline" size={32} color="#4caf50" />
                              <Text style={styles.emptyDependencyText}>
                                No requiere prerequisitos
                              </Text>
                            </View>
                          );
                        }

                        const prerequisiteClass = classes.find(
                          c => c.fc_id === currentClass.fc_open_class_id
                        );

                        if (!prerequisiteClass) {
                          return (
                            <View style={styles.emptyDependency}>
                              <Ionicons name="alert-circle-outline" size={32} color="#ff9800" />
                              <Text style={styles.emptyDependencyText}>
                                Prerequisito no encontrado
                              </Text>
                            </View>
                          );
                        }

                        return (
                          <TouchableOpacity
                            style={[styles.classItemCard, styles.prerequisiteCard]}
                            onPress={() => {
                              setShowRequiredModal(false);
                              setSelectedClass(prerequisiteClass.fc_id);
                              setShowClassModal(true);
                            }}
                          >
                            <View style={styles.classItemHeader}>
                              <View style={[
                                styles.classItemBadge,
                                { backgroundColor: getClassColor(prerequisiteClass.fc_type) + '20' }
                              ]}>
                                <Text style={[
                                  styles.classItemBadgeText,
                                  { color: getClassColor(prerequisiteClass.fc_type) }
                                ]}>
                                  {prerequisiteClass.fc_type || 'General'}
                                </Text>
                              </View>
                              
                              {prerequisiteClass.fc_enrollment === 'Cursada' && (
                                <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
                              )}
                            </View>

                            <Text style={styles.classItemCode}>{prerequisiteClass.fc_codigo}</Text>
                            <Text style={styles.classItemName}>{prerequisiteClass.fc_name}</Text>
                            
                            <View style={styles.classItemFooter}>
                              <Text style={styles.classItemCredits}>
                                {prerequisiteClass.fc_creditos} UV
                              </Text>
                              <View style={styles.classItemStatus}>
                                <View style={[
                                  styles.statusDot,
                                  { backgroundColor: prerequisiteClass.fc_enrollment === 'Cursada' ? '#4caf50' : '#ff9800' }
                                ]} />
                                <Text style={styles.classItemStatusText}>
                                  {prerequisiteClass.fc_enrollment || 'Sin cursar'}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })()}
                    </View>

                    {/* Separador */}
                    <View style={styles.sectionDivider} />

                    {/* SECCIÓN 2: CLASES QUE ABRE */}
                    <View style={styles.dependencySection}>
                      <View style={styles.sectionHeaderContainer}>
                        <Ionicons name="key" size={20} color="#4caf50" />
                        <Text style={styles.sectionTitle}>Clases que abre</Text>
                      </View>
                      <Text style={styles.sectionSubtitle}>
                        Clases que podrás cursar al aprobar esta
                      </Text>

                      {openChain.length === 0 ? (
                        <View style={styles.emptyDependency}>
                          <Ionicons name="information-circle-outline" size={32} color="#999" />
                          <Text style={styles.emptyDependencyText}>
                            No abre ninguna clase
                          </Text>
                        </View>
                      ) : (
                        <>
                          <Text style={styles.countBadge}>
                            {openChain.length} {openChain.length === 1 ? 'clase' : 'clases'}
                          </Text>

                          {openChain.map((cls, index) => (
                            <TouchableOpacity
                              key={`${cls.fc_id}-${index}`}
                              style={styles.classItemCard}
                              onPress={() => {
                                setShowRequiredModal(false);
                                setSelectedClass(cls.fc_id);
                                setShowClassModal(true);
                              }}
                            >
                              <View style={styles.classItemHeader}>
                                <View style={[
                                  styles.classItemBadge,
                                  { backgroundColor: getClassColor(cls.fc_type) + '20' }
                                ]}>
                                  <Text style={[
                                    styles.classItemBadgeText,
                                    { color: getClassColor(cls.fc_type) }
                                  ]}>
                                    {cls.fc_type || 'General'}
                                  </Text>
                                </View>
                                
                                {cls.fc_enrollment === 'Cursada' && (
                                  <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
                                )}
                              </View>

                              <Text style={styles.classItemCode}>{cls.fc_codigo}</Text>
                              <Text style={styles.classItemName}>{cls.fc_name}</Text>
                              
                              <View style={styles.classItemFooter}>
                                <Text style={styles.classItemCredits}>
                                  {cls.fc_creditos} UV
                                </Text>
                                <View style={styles.classItemStatus}>
                                  <View style={[
                                    styles.statusDot,
                                    { backgroundColor: cls.fc_enrollment === 'Cursada' ? '#4caf50' : '#ff9800' }
                                  ]} />
                                  <Text style={styles.classItemStatusText}>
                                    {cls.fc_enrollment || 'Sin cursar'}
                                  </Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </>
                      )}
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
        

        {/* Filters Modal */}
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

                <View style={global.aside}>
                </View>
                {/* Period Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Por Período</Text>
                  <View style={styles.filterOptions}>
                    {getUniquePeriods().map(period => (
                      <TouchableOpacity
                        key={period}
                        style={[
                          styles.filterOption,
                          selectedPeriod === period && styles.filterOptionActive
                        ]}
                        onPress={() => setSelectedPeriod(period)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          selectedPeriod === period && styles.filterOptionTextActive
                        ]}>
                          {period === 'Todos' ? period : periods[period]?.name || period}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Year Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Por Año</Text>
                  <View style={styles.filterOptions}>
                    {getUniqueYears().map(year => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.filterOption,
                          selectedYear === year && styles.filterOptionActive
                        ]}
                        onPress={() => setSelectedYear(year)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          selectedYear === year && styles.filterOptionTextActive
                        ]}>
                          {year === 'Todos' ? year : `Año ${year}`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Enroll Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Por Matricula</Text>
                  <View style={styles.filterOptions}>
                    {['Todos', 'En curso', 'Cursada'].map(enroll => (
                      <TouchableOpacity
                        key={enroll}
                        style={[
                          styles.filterOption,
                          selectedEnroll === enroll && styles.filterOptionActive
                        ]}
                        onPress={() => setSelectedEnroll(enroll)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          selectedEnroll === enroll && styles.filterOptionTextActive
                        ]}>
                          {enroll}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Status Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Por Estado</Text>
                  <View style={styles.filterOptions}>
                    {['Todos', 'Activo', 'Inactivo'].map(status => (
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

                {/* Type Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Por Categoría de Clase</Text>
                  <View style={styles.filterOptions}>
                    {['Todos', 'Programación', 'Ciencia de Datos','Ciencias Exactas', 'Negocios','General','Ingles'].map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.filterOption,
                          selectedClassType === type && styles.filterOptionActive
                        ]}
                        onPress={() => setSelectedClassType(type)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          selectedClassType === type && styles.filterOptionTextActive
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setSelectedPeriod('Todos');
                    setSelectedYear('Todos');
                    setSelectedEnroll('Todos');
                    setSelectedStatus('Todos');
                    setSelectedClassType('Todos');
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

        {/* Class Modal */}
        <ClassModal
          visible={showClassModal}
          classIdModal={selectedClassFind}
          onClose={() => {
            setShowClassModal(false);
            setSelectedClass(null);
            fetchData();
          }}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
  filterButton: {
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

  //SeacrhBar
  searchBarContainer: {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  marginTop: 15,
  marginBottom: 15,
  },
  searchBarInput: {
    fontFamily: 'poppins-regular',
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

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Period Section
  periodSection: {
    marginBottom: 30,
  },
  periodHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  periodTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  periodInfo: {
    flex: 1,
  },
  periodTitle: {
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    color: '#333',
  },
  periodSubtitle: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginTop: 2,
  },
  periodStats: {
    flexDirection: 'row',
    gap: 10,
  },
  periodStatBadge: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  periodStatValue: {
    fontSize: 20,
    fontFamily: 'poppins-bold',
    color: colors.color_palette_1.lineArt_Purple,
  },
  periodStatLabel: {
    fontSize: 11,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginTop: 2,
  },

  // Flowchart
  flowchartContainer: {
    paddingLeft: 10,
  },
  nodeWrapper: {
    marginBottom: 10,
  },
  classNode: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  classNodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  classNodeTitle: {
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
    marginBottom: 8,
  },
  classTeacher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  classTeacherText: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
    flex: 1,
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
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
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gradeText: {
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    color: '#ffa726',
  },
  prerequisiteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  prerequisiteText: {
    fontSize: 11,
    fontFamily: 'poppins-regular',
    color: '#999',
  },
  connector: {
    alignItems: 'center',
    paddingVertical: 5,
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '110%',
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

//Modal de Clases Que Abre
  currentmodalOverlay: {
    flex: 1,
    backgroundColor:"#0000005b",
    justifyContent: 'flex-end',
  },
  currentmodalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  currentClassSection: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  currentClassLabel: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  currentClassName: {
    fontSize: 18,
    fontFamily: 'poppins-bold',
    color: '#fff',
  },
  currentClassCode: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  loadingChainContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingChainText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#666',
  },
  emptyChainContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },

  // estilos para las secciones de dependencias
  dependencySection: {
    marginBottom: 24,
  },
  sectionHeaderContainer: {
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
  sectionDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 24,
  },
  emptyDependency: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  emptyDependencyText: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  countBadge: {
    fontSize: 12,
    fontFamily: 'poppins-semibold',
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  prerequisiteCard: {
    borderLeftColor: '#e91e63',
  },

  classItemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.color_palette_1.lineArt_Purple,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  classItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  classItemBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  classItemBadgeText: {
    fontSize: 11,
    fontFamily: 'poppins-semibold',
  },
  classItemCode: {
    fontSize: 13,
    fontFamily: 'poppins-semibold',
    color: '#666',
    marginBottom: 4,
  },
  classItemName: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 8,
  },
  classItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  classItemCredits: {
    fontSize: 13,
    fontFamily: 'poppins-medium',
    color: '#999',
  },
  classItemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  classItemStatusText: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#666',
  },
});

