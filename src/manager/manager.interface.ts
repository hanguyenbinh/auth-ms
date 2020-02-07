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
