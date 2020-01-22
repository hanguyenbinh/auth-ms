export interface CustomerLoginInput {
    customerName: string;
    password: string;
}
interface CustomerLoginResult {
    accessToken: string;
}
export interface CustomerLoginResponse {
    code: number;
    message: string;
    result: CustomerLoginResult;
}

export interface CustomerGoogleLoginInput {
    email: string;
    accessToken: string;
}
