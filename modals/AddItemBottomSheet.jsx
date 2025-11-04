// components/Modals/AddItemBottomSheet.jsx
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../constants/colors';

export default function AddItemBottomSheet({ isVisible, onClose }) {
  const bottomSheetRef = useRef(null);
  const router = useRouter();
  const snapPoints = useMemo(() => ['25%', '35%'], []);

  const handleSheetChanges = (index) => {
    if (index === -1) {
      onClose();
    }
  };

  const handleAddEvent = () => {
    onClose();
    router.push('/QADir/Eventos/AddEventScreen');
  };

  const handleAddTask = () => {
    onClose();
    router.push('/QADir/Tareas/AddTaskScreen');
  };

  if (!isVisible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>¿Qué deseas crear?</Text>

        {/* Opción: Agregar Evento */}
        <TouchableOpacity 
          style={styles.option}
          onPress={handleAddEvent}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#e8f4fd' }]}>
            <Ionicons 
              name="calendar" 
              size={24} 
              color={colors.color_palette_1.lineArt_Purple} 
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Nuevo Evento</Text>
            <Text style={styles.optionDescription}>Webinar, taller o conferencia</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* Opción: Agregar Tarea */}
        <TouchableOpacity 
          style={styles.option}
          onPress={handleAddTask}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#fef3e8' }]}>
            <Ionicons 
              name="checkbox" 
              size={24} 
              color="#f39c12" 
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Nueva Tarea</Text>
            <Text style={styles.optionDescription}>Asignación o entrega</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  handleIndicator: {
    backgroundColor: '#ddd',
    width: 40,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: '#999',
  },
});