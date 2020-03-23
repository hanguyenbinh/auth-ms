export interface ManagerLoginInput {
    email: string;
    password: string;
}
interface ManagerLoginResult {
    accessToken: string;
}
export interface ManagerLoginResponse {
    code?: number;
    message?: string;
    result?: ManagerLoginResult;
}

export interface GoogleLoginInput {
    email: string;
    token: string;
}

export interface FacebookLoginInput {
    id: string;
    name: string;
    email: string;
    token: string;
}

export interface CheckTokenInput {
    accessToken: string;
}

export interface CheckRecoveryPasswordHashInput {
    token: string;
}