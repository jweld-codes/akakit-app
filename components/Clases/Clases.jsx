// components/Clases/Clases.jsx
import { Ionicons } from "@expo/vector-icons";
import { Link } from 'expo-router';
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { ProgressBar } from 'react-native-paper';
import colors from '../../constants/colors';
import container from '../../constants/container';
import global from '../../constants/global';
import sectionheader from '../../constants/ios/sectionheader';
import { useOverviewData } from '../../context/OverviewDataContext';
import { getClassById } from "../../services/GetClassById";
import { getClassDocumentCollection } from "../../services/GetClassDocumentCollection";
import { getDocenteById } from "../../services/GetDocenteById";
import { getPeriodById } from "../../services/GetPeriodById";
import { getClassesData } from "../../services/GetTodayAndUpcomingClasses";
import QuickActionsCards_ClassTabs from "../Templates/QuickActionsButtons/QuickActionsCards_ClassTab";

export default function Clases({onModalPress}) {
  const [docentes, setDocentes] = useState({});
  const [periodo, setPeriodo] = useState({});
  const [classe, setClase] = useState([]);
  const [classIdModal, setClassIdModal] = useState('');
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    const fetchClase = async () => {
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
    };
    fetchClase();
  }, []);

  const handleModalIdValue = (claseData) => {
    const classId = claseData.clase_id;
    if (onModalPress) {
      onModalPress(claseData.clase_id);
    }
  };

  const [todayClasses, setTodayClasses] = useState([]);
  const [ongoingClass, setOngoingClass] = useState(null);
  const [upcomingClass, setUpcomingClass] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { todayClasses, upcomingClass, ongoingClass } = await getClassesData();
      setTodayClasses(todayClasses);
      setUpcomingClass(upcomingClass);
      setOngoingClass(ongoingClass);
    };
    fetchData();
  }, []);

  const {
    tasksValueMetadata,
    promedioGeneral,
    promediosPorPeriodo,
    promediosPorClase,
    enrolledClase,
    finishedClase,
    totalClasses,
    loading,
    lastUpdate,
    refreshData,
  } = useOverviewData();

  const getImageByClassType = (type) => {
    switch (type?.toLowerCase()) {
      case "general":
      case "general y complementaria":
        return require("../../assets/images/classes_bg/card_background/Generales.png");
      case "datos":
      case "ciencias de datos":
        return require("../../assets/images/classes_bg/card_background/Datos.png");
      case "exactas":
      case "ciencias exactas":
        return require("../../assets/images/classes_bg/card_background/Exactas.png");
      case "negocios":
        return require("../../assets/images/classes_bg/card_background/Negocios.png");
      case "programación":
        return require("../../assets/images/classes_bg/card_background/Programacion.png");
      default:
        return require("../../assets/images/classes_bg/card_background/Default.png");
    }
  };

  const getColorsByClassType = (type) => {
    switch (type?.toLowerCase()) {
      case "general":
      case "general y complementaria":
        return {
          header: colors.color_palette_4.general_orange,
          background: "#faf1e6ff",
          color: colors.color_palette_1.orange_darker,
          shadow: "#ff9800"
        };
      case "datos":
      case "ciencias de datos":
        return {
          header: colors.color_palette_4.datos_blue,
          background: "#e6f8ffff",
          color: colors.color_palette_2.lineArt_Blue,
          shadow: "#2196F3"
        };
      case "exactas":
      case "ciencias exactas":
        return {
          header: colors.color_palette_4.exactas_pink,
          background: "#fbeee7ff",
          color: colors.color_palette_2.pink_darker,
          shadow: "#E91E63"
        };
      case "negocios":
        return {
          header: colors.color_palette_4.negocio_green,
          background: "#e6fadeff",
          color: colors.color_palette_1.orange_darker,
          shadow: "#4CAF50"
        };
      case "programación":
        return {
          header: colors.color_palette_4.code_yellow,
          background: "#fffbe6ff",
          color: colors.color_palette_1.yellow_darker,
          shadow: "#FFC107"
        };
      default:
        return {
          header: "#a95656ff",
          background: "#f5f5f5",
          color: '#bbaecdff',
          shadow: "#999999"
        };
    }
  };

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

  if (loading && !lastUpdate) {
    return (
      <View style={styles.mainLoadingContainer}>
        <ActivityIndicator size="large" color={"#780359ff"}/>
        <Text style={styles.mainLoadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={"#782170"}
          colors={["#FFC000"]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={container.classes_container}>
        
        <QuickActionsCards_ClassTabs />

        <View style={styles.sectionContainer}>
          <View style={sectionheader.headerRow}>
            <View style={sectionheader.headerrow_twotexts_onelink}>
              <Ionicons name="book-outline" size={28} color="#782170" />
              <Text style={styles.sectionTitle}>
                Clases Matrículadas
              </Text>
            </View>
            <Link href="/QADir/Clases/SeeAllClasesScreen" style={sectionheader.linkButton}>
              <Text style={styles.linkText}>Ver Todas</Text>
            </Link>
          </View>

          {!loadingClasses && classe.length > 0 && (
            <>
            <View style={global.aside}>
              <View style={styles.countBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.countText}>
                {classe.length} {classe.length === 1 ? 'Activo' : 'Inactivo'}
              </Text>
            </View>

            <View  style={global.notSpaceBetweenObjects}>
              <TouchableOpacity 
                onPress={loadClassRefresh}
                style={styles.refreshButton}
              >
                <Ionicons name="refresh" size={20} color="#782170" />
              </TouchableOpacity>
              <Text>Refrescar</Text>
            </View>
            </View>
            
            </>
          )}
        </View>

        {/* Loading State para Clases */}
        {loadingClasses ? (
          <View style={styles.loadingClassesContainer}>
            <ActivityIndicator size="large" color="#782170" />
            <Text style={styles.loadingClassesText}>Cargando Clases...</Text>
          </View>
        ) : classe.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="school-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No hay clases matriculadas</Text>
            <Text style={styles.emptyStateText}>
              Aún no tienes clases registradas en este periodo
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.classesScrollContent}
          >
            {classe.map((clase, index) => {
              const { header, background, color, shadow } = getColorsByClassType(clase.class_type);
              const backgroundImage = getImageByClassType(clase.class_type);
              const claseStats = promediosPorClase[clase.clase_id];

              return (
                <View
                  key={clase.id}
                  style={[
                    styles.classCard,
                    {
                      backgroundColor: background,
                      shadowColor: shadow,
                    }
                  ]}
                >
                  {/* Header con color de categoría */}
                  <View style={[styles.cardHeader, {backgroundColor: header}]}>
                    <View style={styles.headerBadge}>
                      <Text style={styles.headerBadgeText}>{clase.class_type}</Text>
                    </View>
                  </View>

                  {/* Imagen de fondo */}
                  <View style={styles.cardImageContainer}>
                    <Image
                      source={backgroundImage}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Contenido de la tarjeta */}
                  <View style={styles.cardContent}>
                    <Text style={styles.className} numberOfLines={2}>
                      {clase.class_name}
                    </Text>
                    
                    <View style={styles.classInfoRow}>
                      <View style={styles.infoTag}>
                        <Text style={styles.classCode}>
                          {clase.class_codigo}
                        </Text>
                      </View>
                      <View style={[styles.infoTag, styles.sectionTag]}>
                        <Text style={styles.classSection}>
                          SEC {clase.class_section}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.docenteContainer}>
                      <Ionicons name="person-outline" size={16} color="#666" />
                      <Text style={styles.docenteName} numberOfLines={1}>
                        {docentes[clase.class_id_docente] || "Sin asignar"}
                      </Text>
                    </View>

                    <View style={styles.scheduleContainer}>
                      <View style={styles.scheduleRow}>
                        <Ionicons name="calendar-outline" size={14} color="#666" />
                        <Text style={styles.scheduleText}>{clase.class_days}</Text>
                      </View>
                      <View style={styles.scheduleRow}>
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <Text style={styles.scheduleText}>{clase.class_hours}</Text>
                      </View>
                    </View>

                    <View style={styles.detailsRow}>
                      <View style={styles.detailItem}>
                        <Ionicons name="location-outline" size={14} color="#666" />
                        <Text style={styles.detailText}>{clase.class_modality}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="medal-outline" size={14} color="#666" />
                        <Text style={styles.detailText}>{clase.class_credit} U.V</Text>
                      </View>
                    </View>

                    {/* Barra de progreso mejorada */}
                    {claseStats && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>Progreso</Text>
                          <Text style={styles.progressValue}>{claseStats.promedio}%</Text>
                        </View>
                        <ProgressBar
                          progress={parseFloat(claseStats.promedio) / 100}
                          color={header}
                          style={styles.progressBar}
                        />
                      </View>
                    )}

                    {/* Botón de acción mejorado */}
                    <TouchableOpacity 
                      onPress={() => handleModalIdValue(clase)} 
                      style={[styles.actionButton, {backgroundColor: header}]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.actionButtonText, {color: color}]}>
                        Ir a Clase
                      </Text>
                      <Ionicons name="arrow-forward" size={18} color={color} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

      </View>
        <View style={{marginBottom:12, backgroundColor: '#fff'}}></View>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  mainLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: 'poppins-regular',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "poppins-semibold",
    fontSize: 18,
    color: "#333",
    marginLeft: 8,
  },
  linkText: {
    fontFamily: 'poppins-medium',
    fontSize: 14,
    color: '#ffffffff',
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  countText: {
    fontFamily: 'poppins-medium',
    fontSize: 13,
    color: '#2e7d32',
    marginLeft: 6,
  },
  refreshButton: {
    padding: 4,
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
  classesScrollContent: {
    paddingRight: 20,
  },
  classCard: {
    width: 320,
    marginRight: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    height: 8,
    width: '100%',
  },
  headerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontFamily: 'poppins-semibold',
    fontSize: 11,
    color: '#333',
    textTransform: 'uppercase',
  },
  cardImageContainer: {
    width: '100%',
    height: 120,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 16,
  },
  className: {
    fontFamily: 'poppins-semibold',
    fontSize: 20,
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 26,
  },
  classInfoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  infoTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sectionTag: {
    backgroundColor: 'rgba(120, 33, 112, 0.1)',
  },
  classCode: {
    fontFamily: 'poppins-medium',
    fontSize: 12,
    color: '#555',
  },
  classSection: {
    fontFamily: 'poppins-semibold',
    fontSize: 12,
    color: '#782170',
  },
  docenteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  docenteName: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  scheduleContainer: {
    marginBottom: 12,
    gap: 6,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleText: {
    fontFamily: 'poppins-regular',
    fontSize: 13,
    color: '#666',
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontFamily: 'poppins-regular',
    fontSize: 13,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontFamily: 'poppins-medium',
    fontSize: 13,
    color: '#666',
  },
  progressValue: {
    fontFamily: 'poppins-bold',
    fontSize: 14,
    color: '#333',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
  },
});