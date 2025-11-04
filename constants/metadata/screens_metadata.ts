export interface ScreenType{
    id: number;
    screen_name: string;
    display_name: string;
}

export const SCREEN_METADATA: ScreenType[] = [
    {
        id:1,
        screen_name: "OverView",
        display_name: "Dashboard"
    },

    {
        id:2,
        screen_name: "Clases",
        display_name: "Class"
    },

    {
        id:3,
        screen_name: "Cursos",
        display_name: "Course"
    },

    {
        id:4,
        screen_name: "AddClass",
        display_name: "Creat New Class"
    }
]