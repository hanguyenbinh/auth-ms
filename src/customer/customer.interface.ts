export interface CustomerRegisterInput {
    email: string;
    password: string;
    phoneNumber: string;
    companyName: string;
}
export interface CustomerRegisterResponse {
    code: number;
    message: string;
    error: any;
    result: any;
}
export interface CustomerRepositoryResult {
    code: number;
    message: string;
    result: any;
}
