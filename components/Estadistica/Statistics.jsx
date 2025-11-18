import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import colors from '../../constants/colors';
import { useOverviewData } from '../../context/OverviewDataContext';
import AddPeriodModal from '../../modals/AddPeriodModal';
import { getClassDocumentCollection } from '../../services/GetClassDocumentCollection';
import { getCoprogramaticPoints } from '../../services/GetCoprogramaticPoints';
import { getPeriodDocumentCollection } from '../../services/GetPeriodDocumentCollection';

const { width } = Dimensions.get('window');

export default function Statistics({ onClose }) {
  const router = useRouter();
  
  const [classes, setClasses] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [coprogramaticPoints, setCoprogramaticPoints] = useState({ totalPoints: 0, attendedEvents: 0, totalEvents: 0 });
  const [loading, setLoading] = useState(true);
  
  // Modal de predicción
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [selectedClassForPrediction, setSelectedClassForPrediction] = useState(null);
  const [predictedGrade, setPredictedGrade] = useState('');
  
  // Modal de nuevo período
  const [showNewPeriodModal, setShowNewPeriodModal] = useState(false);
  
  const {
    promedioGrado,
    promedioPeriodoActual,
    sumCreditos,
    tasksValueMetadata,
    refreshData
  } = useOverviewData();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const classList = await getClassDocumentCollection("idClaseCollection");
      const periodList = await getPeriodDocumentCollection("idPeriodoCollection");
      const coproPoints = await getCoprogramaticPoints("idCursoCollection");
      
      setClasses(classList);
      setPeriods(periodList);
      setCoprogramaticPoints(coproPoints);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoading(false);
    }
  };

  // Calcular estadísticas avanzadas
  const calculateStatistics = () => {
    const stats = {
      totalClasses: classes.length,
      completedClasses: classes.filter(c => c.class_enrollment === 'Cursada').length,
      currentClasses: classes.filter(c => c.class_enrollment === 'En Curso').length,
      totalCredits: sumCreditos,
      averageGrade: promedioGrado,
      currentPeriodAverage: promedioPeriodoActual,
    };

    // Clases por año
    const classesByYear = {};
    classes.forEach(cls => {
      const year = cls.class_year || 'Sin año';
      if (!classesByYear[year]) {
        classesByYear[year] = [];
      }
      classesByYear[year].push(cls);
    });

    // Clases por tipo
    const classesByType = {};
    classes.forEach(cls => {
      const type = cls.class_type || 'General';
      if (!classesByType[type]) {
        classesByType[type] = { count: 0, totalGrade: 0, completed: 0 };
      }
      classesByType[type].count++;
      if (cls.class_promedio) {
        classesByType[type].totalGrade += parseFloat(cls.class_promedio);
        classesByType[type].completed++;
      }
    });

    // Calcular promedio por tipo
    Object.keys(classesByType).forEach(type => {
      const data = classesByType[type];
      data.average = data.completed > 0 ? (data.totalGrade / data.completed).toFixed(2) : '0.00';
    });

    return {
      ...stats,
      classesByYear,
      classesByType
    };
  };

  // Predicción de nota final
  const predictFinalGrade = (currentGrade, targetGrade, remainingPercentage = 50) => {
    const current = parseFloat(currentGrade) || 0;
    const target = parseFloat(targetGrade) || 0;
    
    const needed = ((target * 100) - (current * 50)) / remainingPercentage;
    
    const predictions = {
      needed: needed.toFixed(2),
      with50: (current * 0.5 + 25).toFixed(2),
      with70: (current * 0.5 + 35).toFixed(2),
      with80: (current * 0.5 + 40).toFixed(2),
      with90: (current * 0.5 + 45).toFixed(2),
      with100: (current * 0.5 + 50).toFixed(2),
    };

    return predictions;
  };

  // Calcular tendencia de promedios
  const calculateTrend = () => {
    const periodAverages = [];
    
    periods.forEach(period => {
      const periodClasses = classes.filter(c => c.class_period === period.periodo_id);
      const completedInPeriod = periodClasses.filter(c => c.class_promedio && parseFloat(c.class_promedio) > 0);
      
      if (completedInPeriod.length > 0) {
        const sum = completedInPeriod.reduce((acc, cls) => acc + parseFloat(cls.class_promedio), 0);
        const avg = sum / completedInPeriod.length;
        
        periodAverages.push({
          period: `P${period.periodo_id}`,
          average: avg.toFixed(2)
        });
      }
    });

    return periodAverages;
  };

  const stats = calculateStatistics();
  const trend = calculateTrend();

  const renderPredictionModal = () => (
    <Modal
      visible={showPredictionModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPredictionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Predicción de Nota Final</Text>
            <TouchableOpacity onPress={() => setShowPredictionModal(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.instructionText}>
              Ingresa tu nota actual del primer bloque (Parcial I + II)
            </Text>

            <TextInput
              style={styles.predictionInput}
              placeholder="Ej: 45"
              keyboardType="numeric"
              value={predictedGrade}
              onChangeText={setPredictedGrade}
              maxLength={5}
            />

            {predictedGrade && (
              <View style={styles.predictionsContainer}>
                <Text style={styles.predictionSectionTitle}>Escenarios Posibles:</Text>

                {(() => {
                  const predictions = predictFinalGrade(predictedGrade, 100);
                  
                  return (
                    <>
                      <View style={styles.predictionCard}>
                        <View style={styles.predictionHeader}>
                          <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
                          <Text style={styles.predictionLabel}>Si sacas 50% en Bloque 2</Text>
                        </View>
                        <Text style={styles.predictionValue}>{predictions.with50}%</Text>
                        <Text style={styles.predictionSubtext}>Nota Final</Text>
                      </View>

                      <View style={styles.predictionCard}>
                        <View style={styles.predictionHeader}>
                          <Ionicons name="trophy" size={24} color="#ff9800" />
                          <Text style={styles.predictionLabel}>Si sacas 70% en Bloque 2</Text>
                        </View>
                        <Text style={styles.predictionValue}>{predictions.with70}%</Text>
                        {parseFloat(predictions.with70) < 70 && (
                          <Text style={styles.warningText}>
                            ⚠️ Necesitas al menos {(70 - parseFloat(predictions.with70) + 70).toFixed(2)}% en el Bloque 2 para aprobar
                          </Text>
                        )}
                      </View>

                      <View style={styles.predictionCard}>
                        <View style={styles.predictionHeader}>
                          <Ionicons name="star" size={24} color="#ffc107" />
                          <Text style={styles.predictionLabel}>Si sacas 80% en Bloque 2</Text>
                        </View>
                        <Text style={styles.predictionValue}>{predictions.with80}%</Text>
                      </View>

                      <View style={styles.predictionCard}>
                        <View style={styles.predictionHeader}>
                          <Ionicons name="rocket" size={24} color="#9c27b0" />
                          <Text style={styles.predictionLabel}>Si sacas 90% en Bloque 2</Text>
                        </View>
                        <Text style={styles.predictionValue}>{predictions.with90}%</Text>
                      </View>

                      <View style={[styles.predictionCard, styles.perfectCard]}>
                        <View style={styles.predictionHeader}>
                          <Ionicons name="diamond" size={24} color="#fff" />
                          <Text style={[styles.predictionLabel, { color: '#fff' }]}>
                            Si sacas 100% en Bloque 2
                          </Text>
                        </View>
                        <Text style={[styles.predictionValue, { color: '#fff' }]}>
                          {predictions.with100}%
                        </Text>
                        {parseFloat(predictions.with100) === 100 && (
                          <Text style={[styles.predictionSubtext, { color: '#fff' }]}>
                            ¡Perfecto! 🎉
                          </Text>
                        )}
                      </View>

                      <View style={styles.recommendationBox}>
                        <Ionicons name="bulb" size={24} color="#ff9800" />
                        <Text style={styles.recommendationText}>
                          Para aprobar con 70%, necesitas al menos {predictions.needed}% en el Bloque 2
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.color_palette_1.lineArt_Purple} />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => onClose ? onClose() : router.back()} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Estadísticas</Text>
            
            <TouchableOpacity 
              onPress={refreshData}
              style={styles.refreshButton}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Resumen General */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bar-chart" size={24} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.sectionTitle}>Resumen General</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="trophy" size={32} color="#ffa726" />
                <Text style={styles.statValue}>{promedioGrado}%</Text>
                <Text style={styles.statLabel}>Promedio de Graduación</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="trending-up" size={32} color="#66bb6a" />
                <Text style={styles.statValue}>{promedioPeriodoActual}%</Text>
                <Text style={styles.statLabel}>Promedio Actual</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="school" size={32} color="#42a5f5" />
                <Text style={styles.statValue}>{sumCreditos}</Text>
                <Text style={styles.statLabel}>Créditos Totales</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="book" size={32} color="#ab47bc" />
                <Text style={styles.statValue}>{stats.totalClasses}</Text>
                <Text style={styles.statLabel}>Total Clases</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="checkmark-done" size={32} color="#26a69a" />
                <Text style={styles.statValue}>{stats.completedClasses}</Text>
                <Text style={styles.statLabel}>Cursadas</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="star" size={32} color="#ff6b6b" />
                <Text style={styles.statValue}>{coprogramaticPoints.totalPoints}</Text>
                <Text style={styles.statLabel}>Puntos Coprogramáticos</Text>
              </View>
            </View>
          </View>

          {/* Puntos Coprogramáticos Detalle */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star-outline" size={24} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.sectionTitle}>Actividades Coprogramáticas</Text>
            </View>

            <View style={styles.coproCard}>
              <View style={styles.coproHeader}>
                <Ionicons name="trophy" size={40} color="#ff6b6b" />
                <View style={styles.coproInfo}>
                  <Text style={styles.coproValue}>{coprogramaticPoints.totalPoints} pts</Text>
                  <Text style={styles.coproLabel}>Puntos Acumulados</Text>
                </View>
              </View>

              <View style={styles.coproStats}>
                <View style={styles.coproStatItem}>
                  <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
                  <View>
                    <Text style={styles.coproStatValue}>{coprogramaticPoints.attendedEvents}</Text>
                    <Text style={styles.coproStatLabel}>Eventos asistidos</Text>
                  </View>
                </View>

                <View style={styles.coproStatDivider} />

                <View style={styles.coproStatItem}>
                  <Ionicons name="calendar" size={24} color="#2196F3" />
                  <View>
                    <Text style={styles.coproStatValue}>{coprogramaticPoints.totalEvents}</Text>
                    <Text style={styles.coproStatLabel}>Eventos totales</Text>
                  </View>
                </View>
              </View>

              {coprogramaticPoints.totalPoints < 200 && (
                <View style={styles.coproWarning}>
                  <Ionicons name="alert-circle" size={20} color="#ff9800" />
                  <Text style={styles.coproWarningText}>
                    Te faltan {200 - coprogramaticPoints.totalPoints} puntos para completar los requisitos
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Gestión de Períodos */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={24} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.sectionTitle}>Períodos Académicos</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowNewPeriodModal(true)}
              >
                <Ionicons name="add-circle" size={28} color={colors.color_palette_1.lineArt_Purple} />
              </TouchableOpacity>
            </View>

            <Text style={styles.helperText}>
              {periods.length} {periods.length === 1 ? 'período registrado' : 'períodos registrados'}
            </Text>

            {periods.map((period) => {
              const periodClasses = classes.filter(c => c.class_period === period.periodo_id);
              const completedClasses = periodClasses.filter(c => c.class_enrollment === 'Cursada');
              
              return (
                <View key={period.id} style={styles.periodCard}>
                  <View style={styles.periodCardHeader}>
                    <View>
                      <Text style={styles.periodCardTitle}>Período {period.periodo_id}</Text>
                      <Text style={styles.periodCardSubtitle}>Año {period.periodo_curso_anio}</Text>
                    </View>
                    <View style={styles.periodBadge}>
                      <Text style={styles.periodBadgeText}>
                        {completedClasses.length}/{periodClasses.length}
                      </Text>
                    </View>
                  </View>

                  {period.periodo_fecha_inicio && period.periodo_fecha_final && (
                    <View style={styles.periodDates}>
                      <View style={styles.periodDate}>
                        <Ionicons name="calendar-outline" size={14} color="#666" />
                        <Text style={styles.periodDateText}>
                          {new Date(period.periodo_fecha_inicio.seconds * 1000).toLocaleDateString('es-HN', { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                      <Ionicons name="arrow-forward" size={14} color="#999" />
                      <View style={styles.periodDate}>
                        <Ionicons name="calendar-outline" size={14} color="#666" />
                        <Text style={styles.periodDateText}>
                          {new Date(period.periodo_fecha_final.seconds * 1000).toLocaleDateString('es-HN', { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Predicción de Notas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics" size={24} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.sectionTitle}>Predicción de Notas</Text>
            </View>

            <TouchableOpacity
              style={styles.predictionButton}
              onPress={() => setShowPredictionModal(true)}
            >
              <Ionicons name="calculator" size={24} color="#fff" />
              <Text style={styles.predictionButtonText}>Calcular Predicción</Text>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.helperText}>
              Calcula tu nota final según diferentes escenarios del segundo bloque
            </Text>
          </View>

          {/* Clases por Año */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={24} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.sectionTitle}>Clases por Año</Text>
            </View>

            {Object.entries(stats.classesByYear).map(([year, classList]) => (
              <View key={year} style={styles.yearCard}>
                <View style={styles.yearHeader}>
                  <Text style={styles.yearTitle}>Año {year}</Text>
                  <Text style={styles.yearCount}>{classList.length} clases</Text>
                </View>
                
                <View style={styles.yearProgress}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${(classList.filter(c => c.class_enrollment === 'Cursada').length / classList.length) * 100}%` 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {classList.filter(c => c.class_enrollment === 'Cursada').length} / {classList.length} completadas
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Estadísticas por Tipo de Clase */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="layers" size={24} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.sectionTitle}>Por Tipo de Clase</Text>
            </View>

            {Object.entries(stats.classesByType).map(([type, data]) => (
              <View key={type} style={styles.typeCard}>
                <View style={styles.typeHeader}>
                  <Text style={styles.typeName}>{type}</Text>
                  <Text style={styles.typeAverage}>{data.average}%</Text>
                </View>
                <View style={styles.typeStats}>
                  <Text style={styles.typeDetail}>{data.count} clases</Text>
                  <Text style={styles.typeDetail}>{data.completed} completadas</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Tendencia de Promedios */}
          {trend.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trending-up" size={24} color={colors.color_palette_1.lineArt_Purple} />
                <Text style={styles.sectionTitle}>Tendencia de Promedios</Text>
              </View>

              <View style={styles.trendContainer}>
                {trend.map((item, index) => (
                  <View key={index} style={styles.trendItem}>
                    <Text style={styles.trendPeriod}>{item.period}</Text>
                    <View style={styles.trendBar}>
                      <View 
                        style={[
                          styles.trendFill,
                          { 
                            width: `${item.average}%`,
                            backgroundColor: parseFloat(item.average) >= 70 ? '#4caf50' : '#ff9800'
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.trendValue}>{item.average}%</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Objetivos y Metas */}
          <View style={[styles.section, { marginBottom: 40 }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flag" size={24} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.sectionTitle}>Objetivos</Text>
            </View>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Ionicons name="heart" size={24} color="#4caf50" />
                <Text style={styles.goalTitle}>Meta de Graduación</Text>
              </View>
              <Text style={styles.goalValue}>80%</Text>
              <View style={styles.goalProgress}>
                <View style={styles.goalProgressBar}>
                  <View 
                    style={[
                      styles.goalProgressFill,
                      { width: `${(promedioGrado / 80) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.goalProgressText}>
                  {promedioGrado >= 80 ? '¡Meta alcanzada! 🎉' : `Faltan ${(80 - promedioGrado).toFixed(2)}%`}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {renderPredictionModal()}
        
        <AddPeriodModal
          visible={showNewPeriodModal}
          onClose={() => setShowNewPeriodModal(false)}
          onPeriodAdded={fetchData}
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
    fontSize: 24,
    fontFamily: 'poppins-bold',
    color: '#fff',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },

  // Section
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    color: '#333',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (325 - 34) / 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'poppins-bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },

  // Prediction Button
  predictionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  predictionButtonText: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Year Cards
  yearCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  yearHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  yearTitle: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#333',
  },
  yearCount: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#666',
  },
  yearProgress: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#666',
  },

  // Type Cards
  typeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeName: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#333',
  },
  typeAverage: {
    fontSize: 18,
    fontFamily: 'poppins-bold',
    color: colors.color_palette_1.lineArt_Purple,
  },
  typeStats: {
    flexDirection: 'row',
    gap: 16,
  },
  typeDetail: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
  },

  // Trend
  trendContainer: {
    gap: 12,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendPeriod: {
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    color: '#333',
    width: 40,
  },
  trendBar: {
    flex: 1,
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  trendFill: {
    height: '100%',
    borderRadius: 12,
  },
  trendValue: {
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    color: '#333',
    width: 50,
    textAlign: 'right',
  },

  // Goal Card
  goalCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#333',
  },
  goalValue: {
    fontSize: 32,
    fontFamily: 'poppins-bold',
    color: '#4caf50',
    marginBottom: 12,
  },
  goalProgress: {
    gap: 8,
  },
  goalProgressBar: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 6,
  },
  goalProgressText: {
    fontSize: 13,
    fontFamily: 'poppins-medium',
    color: '#666',
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
    maxHeight: '90%',
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
  instructionText: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  predictionInput: {
    borderWidth: 2,
    borderColor: colors.color_palette_1.lineArt_Purple,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontFamily: 'poppins-bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  predictionsContainer: {
    gap: 12,
  },
  predictionSectionTitle: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 12,
  },
  predictionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.color_palette_1.lineArt_Purple,
  },
  perfectCard: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    borderLeftColor: '#fff',
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  predictionLabel: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: '#666',
  },
  predictionValue: {
    fontSize: 28,
    fontFamily: 'poppins-bold',
    color: colors.color_palette_1.lineArt_Purple,
    marginVertical: 4,
  },
  predictionSubtext: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#999',
  },
  warningText: {
    fontSize: 12,
    fontFamily: 'poppins-medium',
    color: '#ff9800',
    marginTop: 8,
    lineHeight: 16,
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: '#333',
    lineHeight: 20,
  },

  // Coprogramatic Points
  coproCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
  },
  coproHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  coproInfo: {
    flex: 1,
  },
  coproValue: {
    fontSize: 32,
    fontFamily: 'poppins-bold',
    color: '#ff6b6b',
  },
  coproLabel: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginTop: 2,
  },
  coproStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  coproStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coproStatValue: {
    fontSize: 20,
    fontFamily: 'poppins-bold',
    color: '#333',
  },
  coproStatLabel: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#666',
  },
  coproStatDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  coproWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 12,
  },
  coproWarningText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'poppins-medium',
    color: '#ff9800',
    lineHeight: 18,
  },

  // Period Cards
  addButton: {
    marginLeft: 'auto',
  },
  periodCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.color_palette_1.lineArt_Purple,
  },
  periodCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodCardTitle: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#333',
  },
  periodCardSubtitle: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginTop: 2,
  },
  periodBadge: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  periodBadgeText: {
    fontSize: 14,
    fontFamily: 'poppins-bold',
    color: '#fff',
  },
  periodDates: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  periodDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  periodDateText: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
  },
});