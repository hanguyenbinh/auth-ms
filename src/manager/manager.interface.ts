export interface ManagerRegisterInput {
    email: string;
    password: string;
    phoneNumber: string;
    companyName: string;
}
export interface ManagerGoogleRegisterInput {
    email: string;
    password: string;
    phoneNumber: string;
    companyName: string;
    isGoogleAccount: boolean;
}

export interface ManagerFacebookRegisterInput {
    email: string;
    password: string;
    phoneNumber: string;
    companyName: string;
    isFacebookAccount: boolean;
}

export interface ManagerRegisterResponse {
    id: string;
    email: string;
    phoneNumber: string;
    companyName: string;
}
export interface ManagerRepositoryResult {
    code: number;
    message: string;
    result: any;
}
export interface ManagerChangePasswordInput {
    id: string;
    currentPassword: string;
    newPassword: string;
}

export interface ManagerRecoveryPasswordInput {
    email: string;
    recoveryUrl: string;
}

export interface ManagerRecoveryPasswordConfirmInput {
    changePasswordHash: string;
    newPassword: string;
}
