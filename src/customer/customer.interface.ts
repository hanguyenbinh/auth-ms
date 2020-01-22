export interface CustomerRegisterInput {
    email: string;
    password: string;
    phoneNumber: string;
    companyName: string;
}
export interface CustomerGoogleRegisterInput {
    email: string;
    password: string;
    phoneNumber: string;
    companyName: string;
    isGoogleAccount: boolean;
}

export interface CustomerRegisterResponse {
    error?: any;
    result?: any;
}
export interface CustomerRepositoryResult {
    code: number;
    message: string;
    result: any;
}
