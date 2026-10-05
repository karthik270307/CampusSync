import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";
import type { User } from "../types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("campussync_user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("campussync_user");
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("campussync_token")
  );

  const [loading] = useState(false);

  const login = async (
    email: string,
    password: string
  ): Promise<void> => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data.data;

    localStorage.setItem(
      "campussync_token",
      token
    );

    localStorage.setItem(
      "campussync_user",
      JSON.stringify(user)
    );

    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("campussync_token");
    localStorage.removeItem("campussync_user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
