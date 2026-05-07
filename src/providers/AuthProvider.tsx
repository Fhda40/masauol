import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import { trpc } from "./trpc";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

type AuthUser = {
  id: number;
  name: string;
  email: string;
  picture: string | null;
  consultationUsed: boolean;
};

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>({ user: null, loading: true, logout: () => {} });

export function useAuth() {
  return useContext(AuthContext);
}

function AuthInner({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = trpc.auth.googleLogin.useMutation({
    onSuccess(data) {
      localStorage.setItem("session_token", data.sessionToken);
      setUser(data.user as AuthUser);
      window.location.reload();
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess() {
      localStorage.removeItem("session_token");
      setUser(null);
    },
  });

  useEffect(() => {
    if (!meQuery.isLoading) {
      setUser(meQuery.data as AuthUser ?? null);
      setLoading(false);
    }
  }, [meQuery.isLoading, meQuery.data]);

  function logout() {
    googleLogout();
    logoutMutation.mutate();
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthInner>{children}</AuthInner>
    </GoogleOAuthProvider>
  );
}

export function GoogleLoginButton({ onSuccess }: { onSuccess?: () => void }) {
  const loginMutation = trpc.auth.googleLogin.useMutation({
    onSuccess(data) {
      localStorage.setItem("session_token", data.sessionToken);
      onSuccess?.();
      window.location.reload();
    },
  });

  return (
    <GoogleLogin
      onSuccess={(res) => {
        if (res.credential) loginMutation.mutate({ credential: res.credential });
      }}
      onError={() => console.error("Google login failed")}
      text="signin_with"
      shape="rectangular"
      locale="ar"
      width="300"
    />
  );
}
