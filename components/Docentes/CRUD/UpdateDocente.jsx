import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    updateDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from "../../../config/firebaseConfig";
import colors from "../../../constants/colors";

export default function UpdateDocente() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const teacherId = params.teacherId;

  const [docId, setDocId] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [profFullName, setProfFullName] = useState("");
  const [profEmail, setProfEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profRating, setProfRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadProfessorData();
  }, [teacherId]);

  const loadProfessorData = async () => {
    try {
      const q = query(collection(db, "idDocentesCollection"));
      const snapshot = await getDocs(q);
      
      const teacherDoc = snapshot.docs.find(
        doc => doc.data().docente_id === teacherId
      );

      if (teacherDoc) {
        const data = teacherDoc.data();
        setDocId(teacherDoc.id); 
        setProfessorId(data.docente_id);
        setProfFullName(data.docente_fullName);
        setProfEmail(data.email);
        setPhoneNumber(data.phone_number);
        setProfRating(data.rating);
      } else {
        Alert.alert("Error", "No se encontró el docente");
        router.back();
      }
    } catch (error) {
      console.error("Error al cargar docente:", error);
      Alert.alert("Error", "No se pudieron cargar los datos del docente");
      router.back();
    } finally {
      setLoadingData(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{8}$/;
    return phoneRegex.test(phone);
  };

  const validateRating = (rating) => {
    if (!rating) return true; 
    const num = parseFloat(rating);
    return !isNaN(num) && num >= 0 && num <= 5;
  };

  const handleUpdateProfessor = async () => {
    // Validaciones
    if (!profFullName.trim()) {
      Alert.alert("Campo Requerido", "Por favor ingresa el nombre completo del docente");
      return;
    }

    if (!profEmail.trim()) {
      Alert.alert("Campo Requerido", "Por favor ingresa el correo del docente");
      return;
    }

    if (!validateEmail(profEmail)) {
      Alert.alert("Correo Inválido", "Por favor ingresa un correo válido sin espacios ni @");
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Campo Requerido", "Por favor ingresa el número de teléfono");
      return;
    }

    if (!validatePhone(phoneNumber)) {
      Alert.alert("Teléfono Inválido", "Por favor ingresa un número de teléfono válido (8 dígitos)");
      return;
    }

    if (profRating && !validateRating(profRating)) {
      Alert.alert("Calificación Inválida", "La calificación debe ser un número entre 0 y 5");
      return;
    }

    setLoading(true);

    try {
      const docRef = doc(db, "idDocentesCollection", docId);
      
      await updateDoc(docRef, {
        docente_fullName: profFullName.trim(),
        email: profEmail.trim(),
        phone_number: phoneNumber.trim(),
        rating: profRating ? parseFloat(profRating) : 0
      });

      Alert.alert(
        "✅ Actualizado", 
        "Los datos del docente fueron actualizados correctamente",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error("❌ Error al actualizar el docente:", error);
      Alert.alert("Error", "No se pudo actualizar el docente. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfessor = () => {
    Alert.alert(
      "⚠️ Eliminar Docente",
      `¿Estás seguro que deseas eliminar a ${profFullName}? Esta acción no se puede deshacer.`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "idDocentesCollection", docId);
      await deleteDoc(docRef);

      Alert.alert(
        "✅ Eliminado", 
        "El docente fue eliminado correctamente",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error("❌ Error al eliminar docente:", error);
      Alert.alert("Error", "No se pudo eliminar el docente. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.color_palette_1.lineArt_Purple} />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={colors.color_palette_1.lineArt_Purple} 
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Editar Docente</Text>
            <Text style={styles.headerSubtitle}>ID: {professorId}</Text>
          </View>

          <TouchableOpacity 
            onPress={handleDeleteProfessor}
            style={styles.deleteButton}
            disabled={loading}
          >
            <Ionicons 
              name="trash-outline" 
              size={24} 
              color="#ff4444" 
            />
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Nombre Completo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nombre Completo <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons 
                name="person-outline" 
                size={20} 
                color="#999" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ej: Juan Carlos Pérez"
                value={profFullName}
                onChangeText={setProfFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Correo Institucional <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.emailContainer}>
              <View style={[styles.inputContainer, styles.emailInput]}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color="#999" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="juan.perez"
                  value={profEmail}
                  onChangeText={setProfEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.emailDomain}>
                <Text style={styles.emailDomainText}>@usap.edu</Text>
              </View>
            </View>
          </View>

          {/* Teléfono */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Teléfono <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons 
                name="call-outline" 
                size={20} 
                color="#999" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="+50499887766"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={8}
              />
            </View>
          </View>

          {/* Calificación */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Calificación (Opcional)
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons 
                name="star-outline" 
                size={20} 
                color="#999" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="4.5"
                value={profRating}
                onChangeText={setProfRating}
                keyboardType="decimal-pad"
                maxLength={3}
              />
              <Text style={styles.ratingHint}>/ 5.0</Text>
            </View>
            <Text style={styles.helperText}>
              Ingresa un valor entre 0 y 5
            </Text>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons 
              name="information-circle" 
              size={20} 
              color={colors.color_palette_1.lineArt_Purple}
            />
            <Text style={styles.infoText}>
              Los cambios se guardarán inmediatamente al presionar "Actualizar"
            </Text>
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleUpdateProfessor}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Actualizar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Zona Peligrosa</Text>
          <Text style={styles.dangerZoneDescription}>
            Eliminar este docente es permanente y no se puede deshacer. 
            Todas las referencias a este docente en las clases se mantendrán.
          </Text>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleDeleteProfessor}
            disabled={loading}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.dangerButtonText}>Eliminar Docente</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'poppins-regular',
    color: '#666',
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'poppins-bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Form Card
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Input Groups
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#ff4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'poppins-regular',
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#999',
    marginTop: 5,
    marginLeft: 5,
  },

  // Email específico
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emailInput: {
    flex: 1,
  },
  emailDomain: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailDomainText: {
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },

  // Rating
  ratingHint: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#999',
    marginLeft: 5,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.color_palette_1.lineArt_Purple + '30',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#666',
  },
  saveButton: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    shadowColor: colors.color_palette_1.lineArt_Purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },

  // Danger Zone
  dangerZone: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#ff444420',
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontFamily: 'poppins-bold',
    color: '#ff4444',
    marginBottom: 8,
  },
  dangerZoneDescription: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  dangerButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
});