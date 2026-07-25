// Request Interfaces
export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: number;
    password: string;
}

export interface SignInPayload {
    mobileNumber: number;
    password: string;
}

// Response Interfaces
export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
}