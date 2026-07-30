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

export interface ForgotPasswordPayload {
    identifier: string;
}

export interface VerifyOTPPayload {
    identifier: string;
    otp: string;
}

export interface ResetPasswordPayload {
    identifier: string;
    otp: string;
    newPassword: string;
}

export interface ChangePasswordPayload {
    currentPassword?: string;
    newPassword: string;
    otp?: string;
}

// Response Interfaces
export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
    data?: {
        email: string | null;
        mobileNumber: string | null;
    };
}