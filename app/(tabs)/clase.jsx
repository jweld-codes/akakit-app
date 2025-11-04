import { useCallback, useState } from 'react';
import { View } from 'react-native';
import Clases from '../../components/Clases/Clases';
import Header from '../../components/Templates/Header';
import UtilsTabTopBlack from '../../components/Templates/UtilsTabTopBlack';
//import ClassModal from '../../components/Clases/ClassModal';

import ClassModal from '../../modals/ClassModal';
import '../global.css';

export default function clase() {
  const [showClassModal, setShowClassModal] = useState(false);
  const [classIdModal, setClassIdModal] = useState(null);

  const handleOpenClassModal = useCallback(() => {
      setShowClassModal(true);
    }, []);

  const handleCloseClassModal = useCallback(() => {
      setShowClassModal(false);
    }, []);

      const handleModalIdPress = useCallback((claseId) => {
      //console.log('ID recibido en handleModalIdPress:', claseId); // Debug
      setClassIdModal(claseId);
      setShowClassModal(true);
    }, []);
  return (
    <View>
      <UtilsTabTopBlack />
        <Header />
        <Clases
          onModalPress={handleModalIdPress}
         />
        <ClassModal
          visible={showClassModal}
          classIdModal ={classIdModal}
          onClose={handleCloseClassModal}
        />

    </View>
  )
}