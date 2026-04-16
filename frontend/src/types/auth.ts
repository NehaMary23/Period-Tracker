// Shared types for authentication APIs
export interface SignupResponse {
  token: string;
  user?: {
    id: number;
    email: string;
    username?: string;
  };
}
