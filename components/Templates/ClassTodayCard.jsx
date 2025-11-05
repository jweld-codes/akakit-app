import colors from '@/constants/colors';
import global from '@/constants/global';
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import container from '../../constants/container';
import cards from '../../constants/ios/cards';
import ClassModal from '../../modals/ClassModal';

export default function ClassTodayCard({ clase }) {

  const [selectedClass, setselectedClass] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);

  const handleClassPress = (clase) => {
    setselectedClass(clase);
    setShowClassModal(true);
  };

  if (!clase) return null;

  return (
    <View style={container.container}>
      <View style={container.todays_class_cards_container}>
        <View>
          <View style={[global.aside, {left: 15,}]}>
            <View style={[cards.cardUpcomingHeader, {top: 3}]}>

              <View style={[global.centerObjects, {marginRight: 20}]}>
                <Image source={require('../../assets/images/icons/presentation_white_icon.png')}
                style={cards.cardheader_icons_size}
                />
                <Text style={{
                    fontFamily:'poppins-semibold',
                    color: "#c9c9c9ff",
                    top:20,
                    right:7
                }}>Clase de Hoy</Text>
              </View >
            </View>

            <View>
              <View>
                <Text style={{
                    fontFamily:'poppins-bold',
                    fontSize: 20,
                    color: '#e6e8e8ff',
                    flexShrink: 1,
                    flexWrap: 'wrap',
                    width: 250,
                }} numberOfLines={5}>{clase.class_name}</Text>
                <Text style={cards.card_subtitle}>{clase.class_days}</Text>
                <Text style={cards.card_subtitle}>{clase.class_hours}</Text>
                <Text style={cards.card_subtitle}>{clase.class_modality}</Text>
              </View>

              <TouchableOpacity onPress={() => handleClassPress(clase.clase_id)} style={{
                backgroundColor: colors.color_palette_2.pink_soft,
                width:190,
                height: 40,
                right:10,
                borderRadius:10,
                top: 30
                }}><Text style={{
                    textAlign:'center',
                    paddingTop:10,
                    color: colors.color_palette_1.lineArt_Purple,
                    fontFamily: 'poppins-semibold'
                }}>Ver Clase</Text>

                <ClassModal
                visible={showClassModal}
                classIdModal={selectedClass}
                onClose={() => {
                  setShowClassModal(false);
                  setselectedClass(null);
                }}
                
                />

                
                </TouchableOpacity>
            </View>

          </View>

        </View>
      </View>

      
    </View>
  );
}