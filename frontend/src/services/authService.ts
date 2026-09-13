import apiClient from '../api/client';
import type { UserRequest, VerificationCodeRequest, TokenResponse, MessageResponse, RefreshRequest, EmailChangeRequest, User } from '../types';

export class AuthService {
  static async register(credentials: UserRequest): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>('/auth/register', credentials);
    return data;
  }

  static async verifyEmail(body: VerificationCodeRequest): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>('/auth/verify-email', body);
    return data;
  }

  static async login(credentials: UserRequest): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>('/auth/login', credentials);
    return data;
  }

  static async verifyLoginCode(body: VerificationCodeRequest): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>('/auth/verify-login-code', body);
    const tokens = data; // use data directly

    // Store tokens consistently
    localStorage.setItem("scn_token", tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem("scn_refresh_token", tokens.refresh_token);
    }

    // Optionally store user email if needed
    // localStorage.setItem("scn_current_user_email", body.email);

    return tokens;
  }

  static async refresh(body: RefreshRequest): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>('/auth/refresh', body);
    return data;
  }

  static async logout(body: RefreshRequest): Promise<void> {
    await apiClient.post('/auth/logout', body);
    localStorage.removeItem("scn_token");
    localStorage.removeItem("scn_refresh_token");
    localStorage.removeItem("scn_current_user_email");
  }

  static async getCurrentUser(): Promise<User | null> {
    // const { data } = await apiClient.get<User>('/users/me');
    // return data || null;
    try {
      const { data } = await apiClient.get<User>('/users/me');
      return data;
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 404) return null;
      throw err;
    }
  }

  static async requestEmailChange(body: EmailChangeRequest): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>('/auth/request-email-change', body);
    return data;
  }

  static async verifyEmailChange(body: VerificationCodeRequest): Promise<MessageResponse> {

    const { data } = await apiClient.post<MessageResponse>('/auth/verify-email-change', body);
    return data;
  }
}
