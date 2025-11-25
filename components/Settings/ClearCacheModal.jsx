import { Ionicons } from '@expo/vector-icons';
import { collection, deleteDoc, getDocs } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from '../../config/firebaseConfig';
import colors from '../../constants/colors';

const COLLECTIONS = [
  { id: 'idClaseCollection', name: 'Clases', icon: 'book-outline' },
  { id: 'idCursoCollection', name: 'Cursos', icon: 'school-outline' },
  { id: 'idDocentesCollection', name: 'Docentes', icon: 'people-outline' },
  { id: 'idEventosCollection', name: 'Eventos', icon: 'calendar-outline' },
  { id: 'idFlujogramaClases', name: 'Flujograma', icon: 'git-network-outline' },
  { id: 'idPeriodoCollection', name: 'Períodos', icon: 'time-outline' },
  { id: 'idRecursosCollection', name: 'Recursos', icon: 'folder-outline' },
  { id: 'idTareasCollection', name: 'Tareas', icon: 'checkbox-outline' },
];

export default function ClearCacheModal({ visible, onClose }) {
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState({});

  // Alternar selección de colección
  const toggleCollection = (collectionId) => {
    if (selectedCollections.includes(collectionId)) {
      setSelectedCollections(selectedCollections.filter(id => id !== collectionId));
    } else {
      setSelectedCollections([...selectedCollections, collectionId]);
    }
  };

  // Seleccionar todas las colecciones
  const selectAll = () => {
    if (selectedCollections.length === COLLECTIONS.length) {
      setSelectedCollections([]);
    } else {
      setSelectedCollections(COLLECTIONS.map(c => c.id));
    }
  };

  // Eliminar documentos de una colección
  const deleteCollectionDocuments = async (collectionId) => {
    try {
      const collectionRef = collection(db, collectionId);
      const snapshot = await getDocs(collectionRef);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      return {
        success: true,
        count: snapshot.docs.length
      };
    } catch (error) {
      console.error(`Error eliminando ${collectionId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Confirmar y ejecutar eliminación
  const handleClearCache = () => {
    if (selectedCollections.length === 0) {
      Alert.alert('Atención', 'Por favor selecciona al menos una colección');
      return;
    }

    const collectionNames = selectedCollections
      .map(id => COLLECTIONS.find(c => c.id === id)?.name)
      .join(', ');

    Alert.alert(
      '⚠️ Confirmar Eliminación',
      `¿Estás seguro de eliminar todos los documentos de:\n\n${collectionNames}\n\nEsta acción no se puede deshacer.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: executeDelete
        }
      ]
    );
  };

  // Ejecutar la eliminación
  const executeDelete = async () => {
    setIsDeleting(true);
    setDeletionStatus({});

    let totalDeleted = 0;
    const status = {};

    for (const collectionId of selectedCollections) {
      const collectionName = COLLECTIONS.find(c => c.id === collectionId)?.name;
      
      // Actualizar estado mientras se procesa
      setDeletionStatus(prev => ({
        ...prev,
        [collectionId]: { status: 'processing', name: collectionName }
      }));

      const result = await deleteCollectionDocuments(collectionId);
      
      status[collectionId] = {
        name: collectionName,
        status: result.success ? 'success' : 'error',
        count: result.count,
        error: result.error
      };

      if (result.success) {
        totalDeleted += result.count;
      }

      setDeletionStatus({ ...status });
    }

    setIsDeleting(false);

    // Mostrar resumen
    setTimeout(() => {
      const successCount = Object.values(status).filter(s => s.status === 'success').length;
      const failedCount = Object.values(status).filter(s => s.status === 'error').length;

      Alert.alert(
        'Limpieza Completada',
        `✅ ${successCount} colecciones limpiadas\n❌ ${failedCount} fallidas\n📄 ${totalDeleted} documentos eliminados`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedCollections([]);
              setDeletionStatus({});
              onClose();
            }
          }
        ]
      );
    }, 500);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Limpiar Caché</Text>
            <TouchableOpacity onPress={onClose} disabled={isDeleting}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalDescription}>
            Selecciona las colecciones que deseas limpiar. Esto eliminará todos los documentos de forma permanente.
          </Text>

          {/* Botón Seleccionar Todo */}
          <TouchableOpacity 
            style={styles.selectAllButton}
            onPress={selectAll}
            disabled={isDeleting}
          >
            <Ionicons 
              name={selectedCollections.length === COLLECTIONS.length ? "checkbox" : "square-outline"} 
              size={24} 
              color={colors.color_palette_1.lineArt_Purple} 
            />
            <Text style={styles.selectAllText}>Seleccionar todas</Text>
          </TouchableOpacity>

          {/* Lista de Colecciones */}
          <ScrollView style={styles.collectionList} showsVerticalScrollIndicator={false}>
            {COLLECTIONS.map((col) => {
              const isSelected = selectedCollections.includes(col.id);
              const status = deletionStatus[col.id];

              return (
                <TouchableOpacity
                  key={col.id}
                  style={[
                    styles.collectionItem,
                    isSelected && styles.collectionItemSelected,
                    status && styles.collectionItemProcessing
                  ]}
                  onPress={() => toggleCollection(col.id)}
                  disabled={isDeleting}
                  activeOpacity={0.7}
                >
                  <View style={styles.collectionLeft}>
                    <View style={[
                      styles.collectionIconContainer,
                      isSelected && styles.collectionIconSelected
                    ]}>
                      <Ionicons 
                        name={col.icon} 
                        size={24} 
                        color={isSelected ? colors.color_palette_1.lineArt_Purple : '#666'} 
                      />
                    </View>
                    <View style={styles.collectionInfo}>
                      <Text style={[
                        styles.collectionName,
                        isSelected && styles.collectionNameSelected
                      ]}>
                        {col.name}
                      </Text>
                      <Text style={styles.collectionId}>{col.id}</Text>
                      {status && (
                        <Text style={[
                          styles.statusText,
                          status.status === 'success' && styles.statusSuccess,
                          status.status === 'error' && styles.statusError
                        ]}>
                          {status.status === 'processing' && '⏳ Procesando...'}
                          {status.status === 'success' && `✅ ${status.count} docs eliminados`}
                          {status.status === 'error' && '❌ Error'}
                        </Text>
                      )}
                    </View>
                  </View>

                  {status?.status === 'processing' ? (
                    <ActivityIndicator size="small" color={colors.color_palette_1.lineArt_Purple} />
                  ) : (
                    <Ionicons 
                      name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                      size={28} 
                      color={isSelected ? colors.color_palette_1.lineArt_Purple : '#ccc'} 
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Botones de Acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isDeleting}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.deleteButton,
                (selectedCollections.length === 0 || isDeleting) && styles.deleteButtonDisabled
              ]}
              onPress={handleClearCache}
              disabled={selectedCollections.length === 0 || isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.deleteButtonText}>
                    Limpiar ({selectedCollections.length})
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'poppins-bold',
    color: '#333',
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: colors.color_palette_1.lineArt_Purple + '10',
    borderRadius: 12,
    marginBottom: 15,
  },
  selectAllText: {
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: colors.color_palette_1.lineArt_Purple,
  },
  collectionList: {
    maxHeight: 400,
    marginBottom: 20,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  collectionItemSelected: {
    backgroundColor: colors.color_palette_1.lineArt_Purple + '10',
    borderColor: colors.color_palette_1.lineArt_Purple,
  },
  collectionItemProcessing: {
    opacity: 0.7,
  },
  collectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  collectionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  collectionIconSelected: {
    backgroundColor: colors.color_palette_1.lineArt_Purple + '20',
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 2,
  },
  collectionNameSelected: {
    color: colors.color_palette_1.lineArt_Purple,
  },
  collectionId: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#999',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'poppins-medium',
    marginTop: 4,
  },
  statusSuccess: {
    color: '#27ae60',
  },
  statusError: {
    color: '#e74c3c',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    gap: 8,
  },
  deleteButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
});