// components/SearchBar.jsx
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';

export default function SearchBar({ value, onChangeText, placeholder = "Buscar eventos..." }) {
  const handleClear = () => {
    onChangeText('');
  };

    const keyboard = useAnimatedKeyboard();
  
    const animatedStyles = useAnimatedStyle(() => ({
      transform: [{ translateY: -keyboard.height.value }],
    }));

  return (
    <View style={styles.container}>
      <Ionicons 
        name="search" 
        size={20} 
        color="#999" 
        style={styles.icon} 
      />
      
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#999"
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      {value.length > 0 && (
        <Animated.TouchableOpacity  onPress={handleClear} style={[styles.clearButton, animatedStyles,]}>
          <Ionicons name="close-circle" size={20} color="#999" />
        </Animated.TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 15,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  clearButton: {
    padding: 4,
  },
});