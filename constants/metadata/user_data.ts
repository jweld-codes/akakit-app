export interface UserType {
    id: number;
    avatar: string;
    firstName: string;
    middleName: string;
    lastName1: string;
    lastName2: string;
    accountNumber: string;
    state: string;
    email: string;
    career: string;
}

export const USER_METADATA: UserType[] = [
    {
        id: 1,
        avatar: '../../assets/images/avatars/1739031396143.png',
        firstName: "Jennifer",
        middleName: "Jemima",
        lastName1: "Miranda",
        lastName2: "Weld",
        accountNumber: "3250263",
        state: "Activo",
        email: "3250263@usap.edu",
        career: "Ingenieria Analítica de Datos e Inteligencia de Negocios"
    }
];