import colors from "../colors"

export default{
    rowPie: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },

    statBarProCard: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 20,
    },
    
    statBarProAvance: { backgroundColor: '#07ff02ff', borderRadius:40, width:140},
    statBarProMiss: { backgroundColor: '#fff', borderRadius:40, width: 260},
    statBarProTitle: { color: '#fff', fontSize: 14, marginBottom: 5},
    statBarProNumber: { color: '#fff', fontSize: 16 },

    statPieCard: {
        backgroundColor: '#ded5dfff',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 20,
        alignItems: 'center',
        width: "48%",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    
    statPieTitle: { color: colors.color_palette_1.lineArt_Purple, fontSize: 14, marginBottom: 5, textAlign: 'center' },
    statPieNumber: { color: colors.color_palette_1.lineArt_Purple, fontWeight:'bold', fontSize: 28, marginBottom: 5 },
    statPieSubtitle: { color: '#4a4949ff', fontSize: 12, marginTop: 'auto', textAlign: 'center' },
    statPieLegendProcess: { backgroundColor: colors.color_palette_2.pink_darker, height:10, width: 10, flexDirection:'row', justifyContent:'center' },
    statPieLegendFinish: { backgroundColor: colors.color_palette_2.lineArt_Blue, height:10, width: 10},
    
    statCard: {
        backgroundColor: colors.color_palette_1.lineArt_Purple,
        paddingVertical: 20,
        paddingHorizontal: 25,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 15,
    },

    statTitle: { color: '#fff', fontSize: 16, marginBottom: 5 },
    statNumber: { color: '#fff', fontSize: 36 },
    statSubtitle: { color: '#e0e0e0', fontSize: 14, marginTop: 5 },

    statEnrollCard:{
        backgroundColor: colors.color_palette_1.lineArt_Purple,
        paddingVertical: 25,
        paddingHorizontal: 25,
        borderRadius: 20,
        alignItems: 'center',
    },

    statEnrollCardTitle:{color: '#fff', fontSize: 16, marginBottom: 5},
    
    
}