import colors from "../colors";

export default{
  /* In Use
    Task Card
    ClaseCards
    ClassUpcomingCard
  */
    card: {
    backgroundColor:'#e6fadeff',
    padding: 15,
    marginBottom: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
    width:315
  },
  
  cardHeader:{
    backgroundColor: colors.color_palette_4.negocio_green,
    left: -15,
    bottom: 15,
    borderTopStartRadius:10,
    borderTopEndRadius:10,
    width: 315,
    height: 30
  },

  cardHeaderImage:{
    width: "100%",
    marginBottom: 10,
    borderRadius: 10,
  },

  cardheader_icons_size: {
    width: 30,
    height: 30,
    top: 12,
    right: 8
  },

  cardfooter:{
    borderTopWidth: 1,
    borderTopColor: colors.color_palette_2.pink_gray,
    marginBottom: 12,
    paddingTop: 10
  },
  
  cardfootertext:{
    color: colors.color_palette_4.lineArt_grey,
  },

  cardUpcomingClassCard: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    right: 25,
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 20,
    width: 330,
    height: 270
  },

  cardUpcomingHeader: {
    bottom: 20,
    paddinTop: 10,
    borderTopStartRadius:10,
    borderTopEndRadius:10,
    height: 30
  },

  cardEnrollClassCard: {
    backgroundColor: colors.color_palette_1.orange_darker,
    right: 25,
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 20,
    width: 330,
    height: 270
  },

  cardEnrollHeader: {
    bottom: 20,
    paddinTop: 10,
    borderTopStartRadius:10,
    borderTopEndRadius:10,
    height: 30
  },

  title: {
    fontFamily: "poppins-bold",
    fontSize: 18,
    marginBottom: 5,
  },

  title_event: {
    fontFamily: "poppins-bold",
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'justify'
  },

  card_subtitle: {
    fontSize: 14, 
    fontFamily:'poppins-regular',
    color: "#c9c9c9ff",
  },

   card_subtitle_event: {
    fontSize: 14, 
    fontFamily:'poppins-regular',
    color: colors.color_palette_4.lineArt_grey,
  },

  description: {
    fontFamily: "poppins-regular",
    fontSize: 14,
    color: "#555",
    marginTop: 6,
    height: 100
  },

  info: {
    fontFamily: "poppins-medium",
    fontSize: 13,
    color: "#777",
  },

  estado_pendiente: {
    marginTop: 5,
    fontFamily: "poppins-bold",
    fontSize: 14,
    color: "#fb2b2bff",
  },
}