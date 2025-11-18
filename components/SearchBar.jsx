// components/SearchBar.jsx
import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const SearchBar = ({ 
  value, 
  onChangeText, 
  placeholder = "Buscar...",
  autoFocus = false,
  style,
  inputStyle
}) => {
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={[styles.searchBar, style]}>
      <Ionicons name="search" size={20} color="#999" />
      <TextInput
        style={[styles.searchInput, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        autoCapitalize="words"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
        >
          <Ionicons name="close-circle" size={20} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'poppins-regular',
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar;