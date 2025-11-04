import colors from "../colors"

export default{
    headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  headerrow_twotexts_onelink:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    
  },

  headerText: {
    color: '#fff',
    fontFamily: 'poppins-bold',
    fontSize: 25,
  },

  title: {
    fontSize: 22,
    fontFamily: 'poppins-bold',
    color: colors.color_palette_1.lineArt_Purple,
  },

  linkButton: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
  },

  linkText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    textAlign: 'center',
  },
}