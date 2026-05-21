"use client";

import { useEffect } from "react";
import { loadAuth, saveAuth } from "@/lib/authStorage";
import { authApi } from "@/store/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { markHydrated, setSession, setUser } from "@/store/slices/authSlice";

export default function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function bootstrap() {
      const auth = loadAuth();
      if (auth) {
        dispatch(setSession({ user: auth.user, tokens: auth.tokens }));
        try {
          const user = await dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true })).unwrap();
          dispatch(setUser(user));
          saveAuth(user, auth.tokens);
        } catch {
          // keep cached session when /auth/me is unavailable
        }
      }
      dispatch(markHydrated());
    }

    bootstrap();
  }, [dispatch]);

  return null;
}
