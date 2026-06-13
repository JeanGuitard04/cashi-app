import * as SecureStore from "expo-secure-store";
import { createContext, useEffect, useState, type ReactNode } from "react";

import { apiService } from "@/services/api";

const TOKEN_KEY = "authToken";

interface LoginResponse {
  token: string;
}

interface AuthContextValue {
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY)
      .then((stored) => setToken(stored))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiService.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    await SecureStore.setItemAsync(TOKEN_KEY, res.token);
    setToken(res.token);
  };

  const register = async (email: string, password: string) => {
    await apiService.post("/auth/register", { email, password });
    await login(email, password);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
