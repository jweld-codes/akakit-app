import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import EventCards from '../../components/Templates/EventCards';
import { getDocumentCollection } from "../../services/GetDocumentCollection";

export default function Calendario() {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const fetchEventos = async () => {
      const eventosList = await getDocumentCollection("idEventosCollection");
      const futuros = eventosList
        .map(ev => ({
          ...ev,
          fecha: ev.evento_fecha?.toDate?.() || new Date(ev.evento_fecha)
        }))
        .filter(ev => ev.fecha > new Date())
        .sort((a, b) => a.fecha - b.fecha);

      setEventos(futuros);
    };

    fetchEventos();
  }, []);

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
      <FlatList
        scrollEnabled={false}
        data={eventos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCards event={item} />} 
        />
    </View>
  );
}
