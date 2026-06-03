export interface AuthResponse {
  statusCode: number;
  status: string;
  message: string;
  data: {
    _id: string;
    username: string;
    role: string[];
    token: string;
  };
}
