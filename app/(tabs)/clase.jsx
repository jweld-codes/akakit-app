import { useCallback, useState } from 'react';
import { View } from 'react-native';
import Clases from '../../components/Clases/Clases';
import AddTask from '../../components/Home/CRUD/AddTask';
import Header from '../../components/Templates/Header';
import UtilsTabTopBlack from '../../components/Templates/UtilsTabTopBlack';
import ClassModal from '../../modals/ClassModal';

export default function Clase() {
  const [showClassModal, setShowClassModal] = useState(false);
  const [classIdModal, setClassIdModal] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);

  const handleModalIdPress = useCallback((claseId) => {
    setClassIdModal(claseId);
    setShowClassModal(true);
  }, []);

  const handleCloseClassModal = useCallback(() => {
    setShowClassModal(false);
  }, []);

  const handleOpenAddTask = useCallback(() => {
    setShowAddTask(true);
  }, []);

  const handleCloseAddTask = useCallback(() => {
    setShowAddTask(false);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <UtilsTabTopBlack />
      <Header />

      <Clases onModalPress={handleModalIdPress} />

      <ClassModal
        visible={showClassModal}
        classIdModal={classIdModal}
        onClose={handleCloseClassModal}
        onAddTask={handleOpenAddTask}
      />

      {showAddTask && (
        <AddTask
          onClose={handleCloseAddTask}
        />
      )}
    </View>
  );
}
