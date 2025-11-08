import { View } from 'react-native';
import Task from '../../components/Tasks/Task';
import Header from '../../components/Templates/Header';
import UtilsTabTopBlack from '../../components/Templates/UtilsTabTopBlack';
import '../global.css';

export default function Tareas() {
  return (
    <View style={{flex: 1}}>
        <UtilsTabTopBlack />
        <Header />
        <Task />
    </View>
  )
}