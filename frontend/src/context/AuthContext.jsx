import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as authService from "../services/api/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const result = await authService.refreshSession();
        if (result) setUser(result.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
    }
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, []);

  const loginAsOwner = useCallback(async (email, password) => {
    const result = await authService.ownerLogin(email, password);
    setUser(result.user);
    return result.user;
  }, []);

  const loginAsAdmin = useCallback(async (email, password) => {
    const result = await authService.adminLogin(email, password);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, loginAsOwner, loginAsAdmin, logout }),
    [user, isLoading, loginAsOwner, loginAsAdmin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
