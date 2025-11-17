import { View } from 'react-native';
import Cursos from '../../components/Curso/Cursos';
import UtilsTabTopBlack from '../../components/Templates/UtilsTabTopBlack';
import '../global.css';

export default function Curso() {
  return (
    <View style={{flex: 1}}>
        <UtilsTabTopBlack />
        <Cursos />
    </View>
  )
}