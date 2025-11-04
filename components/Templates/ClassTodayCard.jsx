import colors from '@/constants/colors';
import global from '@/constants/global';
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import container from '../../constants/container';
import cards from '../../constants/ios/cards';

export default function ClassTodayCard({ clase }) {
  if (!clase) return null;

  return (
    <View style={container.container}>
      
      <View style={container.cards_container}>
        <View style={container.cards_grid}>
          <View style={[cards.cardUpcomingClassCard, global.aside]}>

            <View style={cards.cardUpcomingHeader}>
              <View style={[global.centerObjects, {marginRight: 20}]}>
                <Image source={require('../../assets/images/icons/presentation_white_icon.png')}
                style={cards.cardheader_icons_size}
                />
                <Text style={{
                    fontFamily:'poppins-semibold',
                    color: "#c9c9c9ff",
                    top:20,
                    right:10
                }}>Today class</Text>
              </View >
            </View>

            <View>
              <View style={{right: 10}}>
              <Text style={{
                  fontFamily:'poppins-bold',
                  fontSize: 20,
                  color: '#fff',
              }} numberOfLines={2}>{clase.class_name}</Text>
              <Text style={cards.card_subtitle}>{clase.class_days}</Text>
              <Text style={cards.card_subtitle}>{clase.class_hours}</Text>
              <Text style={cards.card_subtitle}>{clase.class_modality}</Text>
              </View>

              <TouchableOpacity onPress={() => Linking(clase.class_url_access)} style={{
                backgroundColor: colors.color_palette_2.pink_soft,
                width:170,
                height: 40,
                right:10,
                borderRadius:20,
                top: 30
                }}><Text style={{
                    textAlign:'center',
                    paddingTop:10,
                    color: colors.color_palette_1.lineArt_Purple,
                    fontFamily: 'poppins-semibold'
                }}>Ver Clase</Text>
                </TouchableOpacity>
            </View>

          </View>
        </View>
      </View>
    </View>
  );
}