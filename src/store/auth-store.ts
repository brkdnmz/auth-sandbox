import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
import { create } from "zustand";

type AuthStore = {
  accessToken?: string | null;
  refreshToken?: string | null;
  actions: {
    handleTokens: (accessToken: string, refreshToken: string) => void;
  };
};

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: undefined,
  refreshToken: undefined,
  actions: {
    handleTokens: (accessToken, refreshToken) => {
      saveTokens(accessToken, refreshToken);
      set({ accessToken, refreshToken });
      const decryptedAccessToken = jwt.decode(accessToken, { json: true });
      if (!decryptedAccessToken) return;
    },
  },
}));

export function initalizeAuthStore() {
  const accessToken = loadAccessToken();
  const refreshToken = loadRefreshToken();

  useAuthStore.setState({ accessToken, refreshToken });
}

function saveTokens(accessToken: string, refreshToken: string) {
  //? Chrome caps it to 400 days anyway: https://developer.chrome.com/blog/cookie-max-age-expires/
  const EXPIRES_IN = 1e4; // 10k days

  Cookies.set("access-token", accessToken, { expires: EXPIRES_IN });
  Cookies.set("refresh-token", refreshToken, { expires: EXPIRES_IN });
}

function loadAccessToken() {
  return Cookies.get("access-token");
}

function loadRefreshToken() {
  return Cookies.get("refresh-token");
}
