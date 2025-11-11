import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Modal, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import colors from '../../constants/colors';
import global from '../../constants/global';
import { useOverviewData } from '../../context/OverviewDataContext';
import ClassModal from '../../modals/ClassModal';
import { getClassById } from "../../services/GetClassById";
import { getClassDocumentCollection } from '../../services/GetClassDocumentCollection';
import { getDocenteById } from "../../services/GetDocenteById";
import { getPeriodById } from "../../services/GetPeriodById";

export default function HistorialClass({onClose}) {
    const [docentes, setDocentes] = useState({});
    const [periodo, setPeriodo] = useState({});
    const [classe, setClase] = useState([]);
    const [classIdModal, setClassIdModal] = useState('');
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [filteredClass, setFilteredClass] = useState([]);
    const [modalInfoVisible, setModalInfoVisible] = useState(false);

  useEffect(() => {
    const fectchClase = async () => {
      setLoadingClasses(true);
      const claseList = await getClassDocumentCollection("idClaseCollection");
      
      const docentesTemp = {};
      const periodoTemp = {};
      const classIdTemp = {};

      for (const clase of claseList) {
        const docenteId = clase.class_id_docente?.trim?.();
        if (docenteId) {
          const docenteData = await getDocenteById(docenteId);
          if (docenteData) {
            docentesTemp[docenteId] = docenteData.docente_fullName;
          }
        }
      }

      const filtered = claseList.filter(classs =>
        classs.class_estado === "Cursada"
      );

      for (const clase of claseList) {
        const periodoId = clase.class_period;
        if (periodoId) {
          const periodoData = await getPeriodById(periodoId);
          if (periodoData) {
            periodoTemp[periodoId] = periodoData.periodo_id;
          }
        }
      }

      for(const claseid of claseList){
        const claseIdd = claseid.clase_id;
        if(claseIdd){
          const claseIdData = await getClassById(claseIdd);
          if (claseIdData) {
            classIdTemp[claseIdd] = claseIdData.clase_id;
          }
        }
      }


      setClassIdModal(classIdTemp);
      setClase(claseList);
      setPeriodo(periodoTemp);
      setDocentes(docentesTemp);
      setLoadingClasses(false);
      setFilteredClass(filtered);
    };
    fectchClase();
  }, []);

  const [selectedClass, setselectedClass] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);

  const handleSelectedClassModal = (clase) => {
    setselectedClass(clase);
    setShowClassModal(true);
  };

    const {
        promedioPeriodoActual,
        promedioGrado,
        sumCreditos,
        loading,
        refreshData,
        lastUpdate
    } = useOverviewData();

     const [refreshing, setRefreshing] = useState(false);
      const onRefresh = async () => {
        setRefreshing(true);
        await refreshData();
        setRefreshing(false);
      };
    
      const [loadClass, setloadClass] = useState(true);
      const loadClassRefresh = async () => {
        setLoadingClasses(true);
        const claseList = await getClassDocumentCollection("idClaseCollection");
        setClase(claseList);
        setLoadingClasses(false);
      };
      const router = useRouter();

      const renderClassItem = ({ item }) => (
        <TouchableOpacity 
        style={styles.classItem}
        onPress={() => handleSelectedClassModal(item.clase_id)}
        >
          <View style={styles.classIconContainer}>
            <Ionicons name="person-circle" size={40} color={colors.color_palette_1.lineArt_Purple} />
          </View>
          <View style={styles.classInfo}>
            <Text style={styles.className}>{item.class_name}</Text>
            {docentes[item.class_id_docente] && (
              <Text style={styles.classEmail}>{docentes[item.class_id_docente]}</Text>
            )}
            <Text style={styles.classEmail}>{item.class_credit} U.V</Text>
            <Text style={styles.classEmail}>Periodo {periodo[item.class_period]}</Text>
            {periodo[item.class_period] && (
                <>
                <View style={[global.notSpaceBetweenObjects]}>
                    <Ionicons name="star" size={15} color={colors.color_palette_1.lineArt_Purple} />
                    <Text style={styles.classSpecialty}>{item.class_promedio}%</Text>
                </View>
                </>
            )}
          </View>
           <ClassModal
            visible={showClassModal}
            classIdModal={selectedClass}
            onClose={() => {
              setShowClassModal(false);
              setselectedClass(null);
            }}
            
            />
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        
      );
    
      if (loading && !lastUpdate) {
        return (
          <View style={styles.mainLoadingContainer}>
            <ActivityIndicator size="large" color={"#780359ff"}/>
            <Text style={styles.mainLoadingText}>Cargando datos...</Text>
          </View>
        );
      }
  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content"></StatusBar>
          <View>

            {/* Header */}
            <View style={styles.header}>
                <View style={global.notSpaceBetweenObjects}>
                    <View >
                        <TouchableOpacity 
                        onPress={() => {
                          if (onClose) {
                            onClose();
                          } else {
                            router.back(); 
                          }
                        }} 
                        style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Historial de Clases</Text>
                    </View>
                </View>

                <View style={[global.notSpaceBetweenObjects, {top:20, marginLeft: 5}]}>
                   <View>
                        <TouchableOpacity 
                        onPress={() => setModalInfoVisible(true)}
                        style={styles.infoButton}>
                            <Ionicons name="information-circle-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <Modal
                      animationType="fade"
                      transparent={true}
                      visible={modalInfoVisible}
                      style={styles.modalContainer}
                    >
                      <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                          <Text style={[styles.modalText, {fontSize: 20, fontWeight:'bold'}]}>Datos de Promedio</Text>
                          <View style={{justifyContent: 'justify'}}>
                            <Text style={styles.modalText}>{promedioGrado} %: Promedio de Graduación</Text>
                            <Text style={styles.modalText}>{promedioPeriodoActual} %: Promedio de Último Periodo</Text>
                            <Text style={styles.modalText}>{sumCreditos} U.V: Creditos Totales</Text>
                          </View>
                          
                          <Button title="Aceptar" onPress={() => setModalInfoVisible(false)} />
                        </View>
                      </View>
                      
                    </Modal>

                    <View>
                        <View style={global.aside}>
                            <View style={styles.averageTabs}>
                                <Text>{promedioGrado} %</Text>
                            </View>

                            <View style={styles.averageTabs}>
                                <Text>{promedioPeriodoActual} %</Text>
                            </View>

                            <View style={styles.averageTabs}>
                                <Text>{sumCreditos} UV</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <View>
              {loadingClasses? (
                <View style={styles.loadingClassesContainer}>
                  <ActivityIndicator size="large" color="#782170" />
                  <Text style={styles.loadingClassesText}>Cargando Clases...</Text>
                </View>
              ): classe.length === 0 ?(
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="school-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyStateTitle}>No hay clases matriculadas</Text>
                  <Text style={styles.emptyStateText}>
                    Aún no tienes clases registradas en este periodo
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={classe}
                  renderItem={renderClassItem}
                  keyExtractor={(item, index) => item.clase_id?.toString() || index.toString()}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={true}
                />

              )}
            </View>
          </View>

        </SafeAreaView>
      </GestureHandlerRootView>
    )
  }
  
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#fff',
    },
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    header: {
      backgroundColor: '#fff',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 30,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#2c3e50',
      fontFamily: 'poppins-bold',
    },
    headerSubtitle: {
      fontSize: 14,
      color: '#999',
      textTransform: 'capitalize',
      marginTop: 2,
    },
    scrollView: {
      flex: 1,
    },
    calendarContainer: {
      paddingHorizontal: 15,
      paddingTop: 20,
      paddingBottom: 10,
    },
    searchContainer: {
      paddingHorizontal: 15,
      paddingTop: 15,
    },
    eventsListContainer: {
      paddingHorizontal: 15,
      paddingTop: 10,
      paddingBottom: 20,
    },

    closeButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(42, 41, 41, 0.26)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  infoButton: {
    width: 26,
    height: 26,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 30, 90, 0.32)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },

  averageTabs: {
    width: 90,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(173, 9, 137, 0.13)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  loadingClassesContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingClassesText: {
    marginTop: 16,
    fontSize: 16,
    color: '#782170',
    fontFamily: 'poppins-medium',
  },
  emptyStateContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptyStateText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },

  // List
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  classItem: {
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
  classIconContainer: {
    marginRight: 15,
  },
  classInfo: {
    flex: 1,
  },
className: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 2,
  },
  classEmail: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginBottom: 2,
  },
  classSpecialty: {
    fontSize: 12,
    left:5,
    fontFamily: 'poppins-regular',
    color: '#999',
  },

  //Mdoal
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Translucent background for the modal overlay
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  });