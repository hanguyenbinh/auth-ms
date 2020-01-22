export interface GoogleTokenInfo {
    azp: string;
    aud: string;
    sub: string;
    scope: string;
    exp: number;
    expires_in: number;
    email: string;
    email_verified: boolean;
    access_type: string;
}
