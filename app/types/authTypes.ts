export interface User {
    id: string;
    nombre: string;
    email: string;
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
  }
  