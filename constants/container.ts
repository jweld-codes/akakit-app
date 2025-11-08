import colors from "../constants/colors";
export default{
    /* In Use
        Overview
        Task Card
        ClaseCards
        ClassUpcomingCard
        ClassTodayCard
    */
    container: { 
        paddingHorizontal: 20,
        backgroundColor: '#fff' 
    },

    //Class Cards - Clases
    classes_container: { 
        paddingHorizontal: 20,
        backgroundColor: '#fff' 
    },

    //Todays Class Cards - Overview
    cards_container: {
        paddingHorizontal: 40,
        marginBottom: 15,
    },

    upcoming_class_cards_container: {
        right: 16,
        paddingVertical: 55,
        paddingHorizontal: 25,
        borderRadius: 10,
        width: 330,
        height: 270,
        backgroundColor: '#2E7D32'
    },

    todays_class_cards_container: {
        backgroundColor: colors.color_palette_1.lineArt_Purple,
        paddingHorizontal: 10,
        paddingVertical: 40,
        width: 343,
        height: 270,
        right:16,
        marginBottom: 25,
        borderRadius: 10,
    },

    //
    main_center:{
        flex:1,
        justifyContent: 'space-between',
        alignItems: 'center'
    }
}