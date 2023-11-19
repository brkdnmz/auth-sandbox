import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
import { create } from "zustand";
import { api } from "~/trpc/server";
import { sessionUserSchema, type SessionUser } from "~/types";

type AuthStore = {
  currentUser?: SessionUser;
  accessToken?: string | null;
  refreshToken?: string | null;
  actions: {
    handleTokens: (accessToken: string, refreshToken: string) => void;
  };
};

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: undefined,
  accessToken: undefined,
  refreshToken: undefined,
  actions: {
    handleTokens: (accessToken, refreshToken) => {
      saveTokens(accessToken, refreshToken);
      set({ accessToken, refreshToken });
      const decryptedAccessToken = jwt.decode(accessToken, { json: true });
      if (!decryptedAccessToken) return;
      const user = sessionUserSchema.parse(decryptedAccessToken.user);
      set({ currentUser: user });
    },
  },
}));

export async function initalizeAuthStore() {
  const accessToken = loadAccessToken();
  const refreshToken = loadRefreshToken();

  try {
    const user = await api.auth.getSession.query();
    useAuthStore.setState({ accessToken, refreshToken, currentUser: user });
  } catch (e) {}
}

function saveTokens(accessToken: string, refreshToken: string) {
  Cookies.set("access-token", accessToken);
  Cookies.set("refresh-token", refreshToken);
}

function loadAccessToken() {
  return Cookies.get("access-token");
}

function loadRefreshToken() {
  return Cookies.get("refresh-token");
}
