import { ScrollView, View } from 'react-native';
import Cursos from '../../components/Curso/Cursos';
import Header from '../../components/Templates/Header';
import '../global.css';
export default function Curso() {
  return (
    <View>
      <ScrollView 
        contentContainerStyle={{ paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <Cursos />

      </ScrollView>
    </View>
  )
}