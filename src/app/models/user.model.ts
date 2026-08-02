export interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    mobileNumber: number;
    isVerified?: boolean;
    iat?: number;
    exp?: number;
    createdAt?: string;
}
