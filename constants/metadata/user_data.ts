export interface UserType {
    id: number;
    firstName: string;
    middleName: string;
    lastName1: string;
    lastName2: string;
    accountNumber: string;
    state: string;
}

export const USER_METADATA: UserType[] = [
    {
        id: 1,
        firstName: "Jennifer",
        middleName: "Jemima",
        lastName1: "Miranda",
        lastName2: "Weld",
        accountNumber: "3250263",
        state: "Activo",
    }
];