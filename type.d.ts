import { Models } from "react-native-appwrite";



interface CreateClassParams {
    classname: string;
    class_section: string;
    class_days: string;
    class_hours: string;
    class_modality: string;
    class_credit: number;
    class_docente: number;
    class_promedio: number;
    class_recurso: string;
    class_comments: string;
    class_curso: number;
    class_type: string;
}

interface CreateCourseParams {
    curso_periodo: string;
    curso_fecha_inicio: Date;
    curso_fecha_final: Date;
    curso_promedio_final: number;
    class_modality: string;
}

interface CreateTeacherParams {
    docente_name: string;
    docente_email: string;
    docente_rating: number;
    docente_comments: number;
}

interface ExamenClassParams {
    ec_parcial: string;
    ec_type: string;
    ec_porcentaje: number;
    ec_id_class: number;
}

interface CreateExamParams {
    exam_titulo: string;
    exam_fecha: date;
    exam_valor_final: number;
    exam_id_ec: number;
}

interface CreateExamParams {
    tarea_titulo: string;
    tarea_descripcion: string;
    tarea_fecha_entrega: Date;
    tarea_id_class: number;
    valor_tarea: number;
    valor_final: number;
}

interface UserParams {
    user_first_name: string;
    user_last_name: string;
    user_email: string;
    user_account_number: string;
    user_date_of_birth: Date;
}


export interface MenuItem extends Models.Document {
    name: string;
    price: number;
    image_url: string;
    description: string;
    calories: number;
    protein: number;
    rating: number;
    type: string;
}

export interface Category extends Models.Document {
    name: string;
    description: string;
}

export interface User extends Models.Document {
    name: string;
    email: string;
    avatar: string;
}

export interface CartCustomization {
    id: string;
    name: string;
    price: number;
    type: string;
}

export interface CartItemType {
    id: string; // menu item id
    name: string;
    price: number;
    image_url: string;
    quantity: number;
    customizations?: CartCustomization[];
}

export interface CartStore {
    items: CartItemType[];
    addItem: (item: Omit<CartItemType, "quantity">) => void;
    removeItem: (id: string, customizations: CartCustomization[]) => void;
    increaseQty: (id: string, customizations: CartCustomization[]) => void;
    decreaseQty: (id: string, customizations: CartCustomization[]) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

interface TabBarIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
    title: string;
}

interface PaymentInfoStripeProps {
    label: string;
    value: string;
    labelStyle?: string;
    valueStyle?: string;
}

interface CustomButtonProps {
    onPress?: () => void;
    title?: string;
    style?: string;
    leftIcon?: React.ReactNode;
    textStyle?: string;
    isLoading?: boolean;
}

interface CustomHeaderProps {
    title?: string;
}

interface CustomInputProps {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    label: string;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

interface ProfileFieldProps {
    label: string;
    value: string;
    icon: ImageSourcePropType;
}