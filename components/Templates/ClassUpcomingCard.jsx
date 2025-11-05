import colors from '@/constants/colors';
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import container from '../../constants/container';
import global from '../../constants/global';
import cards from '../../constants/ios/cards';

export default function ClassUpcomingCard({ clase, subtitle }) {
  if (!clase) return null;

  return (
    <View style={container.container}>
        <View style={container.upcoming_class_cards_container}>
        <View>
            <View style={global.aside}>
              <View style={cards.cardUpcomingHeader}>
                <View style={[global.centerObjects, {marginRight: 20}]}>
                  <Image source={require('../../assets/images/icons/video_camera_white_icon.png')}
                  style={cards.cardheader_icons_size}
                  />
                  <Text style={{
                      fontFamily:'poppins-semibold',
                      color: "#ffffffff",
                      top:20,
                      marginRight: 20
                  }}>{subtitle}</Text>
                </View >
              </View>

              <View>
                <View style={{right: 15}}>
                    <Text style={{
                        fontFamily:'poppins-bold',
                        fontSize: 20,
                        color: '#fff',
                        flexShrink: 1,
                        flexWrap: 'wrap',
                        width: 250,
                    }} numberOfLines={5}>{clase.class_name}</Text>
                  <Text style={cards.card_subtitle}>{clase.class_days}</Text>
                  <Text style={cards.card_subtitle}>{clase.class_hours}</Text>
                  <Text style={cards.card_subtitle}>{clase.class_modality}</Text>
                </View>

                <TouchableOpacity onPress={() => Linking.openURL(clase.class_url_access)} style={{
                    backgroundColor: '#fff',
                    width:180,
                    height: 40,
                    right:10,
                    borderRadius:12,
                    top: 30
                    }}><Text style={{
                        textAlign:'center',
                        paddingTop:10,
                        color: colors.color_palette_1.lineArt_Purple,
                        fontFamily: 'poppins-semibold'
                    }}>Entrar a la Sala</Text>
                </TouchableOpacity>
              </View>
            </View>

        </View>
      </View>
    </View>
  );
}