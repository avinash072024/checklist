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

export interface VerifyRegistrationOTPPayload {
    identifier?: string;
    email?: string;
    mobileNumber?: string | number;
    otp: string;
}

export interface ResendRegistrationOTPPayload {
    identifier?: string;
    email?: string;
    mobileNumber?: string | number;
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

export interface UpdateProfilePayload {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: number;
}

export interface DeleteAccountPayload {
    password: string;
}

export interface UserProfile {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: number;
    isVerified?: boolean;
    iat?: number;
    exp?: number;
    createdAt?: string;
}

export interface ProfileResponse {
    success: boolean;
    message?: string;
    data: UserProfile;
    token?: string;
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