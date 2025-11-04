// components/EventCard.jsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../constants/colors';
import { formatEventDate, getDaysUntilEvent } from '../../services/GetUpcomingEvents';

export default function EventCard({ evento }) {
  const router = useRouter();

  const handlePress = () => {
    // Navegar a la pantalla de detalle del evento
    router.push(`/events/${evento.id}`);
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Imagen del evento */}
      {evento.evento_img_url && evento.evento_img_url !== "N/A" ? (
        <Image 
          source={{ uri: evento.evento_img_url }} 
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.cardImage, styles.placeholderImage]}>
          <Ionicons name="calendar" size={40} color="#ccc" />
        </View>
      )}

      {/* Badge de días restantes */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {getDaysUntilEvent(evento.evento_fecha_date)}
        </Text>
      </View>

      {/* Contenido */}
      <View style={styles.cardContent}>
        {/* Tipo de evento */}
        {evento.evento_tipo && evento.evento_tipo !== "N/A" && (
          <View style={styles.typeContainer}>
            <Text style={styles.typeText}>{evento.evento_tipo}</Text>
          </View>
        )}

        {/* Título */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {evento.evento_titulo}
        </Text>

        {/* Fecha y hora */}
        <View style={styles.dateContainer}>
          <Ionicons 
            name="time-outline" 
            size={16} 
            color={colors.color_palette_4.lineArt_grey} 
          />
          <Text style={styles.dateText}>
            {formatEventDate(evento.evento_fecha_date)}
          </Text>
        </View>

        {/* Modalidad */}
        {evento.evento_lugar && (
          <View style={styles.locationContainer}>
            <Ionicons 
              name={evento.evento_lugar === "Virtual" ? "videocam-outline" : "location-outline"} 
              size={16} 
              color={colors.color_palette_4.lineArt_grey} 
            />
            <Text style={styles.locationText}>{evento.evento_lugar}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    marginRight: 15,
    backgroundColor: '#f0eeeeff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 15,
  },
  typeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6f3ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0066cc',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    lineHeight: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
});