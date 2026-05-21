import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthTokens, User } from "@/lib/types";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setTokens(state, action: PayloadAction<AuthTokens>) {
      state.tokens = action.payload;
    },
    clearSession(state) {
      state.user = null;
      state.tokens = null;
    },
    markHydrated(state) {
      state.hydrated = true;
    },
  },
});

export const { setSession, setUser, setTokens, clearSession, markHydrated } = authSlice.actions;
export default authSlice.reducer;
